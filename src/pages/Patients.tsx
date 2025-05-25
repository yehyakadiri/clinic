import { Link } from 'react-router-dom';
import { Search, Plus, UserCircle } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { PatientService } from '@/api/patientService';

interface Patient {
  id: string;
  full_name: string;
  age: string; // Now a string like "2 years" or "6 months"
  gender: string;
  address: string;
} 

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await PatientService.getPatients();
        setPatients(data);
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((patient) =>
    patient.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading patients...</div>;
  }

  return (
    <PageLayout
      title="Patients"
      subtitle="Manage your patient records"
      rightContent={
        <Link to="/add-patient">
          <Button className="bg-medical-600 hover:bg-medical-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        </Link>
      }
    >
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search patients by name..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <Link
              key={patient.id}
              to={`/patients/${patient.id}`}
              className="block"
            >
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="rounded-full bg-gray-100 p-2 flex items-center justify-center">
                      <UserCircle className="h-10 w-10 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{patient.full_name}</h3>
                      <div className="text-sm text-gray-500 mt-1">
                        {patient.age} • {patient.gender}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {patient.address}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <div className="text-gray-500">No patients found matching your search</div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Patients;