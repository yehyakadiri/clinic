
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';
import { PatientService } from '@/api/patientService';

const AddPatient = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for form fields, divided into sections
  const [generalInfo, setGeneralInfo] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    parentName: '',
    parentOccupation: '',
    address: '',
    motherPhone: '',
    fatherPhone: '',
    homePhone: '',
    email: '',
    insuranceInfo: '',
    schoolName: '',
  });

  const [birthHistory, setBirthHistory] = useState({
    deliveryType: '',
    gestationWeeks: '',
    birthWeight: '',
    birthHeight: '',
    headCircumference: '',
    prenatalComplications: '',
    icnAdmission: 'No',
    icnAdmissionReason: '',
  });

  // Update handlers for both form sections
  const updateGeneralInfo = (field: string, value: string) => {
    setGeneralInfo((prev) => ({ ...prev, [field]: value }));
  };

  const updateBirthHistory = (field: string, value: string) => {
    setBirthHistory((prev) => ({ ...prev, [field]: value }));
  };

  // Form submission handler
  // Update the handleSubmit function in AddPatient.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Basic validation
  if (!generalInfo.fullName || !generalInfo.dateOfBirth || !generalInfo.parentName || !generalInfo.email) {
    toast({
      title: 'Error',
      description: 'Please fill in all required fields.',
      variant: 'destructive',
    });
    return;
  }

  try {
    // Prepare patient data for backend
    const patientData = {
      full_name: generalInfo.fullName,
      date_of_birth: generalInfo.dateOfBirth,
      gender: generalInfo.gender,
      parent_name: generalInfo.parentName,
      parent_occupation: generalInfo.parentOccupation,
      address: generalInfo.address,
      mother_phone: generalInfo.motherPhone,
      father_phone: generalInfo.fatherPhone,
      home_phone: generalInfo.homePhone,
      email: generalInfo.email,
      insurance_info: generalInfo.insuranceInfo,
      school_name: generalInfo.schoolName,
      delivery_type: birthHistory.deliveryType,
      weeks_of_gestation: birthHistory.gestationWeeks,
      birth_weight: birthHistory.birthWeight,
      birth_height: birthHistory.birthHeight,
      head_circumference: birthHistory.headCircumference,
      prenatal_complications: birthHistory.prenatalComplications,
      icn_admission: birthHistory.icnAdmission,
      icn_admission_reason: birthHistory.icnAdmissionReason
    };

    // Call the API
    const response = await PatientService.addPatient(patientData);

    toast({
      title: 'Success',
      description: 'Patient added successfully!',
    });

    // Navigate back to patients list
    navigate('/patients');
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to add patient. Please try again.',
      variant: 'destructive',
    });
  }
};

  return (
    <PageLayout title="Add New Patient" hideTitle>
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/patients')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Patients
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Add New Patient</h1>
        <p className="text-gray-600 mt-1">
          Fill in the patient's information to create a new record
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Information Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4 text-medical-700">
            General Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                value={generalInfo.fullName}
                onChange={(e) => updateGeneralInfo('fullName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">
                Date of Birth <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={generalInfo.dateOfBirth}
                onChange={(e) => updateGeneralInfo('dateOfBirth', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Gender <span className="text-red-500">*</span></Label>
              <RadioGroup 
                value={generalInfo.gender} 
                onValueChange={(value) => updateGeneralInfo('gender', value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentName">
                Parent's Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="parentName"
                value={generalInfo.parentName}
                onChange={(e) => updateGeneralInfo('parentName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentOccupation">Parent's Occupation</Label>
              <Input
                id="parentOccupation"
                value={generalInfo.parentOccupation}
                onChange={(e) => updateGeneralInfo('parentOccupation', e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={generalInfo.address}
                onChange={(e) => updateGeneralInfo('address', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="motherPhone">Mother's Phone</Label>
              <Input
                id="motherPhone"
                value={generalInfo.motherPhone}
                onChange={(e) => updateGeneralInfo('motherPhone', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fatherPhone">Father's Phone</Label>
              <Input
                id="fatherPhone"
                value={generalInfo.fatherPhone}
                onChange={(e) => updateGeneralInfo('fatherPhone', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="homePhone">Home Phone</Label>
              <Input
                id="homePhone"
                value={generalInfo.homePhone}
                onChange={(e) => updateGeneralInfo('homePhone', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={generalInfo.email}
                onChange={(e) => updateGeneralInfo('email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="insuranceInfo">Insurance Information</Label>
              <Textarea
                id="insuranceInfo"
                value={generalInfo.insuranceInfo}
                onChange={(e) => updateGeneralInfo('insuranceInfo', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name</Label>
              <Input
                id="schoolName"
                value={generalInfo.schoolName}
                onChange={(e) => updateGeneralInfo('schoolName', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Birth & Prenatal History Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4 text-medical-700">
            Birth & Prenatal History
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="deliveryType">Delivery Type <span className="text-red-500">*</span></Label>
              <Select 
                value={birthHistory.deliveryType}
                onValueChange={(value) => updateBirthHistory('deliveryType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select delivery type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="C-Section">C-Section</SelectItem>
                  <SelectItem value="NVD">NVD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gestationWeeks">
                Weeks of Gestation <span className="text-red-500">*</span>
              </Label>
              <Input
                id="gestationWeeks"
                type="number"
                value={birthHistory.gestationWeeks}
                onChange={(e) => updateBirthHistory('gestationWeeks', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthWeight">
                Birth Weight (kg) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="birthWeight"
                type="number"
                step="0.01"
                value={birthHistory.birthWeight}
                onChange={(e) => updateBirthHistory('birthWeight', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthHeight">
                Birth Height (cm) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="birthHeight"
                type="number"
                step="0.1"
                value={birthHistory.birthHeight}
                onChange={(e) => updateBirthHistory('birthHeight', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="headCircumference">
                Head Circumference (cm) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="headCircumference"
                type="number"
                step="0.1"
                value={birthHistory.headCircumference}
                onChange={(e) => updateBirthHistory('headCircumference', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="prenatalComplications">
                Prenatal Complications <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="prenatalComplications"
                value={birthHistory.prenatalComplications}
                onChange={(e) => updateBirthHistory('prenatalComplications', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>ICN Admission <span className="text-red-500">*</span></Label>
              <RadioGroup 
                value={birthHistory.icnAdmission} 
                onValueChange={(value) => updateBirthHistory('icnAdmission', value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="icnYes" />
                  <Label htmlFor="icnYes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="icnNo" />
                  <Label htmlFor="icnNo">No</Label>
                </div>
              </RadioGroup>
            </div>

            {birthHistory.icnAdmission === 'Yes' && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="icnAdmissionReason">ICN Admission Reason</Label>
                <Textarea
                  id="icnAdmissionReason"
                  value={birthHistory.icnAdmissionReason}
                  onChange={(e) => updateBirthHistory('icnAdmissionReason', e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate('/patients')}
          >
            Cancel
          </Button>
          <Button type="submit" className="bg-medical-600 hover:bg-medical-700">
            Add Patient
          </Button>
        </div>
      </form>
    </PageLayout>
  );
};

export default AddPatient;
