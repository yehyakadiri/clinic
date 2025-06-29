import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, DollarSign, Plus, CreditCard, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BillingForm, { BillingRecord } from '@/components/BillingForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PatientService } from '@/api/patientService';
import { format } from 'date-fns';

const Billing = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showPartialUpdateDialog, setShowPartialUpdateDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BillingRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(''); // Changed from unpaidAmount to paymentAmount
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!patientId) return;
      
      try {
        const [patientData, billingData] = await Promise.all([
          PatientService.getPatientById(patientId),
          PatientService.getBillingRecords(patientId)
        ]);
        
        setPatient(patientData);
        setBillingRecords(billingData.map(record => ({
          ...record,
          cost: Number(record.cost),
          paidAmount: Number(record.paid_amount),
          unpaidAmount: Number(record.unpaid_amount)
        })));
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load patient and billing data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [patientId, toast]);

  const totalBilled = billingRecords.reduce((total, record) => {
    return total + (Number(record.cost) || 0);
  }, 0);
  
  const totalPaid = billingRecords.reduce((total, record) => {
    return total + (Number(record.paidAmount) )|| 0;
  }, 0);
  
  const totalUnpaid = billingRecords.reduce((total, record) => {
    return total + (Number(record.unpaidAmount) )|| 0;
  }, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleAddBilling = async (newBilling: BillingRecord) => {
    try {
      const createdRecord = await PatientService.addBillingRecord(patientId!, {
        service: newBilling.service,
        date: newBilling.date,
        cost: Number(newBilling.cost),
        paid: newBilling.paid,
        paid_amount: Number(newBilling.paidAmount),
        unpaid_amount: Number(newBilling.unpaidAmount),
        payment_method: newBilling.paymentMethod,
        notes: newBilling.notes
      });
      
      setBillingRecords(prev => [{
        ...createdRecord,
        id: createdRecord.id,
        cost: Number(createdRecord.cost),
        paidAmount: Number(createdRecord.paid_amount),
        unpaidAmount: Number(createdRecord.unpaid_amount)
      }, ...prev]);
      
      toast({
        title: "Success",
        description: "Billing record added successfully",
      });
    } catch (error) {
      console.error('Error adding billing record:', error);
      toast({
        title: "Error",
        description: "Failed to add billing record",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePayment = (record: BillingRecord) => {
    setSelectedRecord(record);
    setPaymentAmount(''); // Reset payment amount input
    setShowUpdateDialog(true);
  };

  const handlePaymentStatus = async (isPaid: boolean) => {
    setShowUpdateDialog(false);
    
    if (!selectedRecord) return;
    
    try {
      const totalCost = Number(selectedRecord.cost);
      const paidAmount = isPaid ? totalCost : 0;
      const unpaidAmount = isPaid ? 0 : totalCost;
      
      const updatedRecord = await PatientService.updateBillingRecord(selectedRecord.id, {
        paid: isPaid,
        paid_amount: paidAmount,
        unpaid_amount: unpaidAmount
      });
      
      setBillingRecords(prev => 
        prev.map(record => 
          record.id === selectedRecord.id ? {
            ...record,
            paid: isPaid,
            paidAmount,
            unpaidAmount
          } : record
        )
      );
      
      toast({
        title: "Payment Updated",
        description: isPaid 
          ? "The bill has been marked as fully paid." 
          : "The bill has been marked as unpaid.",
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    }
  };

  const handlePartialPaymentUpdate = async () => {
    setShowPartialUpdateDialog(false);
    
    if (!selectedRecord) return;
    
    try {
      const totalCost = Number(selectedRecord.cost);
      const currentPaid = Number(selectedRecord.paidAmount) || 0;
      const maxPayment = totalCost - currentPaid;
      const paymentNow = paymentAmount ? parseFloat(paymentAmount) : 0;
      
      // Validate the payment amount
      if (isNaN(paymentNow) ){
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid payment amount",
          variant: "destructive",
        });
        return;
      }

      if (paymentNow <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Payment amount must be greater than 0",
          variant: "destructive",
        });
        return;
      }

      if (paymentNow > maxPayment) {
        toast({
          title: "Invalid Amount",
          description: `Payment cannot exceed ${formatCurrency(maxPayment)}`,
          variant: "destructive",
        });
        return;
      }

      // Calculate new totals
      const newPaid = currentPaid + paymentNow;
      const newUnpaid = totalCost - newPaid;
      const isFullyPaid = newUnpaid <= 0;

      // Update the database
      const updatedRecord = await PatientService.updateBillingRecord(selectedRecord.id, {
        paid: isFullyPaid,
        paid_amount: newPaid,
        unpaid_amount: newUnpaid,
        payment_method: selectedRecord.paymentMethod
      });
      
      // Update the UI state
      setBillingRecords(prev => 
        prev.map(record => 
          record.id === selectedRecord.id ? {
            ...record,
            paid: isFullyPaid,
            paidAmount: newPaid,
            unpaidAmount: newUnpaid
          } : record
        )
      );
      
      // Show appropriate toast message
      if (isFullyPaid) {
        toast({
          title: "Payment Complete",
          description: `Payment of ${formatCurrency(paymentNow)} recorded. Bill is now fully paid.`,
        });
      } else {
        toast({
          title: "Partial Payment Recorded",
          description: `Payment of ${formatCurrency(paymentNow)} received. Remaining balance: ${formatCurrency(newUnpaid)}`,
        });
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    }
  };

  const handleGenerateInvoice = (recordId: string) => {
    toast({
      title: "Invoice Generated",
      description: "The invoice has been generated and is ready for download.",
    });
  };

  if (loading) {
    return (
      <PageLayout title="Loading...">
        <div className="text-center py-8">Loading billing information...</div>
      </PageLayout>
    );
  }

  if (!patient) {
    return (
      <PageLayout title="Patient Not Found">
        <div className="text-center py-8">
          <p>The patient you're looking for doesn't exist or has been removed.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Billing Management" 
      subtitle={`Patient: ${patient.full_name}`}
      rightContent={
        <Button 
          className="bg-medical-600 hover:bg-medical-700"
          onClick={() => setIsFormOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Billing
        </Button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="clinic-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Billed</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBilled)}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <DollarSign className="h-6 w-6 text-blue-700" />
            </div>
          </div>
        </Card>

        <Card className="clinic-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Unpaid</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalUnpaid)}</p>
            </div>
            <div className="rounded-full bg-orange-100 p-3">
              <Receipt className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="clinic-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Paid</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="clinic-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Unpaid</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {billingRecords.length > 0 ? (
              billingRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Receipt className="h-4 w-4 text-gray-400 mr-2" />
                      {record.service}
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{formatCurrency(Number(record.cost))}</TableCell>
                  <TableCell>{formatCurrency(Number(record.paidAmount))}</TableCell>
                  <TableCell>{formatCurrency(Number(record.unpaidAmount))}</TableCell>
                  <TableCell>{record.paymentMethod || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={record.paid ? "default" : "outline"} 
                      className={record.paid ? "bg-green-100 text-green-800 hover:bg-green-100" : 
                               record.paidAmount > 0 ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" : 
                               "text-orange-500 border-orange-200"}
                    >
                      {record.paid ? 'Paid' : record.paidAmount > 0 ? 'Partially Paid' : 'Unpaid'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {(!record.paid || record.unpaidAmount > 0) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-orange-600 border-orange-200 mr-2"
                        onClick={() => handleUpdatePayment(record)}
                      >
                        <CreditCard className="h-3 w-3 mr-1" />
                        Update Payment
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-medical-600 border-medical-200"
                      onClick={() => handleGenerateInvoice(record.id)}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Generate Invoice
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No billing records found for this patient
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      
      <BillingForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onAddBilling={handleAddBilling}
      />

      <AlertDialog open={showUpdateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Payment Status</AlertDialogTitle>
            <AlertDialogDescription>
              How would you like to update the payment status?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handlePaymentStatus(true)}
            >
              Mark as Fully Paid
            </AlertDialogAction>
            <AlertDialogAction 
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => {
                setShowUpdateDialog(false);
                setShowPartialUpdateDialog(true);
              }}
            >
              Record Partial Payment
            </AlertDialogAction>
            <AlertDialogCancel onClick={() => setShowUpdateDialog(false)}>
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showPartialUpdateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Record Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Enter payment amount for: <strong>{selectedRecord?.service}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="totalCost">Total Cost</Label>
                <Input
                  id="totalCost"
                  type="text"
                  value={formatCurrency(Number(selectedRecord?.cost))}
                  disabled
                />
              </div>
              
              <div>
                <Label htmlFor="paidAmount">Amount Already Paid</Label>
                <Input
                  id="paidAmount"
                  type="text"
                  value={formatCurrency(Number(selectedRecord?.paidAmount))}
                  disabled
                />
              </div>
              
              <div>
                <Label htmlFor="currentPayment" className="required">
                  Payment Amount
                </Label>
                <Input
                  id="currentPayment"
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={Number(selectedRecord?.cost) - Number(selectedRecord?.paidAmount)}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder={`Enter amount to pay (max ${formatCurrency(Number(selectedRecord?.cost) - Number(selectedRecord?.paidAmount))})`}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter the amount being paid now. The system will calculate the new balance.
                </p>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowPartialUpdateDialog(false);
              setShowUpdateDialog(true);
            }}>
              Back
            </AlertDialogCancel>
            <AlertDialogAction onClick={handlePartialPaymentUpdate}>
              Record Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default Billing;