import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { PatientService } from '@/api/patientService';
import { History, Pill, AlertCircle, HeartPulse, Stethoscope } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { format } from 'date-fns';

const MedicalHistory = () => {
  const { patientId } = useParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('family');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [loading, setLoading] = useState(true);

  // State for all medical history data
  const [patient, setPatient] = useState<any>(null);
  const [familyHistory, setFamilyHistory] = useState<any[]>([]);
  const [surgicalHistory, setSurgicalHistory] = useState<any[]>([]);
  const [allergyHistory, setAllergyHistory] = useState<any[]>([]);
  const [chronicTherapy, setChronicTherapy] = useState<any[]>([]);
  const [allergyTreatments, setAllergyTreatments] = useState<any[]>([]);

  // Form states
  const [familyForm, setFamilyForm] = useState({
    medical_condition: '',
    father: false,
    mother: false,
    other: false,
    notes: ''
  });

  const [surgicalForm, setSurgicalForm] = useState({
    type: '',
    date: '',
    age_at_surgery: '',
    notes: ''
  });

  const [allergyForm, setAllergyForm] = useState({
    allergyType: '',
    name: '',
    testDone: false,
    testResults: '',
    notes: ''
  });

  const [chronicForm, setChronicForm] = useState({
    medication: '',
    birth_to_1_year_prevention: '',
    one_year_to_2_years_prevention: '',
    treatment: '',
    notes: ''
  });

  const [treatmentForm, setTreatmentForm] = useState({
    allergyType: '',
    treatmentDate: '',
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    notes: ''
  });

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!patientId) return;
      
      try {
        const [
          patientData,
          familyData,
          surgicalData,
          allergyData,
          chronicData,
          treatmentData
        ] = await Promise.all([
          PatientService.getPatientById(patientId),
          PatientService.getFamilyHistory(patientId),
          PatientService.getSurgicalHistory(patientId),
          PatientService.getAllergyHistory(patientId),
          PatientService.getChronicTherapy(patientId),
          PatientService.getAllergyTreatment(patientId)
        ]);
        
        setPatient(patientData);
        setFamilyHistory(familyData);
        setSurgicalHistory(surgicalData);
        setAllergyHistory(allergyData);
        setChronicTherapy(chronicData);
        setAllergyTreatments(treatmentData);
      } catch (error) {
        console.error('Error fetching medical history:', error);
        toast({
          title: "Error",
          description: "Failed to load medical history data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [patientId, toast]);

  // Open modal with specific type
  const openModal = (type: string) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  // Form submission handlers
  const handleFamilySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newRecord = await PatientService.addFamilyHistory(patientId!, familyForm);
      setFamilyHistory(prev => [newRecord, ...prev]);
      toast({
        title: "Success",
        description: "Family history record added successfully",
      });
      setIsModalOpen(false);
      setFamilyForm({
        medical_condition: '',
        father: false,
        mother: false,
        other: false,
        notes: ''
      });
    } catch (error) {
      console.error('Error adding family history:', error);
      toast({
        title: "Error",
        description: "Failed to add family history record",
        variant: "destructive",
      });
    }
  };

  const handleSurgicalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newRecord = await PatientService.addSurgicalHistory(patientId!, {
        type: surgicalForm.type,
        date: surgicalForm.date,
        age_at_surgery: surgicalForm.age_at_surgery,
        notes: surgicalForm.notes
      });
      setSurgicalHistory(prev => [newRecord, ...prev]);
      toast({
        title: "Success",
        description: "Surgical history record added successfully",
      });
      setIsModalOpen(false);
      setSurgicalForm({
        type: '',
        date: '',
        age_at_surgery: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error adding surgical history:', error);
      toast({
        title: "Error",
        description: "Failed to add surgical history record",
        variant: "destructive",
      });
    }
  };

  const handleAllergySubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    // Validate required fields
    if (!allergyForm.allergyType || !allergyForm.name) {
      toast({
        title: "Validation Error",
        description: "Allergy type and name are required fields",
        variant: "destructive",
      });
      return;
    }

    console.log('Submitting allergy form:', allergyForm);
    const newRecord = await PatientService.addAllergyHistory(patientId!, {
      allergyType: allergyForm.allergyType,
      name: allergyForm.name,
      testDone: allergyForm.testDone,
      testResults: allergyForm.testResults,
      notes: allergyForm.notes
    });
    
    console.log('Received response:', newRecord);
    setAllergyHistory(prev => [newRecord, ...prev]);
    toast({
      title: "Success",
      description: "Allergy history record added successfully",
    });
    setIsModalOpen(false);
    setAllergyForm({
      allergyType: '',
      name: '',
      testDone: false,
      testResults: '',
      notes: ''
    });
  } catch (error) {
    console.error('Detailed submission error:', error);
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        "Failed to add allergy history record";
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  }
};

const handleChronicSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    // Validate required fields
    if (!chronicForm.medication || !chronicForm.treatment) {
      toast({
        title: "Validation Error",
        description: "Medication and treatment are required fields",
        variant: "destructive",
      });
      return;
    }

    console.log('Submitting chronic therapy:', chronicForm);
    const newRecord = await PatientService.addChronicTherapy(patientId!, {
      medication: chronicForm.medication,
      birth_to_1_year_prevention: chronicForm.birth_to_1_year_prevention,
      one_year_to_2_years_prevention: chronicForm.one_year_to_2_years_prevention,
      treatment: chronicForm.treatment,
      notes: chronicForm.notes
    });
    
    setChronicTherapy(prev => [newRecord, ...prev]);
    toast({
      title: "Success",
      description: "Chronic therapy added successfully",
    });
    
    // Reset form
    setIsModalOpen(false);
    setChronicForm({
      medication: '',
      birth_to_1_year_prevention: '',
      one_year_to_2_years_prevention: '',
      treatment: '',
      notes: ''
    });
    
  } catch (error) {
    console.error('Chronic therapy submission error:', error);
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        "Failed to add chronic therapy";
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  }
};
const handleTreatmentSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    // Validate required fields
    const requiredFields = [
      'allergyType', 'treatmentDate', 'medication', 
      'dosage', 'frequency', 'duration'
    ];
    const missingFields = requiredFields.filter(field => !treatmentForm[field]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Missing required fields: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    // Format date to YYYY-MM-DD
    const formattedDate = new Date(treatmentForm.treatmentDate).toISOString().split('T')[0];
    
    const payload = {
      ...treatmentForm,
      treatmentDate: formattedDate
    };

    console.log('Submitting treatment:', payload);
    const newRecord = await PatientService.addAllergyTreatment(patientId!, payload);
    
    setAllergyTreatments(prev => [newRecord, ...prev]);
    toast({
      title: "Success",
      description: "Allergy treatment added successfully",
    });
    
    // Reset form
    setIsModalOpen(false);
    setTreatmentForm({
      allergyType: '',
      treatmentDate: '',
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      notes: ''
    });
    
  } catch (error) {
    console.error('Treatment submission error:', error);
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        "Failed to add allergy treatment";
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  }
};

  if (loading) {
    return (
      <PageLayout title="Loading...">
        <div className="text-center py-8">Loading medical history...</div>
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
      title="Medical History & Chronic Therapy"
      subtitle={`Patient: ${patient.full_name}`}
    >
      <Tabs 
        defaultValue="family" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="family" className="flex flex-col py-2">
            <HeartPulse className="h-4 w-4 mb-1" />
            <span className="hidden sm:inline">Family History</span>
            <span className="sm:hidden">Family</span>
          </TabsTrigger>
          <TabsTrigger value="surgical" className="flex flex-col py-2">
            <Stethoscope className="h-4 w-4 mb-1" />
            <span className="hidden sm:inline">Surgical History</span>
            <span className="sm:hidden">Surgical</span>
          </TabsTrigger>
          <TabsTrigger value="allergy" className="flex flex-col py-2">
            <AlertCircle className="h-4 w-4 mb-1" />
            <span className="hidden sm:inline">Allergy History</span>
            <span className="sm:hidden">Allergy</span>
          </TabsTrigger>
          <TabsTrigger value="chronic" className="flex flex-col py-2">
            <Pill className="h-4 w-4 mb-1" />
            <span className="hidden sm:inline">Chronic Therapy</span>
            <span className="sm:hidden">Chronic</span>
          </TabsTrigger>
          <TabsTrigger value="treatment" className="flex flex-col py-2">
            <History className="h-4 w-4 mb-1" />
            <span className="hidden sm:inline">Allergy Treatment</span>
            <span className="sm:hidden">Treatment</span>
          </TabsTrigger>
        </TabsList>

        {/* Family History Tab */}
        <TabsContent value="family">
          <Card className="clinic-card mb-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Family Medical History</CardTitle>
              <Button onClick={() => openModal('family')} className="bg-medical-600 hover:bg-medical-700">
                Add Record
              </Button>
            </CardHeader>
            <CardContent>
              {familyHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Condition</TableHead>
                      <TableHead>Father</TableHead>
                      <TableHead>Mother</TableHead>
                      <TableHead>Other</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {familyHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.medical_condition}</TableCell>
                        <TableCell>{record.father ? 'Yes' : 'No'}</TableCell>
                        <TableCell>{record.mother ? 'Yes' : 'No'}</TableCell>
                        <TableCell>{record.other ? 'Yes' : 'No'}</TableCell>
                        <TableCell>{record.notes || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No family history records available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Surgical History Tab */}
        <TabsContent value="surgical">
          <Card className="clinic-card mb-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Surgical History</CardTitle>
              <Button onClick={() => openModal('surgical')} className="bg-medical-600 hover:bg-medical-700">
                Add Surgery
              </Button>
            </CardHeader>
            <CardContent>
              {surgicalHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type of Surgery</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Age at Surgery</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {surgicalHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.type}</TableCell>
                        <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{record.age_at_surgery || 'N/A'}</TableCell>
                        <TableCell>{record.notes || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No surgical history records available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Allergy History Tab */}
        <TabsContent value="allergy">
          <Card className="clinic-card mb-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Allergy History</CardTitle>
              <Button onClick={() => openModal('allergy')} className="bg-medical-600 hover:bg-medical-700">
                Add Allergy
              </Button>
            </CardHeader>
            <CardContent>
              {allergyHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Allergy Type</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Test Done</TableHead>
                      <TableHead>Test Results</TableHead>
                      <TableHead>Extra Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allergyHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.allergy_type}</TableCell>
                        <TableCell>{record.name}</TableCell>
                        <TableCell>{record.test_done ? 'Yes' : 'No'}</TableCell>
                        <TableCell>{record.test_results || 'N/A'}</TableCell>
                        <TableCell>{record.notes || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No allergy history records available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chronic Therapy Tab */}
        <TabsContent value="chronic">
          <Card className="clinic-card mb-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Chronic Therapy</CardTitle>
              <Button onClick={() => openModal('chronic')} className="bg-medical-600 hover:bg-medical-700">
                Add Therapy
              </Button>
            </CardHeader>
            <CardContent>
              {chronicTherapy.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Birth→1st Prevention</TableHead>
                      <TableHead>1year→2years Prevention</TableHead>
                      <TableHead>Treatment</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chronicTherapy.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.medication}</TableCell>
                        <TableCell>{record.birth_to_1_year_prevention || 'N/A'}</TableCell>
                        <TableCell>{record.one_year_to_2_years_prevention || 'N/A'}</TableCell>
                        <TableCell>{record.treatment}</TableCell>
                        <TableCell>{record.notes || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No chronic therapy records available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Allergy Treatment Tab */}
        <TabsContent value="treatment">
          <Card className="clinic-card mb-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Allergy Treatment</CardTitle>
              <Button onClick={() => openModal('treatment')} className="bg-medical-600 hover:bg-medical-700">
                Add Treatment
              </Button>
            </CardHeader>
            <CardContent>
              {allergyTreatments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Allergy Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Medication</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allergyTreatments.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.allergy_type}</TableCell>
                        <TableCell>{format(new Date(record.treatment_date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{record.medication}</TableCell>
                        <TableCell>{record.dosage}</TableCell>
                        <TableCell>{record.frequency}</TableCell>
                        <TableCell>{record.duration}</TableCell>
                        <TableCell>{record.notes || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No allergy treatment records available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dynamic Modal for Different Record Types */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalType === 'family' && 'Add Family History Record'}
              {modalType === 'surgical' && 'Add Surgical History'}
              {modalType === 'allergy' && 'Add Allergy History'}
              {modalType === 'chronic' && 'Add Chronic Therapy'}
              {modalType === 'treatment' && 'Add Allergy Treatment'}
            </DialogTitle>
            <DialogDescription>
              Fill in the details to add a new medical record.
            </DialogDescription>
          </DialogHeader>
          
          {modalType === 'family' && (
            <form onSubmit={handleFamilySubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Condition <span className="text-red-500">*</span></Label>
                <Select 
                  value={familyForm.medical_condition}
                  onValueChange={(value) => setFamilyForm({...familyForm, medical_condition: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Allergy">Allergy</SelectItem>
                    <SelectItem value="Diabetes">Diabetes</SelectItem>
                    <SelectItem value="Hypertension">Hypertension</SelectItem>
                    <SelectItem value="Hyperlipidemia">Hyperlipidemia</SelectItem>
                    <SelectItem value="Cardiac Issues">Cardiac Issues</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Family Members Affected</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="father" 
                      checked={familyForm.father}
                      onCheckedChange={(checked) => setFamilyForm({...familyForm, father: !!checked})}
                    />
                    <Label htmlFor="father">Father</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="mother" 
                      checked={familyForm.mother}
                      onCheckedChange={(checked) => setFamilyForm({...familyForm, mother: !!checked})}
                    />
                    <Label htmlFor="mother">Mother</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="other" 
                      checked={familyForm.other}
                      onCheckedChange={(checked) => setFamilyForm({...familyForm, other: !!checked})}
                    />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  value={familyForm.notes}
                  onChange={(e) => setFamilyForm({...familyForm, notes: e.target.value})}
                  placeholder="Additional details about the condition" 
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-medical-600 hover:bg-medical-700">
                  Save Record
                </Button>
              </DialogFooter>
            </form>
          )}

          {modalType === 'surgical' && (
            <form onSubmit={handleSurgicalSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="surgeryType">Type of Surgery <span className="text-red-500">*</span></Label>
                <Input 
                  id="surgeryType" 
                  value={surgicalForm.type}
                  onChange={(e) => setSurgicalForm({...surgicalForm, type: e.target.value})}
                  placeholder="e.g., Tonsillectomy, Appendectomy" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="surgeryDate">Date <span className="text-red-500">*</span></Label>
                <Input 
                  id="surgeryDate" 
                  type="date" 
                  value={surgicalForm.date}
                  onChange={(e) => setSurgicalForm({...surgicalForm, date: e.target.value})}
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="age_at_surgery">Age at Surgery</Label>
                <Input 
                  id="age_at_surgery" 
                  value={surgicalForm.age_at_surgery}
                  onChange={(e) => setSurgicalForm({...surgicalForm, age_at_surgery: e.target.value})}
                  placeholder="e.g., 5 years" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="surgeryNotes">Notes</Label>
                <Textarea 
                  id="surgeryNotes" 
                  value={surgicalForm.notes}
                  onChange={(e) => setSurgicalForm({...surgicalForm, notes: e.target.value})}
                  placeholder="Additional details about the surgery" 
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-medical-600 hover:bg-medical-700">
                  Save Record
                </Button>
              </DialogFooter>
            </form>
          )}

          {modalType === 'allergy' && (
            <form onSubmit={handleAllergySubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Allergy Type <span className="text-red-500">*</span></Label>
                <Select 
                  value={allergyForm.allergyType}
                  onValueChange={(value) => setAllergyForm({...allergyForm, allergyType: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select allergy type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Medication">Medication</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Environmental">Environmental</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="allergyName">Name <span className="text-red-500">*</span></Label>
                <Input 
                  id="allergyName" 
                  value={allergyForm.name}
                  onChange={(e) => setAllergyForm({...allergyForm, name: e.target.value})}
                  placeholder="e.g., Peanuts, Penicillin" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Test Done</Label>
                <Select 
                  value={allergyForm.testDone ? 'Yes' : 'No'}
                  onValueChange={(value) => setAllergyForm({...allergyForm, testDone: value === 'Yes'})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="testResults">Test Results</Label>
                <Input 
                  id="testResults" 
                  value={allergyForm.testResults}
                  onChange={(e) => setAllergyForm({...allergyForm, testResults: e.target.value})}
                  placeholder="e.g., Positive skin prick test" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="allergyNotes">Extra Notes</Label>
                <Textarea 
                  id="allergyNotes" 
                  value={allergyForm.notes}
                  onChange={(e) => setAllergyForm({...allergyForm, notes: e.target.value})}
                  placeholder="Additional details about the allergy" 
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-medical-600 hover:bg-medical-700">
                  Save Record
                </Button>
              </DialogFooter>
            </form>
          )}

          {modalType === 'chronic' && (
            <form onSubmit={handleChronicSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="medication">Medication <span className="text-red-500">*</span></Label>
                <Input 
                  id="medication" 
                  value={chronicForm.medication}
                  onChange={(e) => setChronicForm({...chronicForm, medication: e.target.value})}
                  placeholder="e.g., Albuterol, Hydrocortisone" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birth1Year">Birth → 1 Year Prevention</Label>
                <Input 
                  id="birth1Year" 
                  value={chronicForm.birth_to_1_year_prevention}
                  onChange={(e) => setChronicForm({...chronicForm, birth_to_1_year_prevention: e.target.value})}
                  placeholder="Prevention measures for infants" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="1to2Years">1 Year → 2 Years Prevention</Label>
                <Input 
                  id="1to2Years" 
                  value={chronicForm.one_year_to_2_years_prevention}
                  onChange={(e) => setChronicForm({...chronicForm, one_year_to_2_years_prevention: e.target.value})}
                  placeholder="Prevention measures for toddlers" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="treatment">Treatment <span className="text-red-500">*</span></Label>
                <Textarea 
                  id="treatment" 
                  value={chronicForm.treatment}
                  onChange={(e) => setChronicForm({...chronicForm, treatment: e.target.value})}
                  placeholder="Treatment details and instructions" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="chronicNotes">Notes</Label>
                <Textarea 
                  id="chronicNotes" 
                  value={chronicForm.notes}
                  onChange={(e) => setChronicForm({...chronicForm, notes: e.target.value})}
                  placeholder="Additional notes about the therapy" 
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-medical-600 hover:bg-medical-700">
                  Save Record
                </Button>
              </DialogFooter>
            </form>
          )}

          {modalType === 'treatment' && (
            <form onSubmit={handleTreatmentSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Allergy Type <span className="text-red-500">*</span></Label>
                <Select 
                  value={treatmentForm.allergyType}
                  onValueChange={(value) => setTreatmentForm({...treatmentForm, allergyType: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select allergy type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Medication">Medication</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Environmental">Environmental</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="treatmentDate">Date of Treatment <span className="text-red-500">*</span></Label>
                <Input 
                  id="treatmentDate" 
                  type="date" 
                  value={treatmentForm.treatmentDate}
                  onChange={(e) => setTreatmentForm({...treatmentForm, treatmentDate: e.target.value})}
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="treatmentMed">Medication <span className="text-red-500">*</span></Label>
                <Input 
                  id="treatmentMed" 
                  value={treatmentForm.medication}
                  onChange={(e) => setTreatmentForm({...treatmentForm, medication: e.target.value})}
                  placeholder="e.g., Epinephrine, Loratadine" 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage <span className="text-red-500">*</span></Label>
                  <Input 
                    id="dosage" 
                    value={treatmentForm.dosage}
                    onChange={(e) => setTreatmentForm({...treatmentForm, dosage: e.target.value})}
                    placeholder="e.g., 5mg, 0.15mg" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency <span className="text-red-500">*</span></Label>
                  <Input 
                    id="frequency" 
                    value={treatmentForm.frequency}
                    onChange={(e) => setTreatmentForm({...treatmentForm, frequency: e.target.value})}
                    placeholder="e.g., Once daily, As needed" 
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duration <span className="text-red-500">*</span></Label>
                <Input 
                  id="duration" 
                  value={treatmentForm.duration}
                  onChange={(e) => setTreatmentForm({...treatmentForm, duration: e.target.value})}
                  placeholder="e.g., 7 days, Until resolved" 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="treatmentNotes">Notes</Label>
                <Textarea 
                  id="treatmentNotes" 
                  value={treatmentForm.notes}
                  onChange={(e) => setTreatmentForm({...treatmentForm, notes: e.target.value})}
                  placeholder="Additional instructions or observations" 
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-medical-600 hover:bg-medical-700">
                  Save Record
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default MedicalHistory;