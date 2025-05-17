import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Stethoscope, Syringe, Baby, Activity, Thermometer, Weight, HeartPulse } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { PatientService } from '@/api/patientService';

interface Consultation {
  id: string;
  type: 'vaccine' | 'well-child' | 'disease';
  date: string;
  notes: string;
  vaccine_name?: string;
  child_age?: string;
  weight?: number;
  height?: number;
  head_circumference?: number;
  pulse?: number;
  temperature?: number;
  blood_pressure?: string;
  respiratory_rate?: number;
  symptoms?: string;
  diagnosis?: string;
  medication?: string;
  dosage?: string;
}

const Consultations = () => {
  const { patientId } = useParams();
  const { toast } = useToast();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [consultationType, setConsultationType] = useState<'vaccine' | 'well-child' | 'disease'>('vaccine');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    notes: '',
    vaccineName: '',
    childAge: '',
    weight: '',
    height: '',
    headCircumference: '',
    pulse: '',
    temperature: '',
    bloodPressure: '',
    respiratoryRate: '',
    symptoms: '',
    diagnosis: '',
    medication: '',
    dosage: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!patientId) return;
      
      try {
        const [patientData, consultationsData] = await Promise.all([
          PatientService.getPatientById(patientId),
          PatientService.getConsultations(patientId)
        ]);
        
        setPatient(patientData);
        setConsultations(consultationsData);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientId) return;
    
    try {
      const consultationData = {
        type: consultationType,
        date: formData.date,
        notes: formData.notes,
        ...(consultationType === 'vaccine' && {
          vaccine_name: formData.vaccineName,
          child_age: formData.childAge,
          weight: parseFloat(formData.weight) || null,
          height: parseFloat(formData.height) || null,
          head_circumference: parseFloat(formData.headCircumference) || null,
        }),
        ...(consultationType === 'well-child' && {
          weight: parseFloat(formData.weight) || null,
          height: parseFloat(formData.height) || null,
          head_circumference: parseFloat(formData.headCircumference) || null,
          pulse: parseInt(formData.pulse) || null,
          temperature: parseFloat(formData.temperature) || null,
          blood_pressure: formData.bloodPressure || null,
          respiratory_rate: parseInt(formData.respiratoryRate) || null,
        }),
        ...(consultationType === 'disease' && {
          symptoms: formData.symptoms,
          diagnosis: formData.diagnosis,
          medication: formData.medication,
          dosage: formData.dosage,
          pulse: parseInt(formData.pulse) || null,
          temperature: parseFloat(formData.temperature) || null,
          blood_pressure: formData.bloodPressure || null,
          respiratory_rate: parseInt(formData.respiratoryRate) || null,
        }),
      };

      const newConsultation = await PatientService.addConsultation(patientId, consultationData);
      
      setConsultations(prev => [newConsultation, ...prev]);
      
      toast({
        title: "Success",
        description: "Consultation added successfully",
      });
      
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error adding consultation:', error);
      toast({
        title: "Error",
        description: "Failed to add consultation",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      notes: '',
      vaccineName: '',
      childAge: '',
      weight: '',
      height: '',
      headCircumference: '',
      pulse: '',
      temperature: '',
      bloodPressure: '',
      respiratoryRate: '',
      symptoms: '',
      diagnosis: '',
      medication: '',
      dosage: '',
    });
  };

  const getConsultationIcon = (type: string) => {
    switch (type) {
      case 'vaccine':
        return <Syringe className="h-5 w-5 text-green-600" />;
      case 'well-child':
        return <Baby className="h-5 w-5 text-blue-600" />;
      case 'disease':
        return <Activity className="h-5 w-5 text-orange-600" />;
      default:
        return <Stethoscope className="h-5 w-5 text-medical-600" />;
    }
  };

  const getConsultationTitle = (consultation: Consultation) => {
    switch (consultation.type) {
      case 'vaccine':
        return `Vaccine: ${consultation.vaccine_name || 'Unspecified'}`;
      case 'well-child':
        return 'Well-Child Visit';
      case 'disease':
        return `Disease: ${consultation.diagnosis || 'Unspecified'}`;
      default:
        return 'Consultation';
    }
  };

  const getConsultationDetails = (consultation: Consultation) => {
    switch (consultation.type) {
      case 'vaccine':
        return consultation.child_age ? `Age: ${consultation.child_age}` : '';
      case 'well-child':
        if (consultation.height && consultation.weight) {
          return `Height: ${consultation.height}cm, Weight: ${consultation.weight}kg`;
        }
        return '';
      case 'disease':
        return consultation.symptoms || '';
      default:
        return '';
    }
  };

  const getConsultationTypeClass = (type: string) => {
    switch (type) {
      case 'vaccine':
        return 'bg-green-100 text-green-800';
      case 'well-child':
        return 'bg-blue-100 text-blue-800';
      case 'disease':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      title="Consultations & Visits"
      subtitle={`Patient: ${patient.full_name}`}
      rightContent={
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-medical-600 hover:bg-medical-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Consultation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Consultation</DialogTitle>
              <DialogDescription>
                Record details of the patient's visit and clinical notes.
              </DialogDescription>
            </DialogHeader>
            
            <Tabs 
              defaultValue="vaccine" 
              value={consultationType}
              onValueChange={(value) => setConsultationType(value as any)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="vaccine" className="flex flex-col py-2">
                  <Syringe className="h-4 w-4 mb-1" />
                  Vaccine Visit
                </TabsTrigger>
                <TabsTrigger value="well-child" className="flex flex-col py-2">
                  <Baby className="h-4 w-4 mb-1" />
                  Well-Child Visit
                </TabsTrigger>
                <TabsTrigger value="disease" className="flex flex-col py-2">
                  <Activity className="h-4 w-4 mb-1" />
                  Disease Visit
                </TabsTrigger>
              </TabsList>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Common fields for all visit types */}
                <div className="space-y-2">
                  <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Vaccine Visit Fields */}
                <TabsContent value="vaccine" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vaccineName">Vaccine Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="vaccineName"
                      name="vaccineName"
                      value={formData.vaccineName}
                      onChange={handleInputChange}
                      placeholder="e.g., MMR, DTaP, Hepatitis B"
                      required={consultationType === 'vaccine'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="childAge">Child's Age <span className="text-red-500">*</span></Label>
                    <Input
                      id="childAge"
                      name="childAge"
                      value={formData.childAge}
                      onChange={handleInputChange}
                      placeholder="e.g., 6 months, 1 year"
                      required={consultationType === 'vaccine'}
                    />
                  </div>
                  <div className="border p-4 rounded-md bg-gray-50 space-y-4">
                    <h3 className="font-medium text-gray-900">Growth Measurements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weight" className="flex items-center gap-1">
                          <Weight className="h-4 w-4" /> Weight (kg) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="weight"
                          name="weight"
                          type="number"
                          step="0.01"
                          value={formData.weight}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          required={consultationType === 'vaccine'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height" className="flex items-center gap-1">
                          <Weight className="h-4 w-4" /> Height (cm) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="height"
                          name="height"
                          type="number"
                          step="0.1"
                          value={formData.height}
                          onChange={handleInputChange}
                          placeholder="0.0"
                          required={consultationType === 'vaccine'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="headCircumference" className="flex items-center gap-1">
                          Head Circumference (cm) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="headCircumference"
                          name="headCircumference"
                          type="number"
                          step="0.1"
                          value={formData.headCircumference}
                          onChange={handleInputChange}
                          placeholder="0.0"
                          required={consultationType === 'vaccine'}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Well-Child Visit Fields */}
                <TabsContent value="well-child" className="space-y-4">
                  <div className="border p-4 rounded-md bg-gray-50 space-y-4">
                    <h3 className="font-medium text-gray-900">Growth Measurements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weight" className="flex items-center gap-1">
                          <Weight className="h-4 w-4" /> Weight (kg) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="weight"
                          name="weight"
                          type="number"
                          step="0.01"
                          value={formData.weight}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          required={consultationType === 'well-child'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height" className="flex items-center gap-1">
                          <Weight className="h-4 w-4" /> Height (cm) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="height"
                          name="height"
                          type="number"
                          step="0.1"
                          value={formData.height}
                          onChange={handleInputChange}
                          placeholder="0.0"
                          required={consultationType === 'well-child'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="headCircumference" className="flex items-center gap-1">
                          Head Circumference (cm) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="headCircumference"
                          name="headCircumference"
                          type="number"
                          step="0.1"
                          value={formData.headCircumference}
                          onChange={handleInputChange}
                          placeholder="0.0"
                          required={consultationType === 'well-child'}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="border p-4 rounded-md bg-gray-50 space-y-4">
                    <h3 className="font-medium text-gray-900">Vital Signs</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pulse" className="flex items-center gap-1">
                          <HeartPulse className="h-4 w-4" /> Pulse (bpm) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="pulse"
                          name="pulse"
                          type="number"
                          value={formData.pulse}
                          onChange={handleInputChange}
                          placeholder="0"
                          required={consultationType === 'well-child'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="temperature" className="flex items-center gap-1">
                          <Thermometer className="h-4 w-4" /> Temperature (°C) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="temperature"
                          name="temperature"
                          type="number"
                          step="0.1"
                          value={formData.temperature}
                          onChange={handleInputChange}
                          placeholder="37.0"
                          required={consultationType === 'well-child'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bloodPressure" className="flex items-center gap-1">
                          Blood Pressure (mmHg) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="bloodPressure"
                          name="bloodPressure"
                          value={formData.bloodPressure}
                          onChange={handleInputChange}
                          placeholder="120/80"
                          required={consultationType === 'well-child'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="respiratoryRate" className="flex items-center gap-1">
                          Respiratory Rate (breaths/min) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="respiratoryRate"
                          name="respiratoryRate"
                          type="number"
                          value={formData.respiratoryRate}
                          onChange={handleInputChange}
                          placeholder="0"
                          required={consultationType === 'well-child'}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Disease Visit Fields */}
                <TabsContent value="disease" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="symptoms">Symptoms <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="symptoms"
                      name="symptoms"
                      value={formData.symptoms}
                      onChange={handleInputChange}
                      placeholder="Describe patient symptoms"
                      required={consultationType === 'disease'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">Diagnosis <span className="text-red-500">*</span></Label>
                    <Input
                      id="diagnosis"
                      name="diagnosis"
                      value={formData.diagnosis}
                      onChange={handleInputChange}
                      placeholder="e.g., Upper respiratory infection, Otitis media"
                      required={consultationType === 'disease'}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="medication">Medication <span className="text-red-500">*</span></Label>
                      <Input
                        id="medication"
                        name="medication"
                        value={formData.medication}
                        onChange={handleInputChange}
                        placeholder="e.g., Amoxicillin"
                        required={consultationType === 'disease'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dosage">Dosage <span className="text-red-500">*</span></Label>
                      <Input
                        id="dosage"
                        name="dosage"
                        value={formData.dosage}
                        onChange={handleInputChange}
                        placeholder="e.g., 250mg 3x daily"
                        required={consultationType === 'disease'}
                      />
                    </div>
                  </div>
                  
                  <div className="border p-4 rounded-md bg-gray-50 space-y-4">
                    <h3 className="font-medium text-gray-900">Vital Signs</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pulse" className="flex items-center gap-1">
                          <HeartPulse className="h-4 w-4" /> Pulse (bpm) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="pulse"
                          name="pulse"
                          type="number"
                          value={formData.pulse}
                          onChange={handleInputChange}
                          placeholder="0"
                          required={consultationType === 'disease'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="temperature" className="flex items-center gap-1">
                          <Thermometer className="h-4 w-4" /> Temperature (°C) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="temperature"
                          name="temperature"
                          type="number"
                          step="0.1"
                          value={formData.temperature}
                          onChange={handleInputChange}
                          placeholder="37.0"
                          required={consultationType === 'disease'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bloodPressure" className="flex items-center gap-1">
                          Blood Pressure (mmHg) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="bloodPressure"
                          name="bloodPressure"
                          value={formData.bloodPressure}
                          onChange={handleInputChange}
                          placeholder="120/80"
                          required={consultationType === 'disease'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="respiratoryRate" className="flex items-center gap-1">
                          Respiratory Rate (breaths/min) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="respiratoryRate"
                          name="respiratoryRate"
                          type="number"
                          value={formData.respiratoryRate}
                          onChange={handleInputChange}
                          placeholder="0"
                          required={consultationType === 'disease'}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Doctor's Notes (common for all types) */}
                <div className="space-y-2 pt-4">
                  <Label htmlFor="notes">Doctor's Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any additional observations or instructions"
                    className="h-24"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-medical-600 hover:bg-medical-700">
                    Save Consultation
                  </Button>
                </div>
              </form>
            </Tabs>
          </DialogContent>
        </Dialog>
      }
    >
      
      {consultations.length > 0 ? (
        <div className="space-y-4">
          {consultations.map((consultation) => (
            <Card key={consultation.id} className="clinic-card">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">{getConsultationIcon(consultation.type)}</div>
                    <div>
                      <div className="flex items-center mb-1">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getConsultationTypeClass(consultation.type)}`}>
                          {consultation.type.charAt(0).toUpperCase() + consultation.type.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">{new Date(consultation.date).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-medium text-gray-900">
                        {getConsultationTitle(consultation)}
                      </h3>
                      {getConsultationDetails(consultation) && (
                        <p className="text-sm text-gray-600 mt-1">
                          {getConsultationDetails(consultation)}
                        </p>
                      )}
                      <div className="mt-3">
                        <h4 className="text-xs font-medium text-gray-500 uppercase">Doctor's Notes</h4>
                        <p className="mt-1 text-gray-800">{consultation.notes || 'No notes recorded'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="clinic-card bg-gray-50">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No consultations recorded for this patient</p>
            <p className="mt-2 text-sm">Click "Add Consultation" to record the first visit</p>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
};

export default Consultations;