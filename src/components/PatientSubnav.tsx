import { Link, useLocation, useParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, User, Calendar, Syringe, Activity, File, Receipt } from 'lucide-react';

const PatientSubnav = () => {
  const location = useLocation();
  const { patientId } = useParams();
  
  // Improved isActive function to handle nested routes
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="border-b bg-white">
      <div className="container mx-auto px-4">
        <Tabs 
          value={location.pathname.split('/')[3] || 'details'} 
          className="w-full overflow-x-auto"
        >
          <TabsList className="py-2 h-auto justify-start">
            <TabsTrigger
              value="details"
              className="py-2 px-4 data-[state=active]:bg-medical-50 data-[state=active]:text-medical-700"
              asChild
            >
              <Link 
                to={`/patients/${patientId}`} 
                className={`flex items-center ${isActive(`/patients/${patientId}`) && !isActive(`/patients/${patientId}/`) ? 'text-medical-700' : ''}`}
              >
                <User className="h-4 w-4 mr-2" />
                <span>Patient Details</span>
              </Link>
            </TabsTrigger>
            
            <TabsTrigger
              value="consultations"
              className="py-2 px-4 data-[state=active]:bg-medical-50 data-[state=active]:text-medical-700"
              asChild
            >
              <Link 
                to={`/patients/${patientId}/consultations`} 
                className={`flex items-center ${isActive(`/patients/${patientId}/consultations`) ? 'text-medical-700' : ''}`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                <span>Consultations</span>
              </Link>
            </TabsTrigger>
            
            <TabsTrigger
              value="medical-record"
              className="py-2 px-4 data-[state=active]:bg-medical-50 data-[state=active]:text-medical-700"
              asChild
            >
              <Link 
                to={`/patients/${patientId}/medical-record`} 
                className={`flex items-center ${isActive(`/patients/${patientId}/medical-record`) ? 'text-medical-700' : ''}`}
              >
                <FileText className="h-4 w-4 mr-2" />
                <span>Medical Record</span>
              </Link>
            </TabsTrigger>
            
            <TabsTrigger
              value="vaccinations"
              className="py-2 px-4 data-[state=active]:bg-medical-50 data-[state=active]:text-medical-700"
              asChild
            >
              <Link 
                to={`/patients/${patientId}/vaccinations`} 
                className={`flex items-center ${isActive(`/patients/${patientId}/vaccinations`) ? 'text-medical-700' : ''}`}
              >
                <Syringe className="h-4 w-4 mr-2" />
                <span>Vaccinations</span>
              </Link>
            </TabsTrigger>
            
            <TabsTrigger
              value="medical-history"
              className="py-2 px-4 data-[state=active]:bg-medical-50 data-[state=active]:text-medical-700"
              asChild
            >
              <Link 
                to={`/patients/${patientId}/medical-history`} 
                className={`flex items-center ${isActive(`/patients/${patientId}/medical-history`) ? 'text-medical-700' : ''}`}
              >
                <FileText className="h-4 w-4 mr-2" />
                <span>Medical History</span>
              </Link>
            </TabsTrigger>
            
            <TabsTrigger
              value="diagnostics"
              className="py-2 px-4 data-[state=active]:bg-medical-50 data-[state=active]:text-medical-700"
              asChild
            >
              <Link 
                to={`/patients/${patientId}/diagnostics`} 
                className={`flex items-center ${isActive(`/patients/${patientId}/diagnostics`) ? 'text-medical-700' : ''}`}
              >
                <Activity className="h-4 w-4 mr-2" />
                <span>Diagnostics</span>
              </Link>
            </TabsTrigger>
            
            <TabsTrigger
              value="documents"
              className="py-2 px-4 data-[state=active]:bg-medical-50 data-[state=active]:text-medical-700"
              asChild
            >
              <Link 
                to={`/patients/${patientId}/documents`} 
                className={`flex items-center ${isActive(`/patients/${patientId}/documents`) ? 'text-medical-700' : ''}`}
              >
                <File className="h-4 w-4 mr-2" />
                <span>Documents</span>
              </Link>
            </TabsTrigger>
            
            <TabsTrigger
              value="billing"
              className="py-2 px-4 data-[state=active]:bg-medical-50 data-[state=active]:text-medical-700"
              asChild
            >
              <Link 
                to={`/patients/${patientId}/billing`} 
                className={`flex items-center ${isActive(`/patients/${patientId}/billing`) ? 'text-medical-700' : ''}`}
              >
                <Receipt className="h-4 w-4 mr-2" />
                <span>Billing</span>
              </Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientSubnav;