import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
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
import { v4 as uuidv4 } from 'uuid';

interface BillingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBilling: (billing: BillingRecord) => void;
}

export interface BillingRecord {
  id: string;
  service: string;
  date: string;
  cost: number;
  paid: boolean;
  paidAmount: number;
  unpaidAmount: number;
  payment_method?: string;
  notes?: string;
}

enum FormStep {
  BILLING_DETAILS,
  PAYMENT_STATUS,
  PARTIAL_PAYMENT
}

const BillingForm: React.FC<BillingFormProps> = ({ isOpen, onClose, onAddBilling }) => {
  const [service, setService] = useState('');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [payment_method, setpayment_method] = useState('');
  const [notes, setNotes] = useState('');
  const [formStep, setFormStep] = useState<FormStep>(FormStep.BILLING_DETAILS);
  const [unpaidAmount, setUnpaidAmount] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showPartialDialog, setShowPartialDialog] = useState(false);
  const { toast } = useToast();

  // Reset form when dialog is opened or closed
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setService('');
    setCost('');
    setDate(new Date().toISOString().split('T')[0]);
    setpayment_method('');
    setNotes('');
    setFormStep(FormStep.BILLING_DETAILS);
    setUnpaidAmount('');
    setShowPaymentDialog(false);
    setShowPartialDialog(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!service || !cost) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Validate cost is a number
    const costValue = parseFloat(cost);
    if (isNaN(costValue) || costValue <= 0) {
      toast({
        title: "Invalid Cost",
        description: "Please enter a valid positive number for the cost",
        variant: "destructive",
      });
      return;
    }
    
    // Proceed to payment status selection
    setFormStep(FormStep.PAYMENT_STATUS);
    setShowPaymentDialog(true);
  };

  const handlePaymentStatus = (isPaid: boolean) => {
    setShowPaymentDialog(false);
    
    if (isPaid) {
      // It's fully paid
      const totalCost = parseFloat(cost);
      if (!isNaN(totalCost)) {
        createBillingRecord(true, totalCost, 0);
      } else {
        toast({
          title: "Invalid Cost",
          description: "Please enter a valid number for the cost",
          variant: "destructive",
        });
        setFormStep(FormStep.BILLING_DETAILS);
      }
    } else {
      // Show partial payment dialog
      setFormStep(FormStep.PARTIAL_PAYMENT);
      setShowPartialDialog(true);
      // Initialize unpaid amount with the full cost for convenience
      setUnpaidAmount(cost);
    }
  };

  const handlePartialPayment = () => {
    setShowPartialDialog(false);
    
    const totalCost = parseFloat(cost);
    
    if (isNaN(totalCost)) {
      toast({
        title: "Invalid Cost",
        description: "Please enter a valid number for the cost",
        variant: "destructive",
      });
      setFormStep(FormStep.BILLING_DETAILS);
      return;
    }
    
    // Parse unpaid amount, default to full cost if invalid
    let unpaid = parseFloat(unpaidAmount);
    
    // If unpaid is not a valid number, assume full amount is unpaid
    if (isNaN(unpaid)) {
      unpaid = totalCost;
    }
    
    // Validate unpaid amount
    if (unpaid > totalCost) {
      toast({
        title: "Validation Error",
        description: "Unpaid amount cannot exceed the total cost",
        variant: "destructive",
      });
      setShowPartialDialog(true);
      return;
    }
    
    // Calculate paid amount based on unpaid amount
    const paid = totalCost - unpaid;
    createBillingRecord(unpaid === 0, paid, unpaid);
  };

  const createBillingRecord = (isPaid: boolean, paidAmount: number, unpaidAmount: number) => {
    const totalCost = parseFloat(cost);
    
    if (isNaN(totalCost)) {
      toast({
        title: "Invalid Cost",
        description: "Please enter a valid number for the cost",
        variant: "destructive",
      });
      return;
    }
    
    const newBilling: BillingRecord = {
      id: uuidv4(),
      service,
      date,
      cost: totalCost,
      paid: isPaid,
      paidAmount,
      unpaidAmount,
      payment_method: payment_method || 'N/A',
      notes
    };
    
    onAddBilling(newBilling);
    
    toast({
      title: "Billing Record Added",
      description: `A new billing record for ${service} has been added.`,
    });
    
    resetForm();
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          resetForm();
          onClose();
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Add Billing Record</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="service" className="required">Service</Label>
              <Input
                id="service"
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="Enter service description"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="required">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cost" className="required">Cost</Label>
              <Input
                id="cost"
                type="number"
                min="0.01"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select value={payment_method} onValueChange={setpayment_method}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about the payment"
                rows={3}
              />
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => {
                resetForm();
                onClose();
              }}>Cancel</Button>
              <Button type="submit" className="bg-medical-600 hover:bg-medical-700">Continue</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Status Dialog */}
      <AlertDialog open={showPaymentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Payment Status</AlertDialogTitle>
            <AlertDialogDescription>
              Has this bill been paid or will it be paid later?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handlePaymentStatus(true)}
            >
              Paid
            </AlertDialogAction>
            <AlertDialogAction 
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => handlePaymentStatus(false)}
            >
              Unpaid
            </AlertDialogAction>
            <AlertDialogCancel onClick={() => {
              setShowPaymentDialog(false);
              setFormStep(FormStep.BILLING_DETAILS);
            }}>
              Back
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Partial Payment Dialog */}
      <AlertDialog open={showPartialDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Payment Details</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the amount that is still unpaid.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="unpaidAmount">Unpaid Amount</Label>
              <Input
                id="unpaidAmount"
                type="number"
                min="0"
                step="0.01"
                value={unpaidAmount}
                onChange={(e) => setUnpaidAmount(e.target.value)}
                placeholder={cost}
              />
              <p className="text-sm text-gray-500">
                Leave empty or enter the total cost if fully unpaid.
              </p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowPartialDialog(false);
              setFormStep(FormStep.PAYMENT_STATUS);
              setShowPaymentDialog(true);
            }}>
              Back
            </AlertDialogCancel>
            <AlertDialogAction onClick={handlePartialPayment}>
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BillingForm;