import { useParams } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, Mail, Phone, School, Shield, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PatientService } from '@/api/patientService';


interface PatientDetails {
  id: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  parent_name: string;
  parent_occupation: string;
  address: string;
  mother_phone: string;
  father_phone: string;
  home_phone: string;
  email: string;
  insurance_info: string;
  school_name: string;
  delivery_type: string;
  weeks_of_gestation: number;
  birth_weight: number;
  birth_height: number;
  head_circumference: number;
  prenatal_complications: string;
  icn_admission: string;
  icn_admission_reason: string;
  primary_condition?: string;
  screening_performed_date?: string;
  diagnostic_result?: string;
}

const PatientDetails = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) return;
      
      try {
        const data = await PatientService.getPatientById(patientId);
        setPatient(data);
      } catch (error) {
        console.error('Error fetching patient:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  if (loading) {
    return <div>Loading patient details...</div>;
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

  // Calculate age from date of birth
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
  <PageLayout title={patient.full_name} subtitle={`Patient ID: ${patient.id}`}>
    {/* Add the PatientSubnav component */}
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* General Information Card */}
        <Card className="clinic-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <User className="h-5 w-5 text-medical-600 mr-2" />
              General Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Age</p>
                <p>{calculateAge(patient.date_of_birth)} years ({patient.gender})</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p>{patient.date_of_birth || 'N/A'}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Primary Condition</p>
                <p>{patient.primary_condition || 'N/A'}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Parent's Name</p>
                <p>{patient.parent_name || 'N/A'}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Parent's Occupation</p>
                <p>{patient.parent_occupation || 'N/A'}</p>
              </div>

              <div className="md:col-span-2 space-y-1">
                <p className="text-sm text-gray-500">Address</p>
                <p>{patient.address || 'N/A'}</p>
              </div>
            </div>

            <Separator className="my-4" />

            <h3 className="font-medium text-gray-700 mb-2 flex items-center">
              <Phone className="h-4 w-4 mr-2 text-medical-500" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Mother's Phone</p>
                <p>{patient.mother_phone || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Father's Phone</p>
                <p>{patient.father_phone || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Home Phone</p>
                <p>{patient.home_phone || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Email</p>
                <p className="flex items-center">
                  <Mail className="h-4 w-4 mr-1 text-gray-400" />
                  {patient.email}
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center">
                  <Shield className="h-4 w-4 mr-1 text-gray-400" />
                  Insurance Information
                </p>
                <p>{patient.insurance_info || 'No insurance information'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500 flex items-center">
                  <School className="h-4 w-4 mr-1 text-gray-400" />
                  School Name
                </p>
                <p>{patient.school_name || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Birth History Card */}
        <Card className="clinic-card h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 text-medical-600 mr-2" />
              Birth History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Delivery Type</p>
              <p>{patient.delivery_type}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Weeks of Gestation</p>
              <p>{patient.weeks_of_gestation} weeks</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Birth Weight</p>
              <p>{patient.birth_weight} kg</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Birth Height</p>
              <p>{patient.birth_height} cm</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Head Circumference</p>
              <p>{patient.head_circumference} cm</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Prenatal Complications</p>
              <p>{patient.prenatal_complications || 'None'}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500">ICN Admission</p>
              <p>{patient.icn_admission}</p>
            </div>
            
            {patient.icn_admission === 'Yes' && (
              <div className="space-y-1">
                <p className="text-sm text-gray-500">ICN Admission Reason</p>
                <p>{patient.icn_admission_reason}</p>
              </div>
            )}
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Screening Performed Date</p>
              <p>{patient.screening_performed_date || 'N/A'}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Diagnostic Result</p>
              <p className={`${
                patient.diagnostic_result === 'Normal' 
                  ? 'text-green-600' 
                  : patient.diagnostic_result === 'Abnormal'
                  ? 'text-orange-600'
                  : ''
              }`}>
                {patient.diagnostic_result || 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default PatientDetails;