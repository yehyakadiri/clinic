import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { PatientService } from '@/api/patientService';
import { Plus, Syringe, Pencil, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Vaccination {
  id: string;
  name: string;
  alternatives?: string;
  dose: string;
  child_age: string;
  date_administered: string;
  notes?: string;
}

const Vaccinations = () => {
  const { patientId } = useParams();
  const { toast } = useToast();
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [vaccinationToDelete, setVaccinationToDelete] = useState<string | null>(null);
  const [currentVaccination, setCurrentVaccination] = useState<Vaccination | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    alternatives: '',
    dose: '',
    child_age: '',
    date_administered: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!patientId) return;
      
      try {
        const [patientData, vaccinationsData] = await Promise.all([
          PatientService.getPatientById(patientId),
          PatientService.getVaccinations(patientId)
        ]);
        
        setPatient(patientData);
        setVaccinations(vaccinationsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch patient data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId, toast]);

  const resetForm = () => {
    setFormData({
      name: '',
      alternatives: '',
      dose: '',
      child_age: '',
      date_administered: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setCurrentVaccination(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleEditClick = (vaccination: Vaccination) => {
    setCurrentVaccination(vaccination);
    setFormData({
      name: vaccination.name,
      alternatives: vaccination.alternatives || '',
      dose: vaccination.dose,
      child_age: vaccination.child_age,
      date_administered: vaccination.date_administered.split('T')[0],
      notes: vaccination.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientId) return;
    
    try {
      // Validate form data
      if (!formData.name || !formData.dose || !formData.child_age || !formData.date_administered) {
        toast({
          title: "Missing fields",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }
      
      const vaccinationData = {
        name: formData.name,
        alternatives: formData.alternatives || null,
        dose: formData.dose,
        child_age: formData.child_age,
        date_administered: formData.date_administered,
        notes: formData.notes || null
      };

      if (currentVaccination) {
        // Update existing vaccination
        const updatedVaccination = await PatientService.updateVaccination(
          currentVaccination.id,
          vaccinationData
        );
        
        setVaccinations(prev => prev.map(v => 
          v.id === currentVaccination.id ? updatedVaccination : v
        ));
      } else {
        // Add new vaccination
        const newVaccination = await PatientService.addVaccination(
          patientId,
          vaccinationData
        );
        
        setVaccinations(prev => [newVaccination, ...prev]);
      }
      
      setIsModalOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: `Vaccination ${currentVaccination ? 'updated' : 'added'} successfully`,
      });
    } catch (error) {
      console.error('Error saving vaccination:', error);
      toast({
        title: "Error",
        description: `Failed to ${currentVaccination ? 'update' : 'add'} vaccination`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (vaccinationId: string) => {
    setVaccinationToDelete(vaccinationId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!vaccinationToDelete) return;
    
    try {
      await PatientService.deleteVaccination(vaccinationToDelete);
      
      setVaccinations(prev => prev.filter(v => v.id !== vaccinationToDelete));
      
      toast({
        title: "Success",
        description: "Vaccination deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting vaccination:', error);
      toast({
        title: "Error",
        description: "Failed to delete vaccination",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setVaccinationToDelete(null);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Loading...">
        <div className="text-center py-8">Loading patient data...</div>
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
      title="Vaccination Management"
      subtitle={`Patient: ${patient.full_name}`}
      rightContent={
        <Dialog 
          open={isModalOpen} 
          onOpenChange={(open) => {
            if (!open) resetForm();
            setIsModalOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-medical-600 hover:bg-medical-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New Vaccine
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {currentVaccination ? 'Edit Vaccine' : 'Add New Vaccine'}
              </DialogTitle>
              <DialogDescription>
                {currentVaccination 
                  ? 'Update the details of this vaccination' 
                  : 'Record details of the administered vaccine.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Vaccine Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., MMR, DTaP"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alternatives">Alternatives</Label>
                <Input
                  id="alternatives"
                  name="alternatives"
                  value={formData.alternatives}
                  onChange={handleInputChange}
                  placeholder="e.g., MMRV, Rotateq"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dose">Dose <span className="text-red-500">*</span></Label>
                <Input
                  id="dose"
                  name="dose"
                  value={formData.dose}
                  onChange={handleInputChange}
                  placeholder="e.g., First, Second, Booster"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="child_age">Child's Age <span className="text-red-500">*</span></Label>
                <Input
                  id="child_age"
                  name="child_age"
                  value={formData.child_age}
                  onChange={handleInputChange}
                  placeholder="e.g., 6 months, 1 year"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date_administered">Date Administered <span className="text-red-500">*</span></Label>
                <Input
                  id="date_administered"
                  name="date_administered"
                  type="date"
                  value={formData.date_administered}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Doctor's Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any reactions or observations"
                />
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-medical-600 hover:bg-medical-700">
                  {currentVaccination ? 'Update' : 'Save'} Vaccine
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      
      
      <div className="mb-6">
        <h2 className="section-title flex items-center">
          <Syringe className="h-5 w-5 mr-2" />
          List of Administered Vaccines
        </h2>
      </div>

      {vaccinations.length > 0 ? (
        <Card className="clinic-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vaccine Name</TableHead>
                <TableHead>Alternatives</TableHead>
                <TableHead>Dose</TableHead>
                <TableHead>Child Age</TableHead>
                <TableHead>Date Administered</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vaccinations.map((vaccine) => (
                <TableRow key={vaccine.id}>
                  <TableCell className="font-medium">{vaccine.name || 'Not specified'}</TableCell>
                  <TableCell>{vaccine.alternatives || 'None'}</TableCell>
                  <TableCell>{vaccine.dose || 'Not specified'}</TableCell>
                  <TableCell>{vaccine.child_age || 'Not specified'}</TableCell>
                  <TableCell>
                    {vaccine.date_administered
                      ? new Date(vaccine.date_administered).toLocaleDateString()
                      : 'Invalid date'}
                  </TableCell>
                  <TableCell className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(vaccine)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(vaccine.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card className="clinic-card bg-gray-50 p-6 text-center">
          <p className="text-gray-500">No vaccines recorded for this patient</p>
          <p className="mt-2 text-sm">Click "Add New Vaccine" to record a vaccination</p>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this vaccination record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default Vaccinations;