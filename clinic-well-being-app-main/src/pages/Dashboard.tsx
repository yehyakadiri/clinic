import { useEffect, useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User, Check, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PatientService } from '@/api/patientService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    upcomingAppointments: 0,
    completedAppointments: 0
  });
const [todaysAppointments, setTodaysAppointments] = useState<Array<{
  id: string;
  patientName: string;
  reason: string;
  date: string;
  time: string;
  status: string;
}>>([]);
  const [loading, setLoading] = useState(true);
  const { isDoctor } = useAuth();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, appointmentsData] = await Promise.all([
          PatientService.getDashboardStats(),
          PatientService.getTodayAppointments()
        ]);
        
        setStats(statsData);
        setTodaysAppointments(appointmentsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <PageLayout title="Clinic Dashboard" subtitle="Loading...">
        <div className="flex justify-center items-center h-64">
          <p>Loading dashboard data...</p>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout title="Clinic Dashboard" subtitle="Welcome to your clinic overview">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Total Patients Card */}
        <Card className="clinic-card bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <User className="h-5 w-5 text-medical-600" />
              Total Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-medical-700">{stats.totalPatients}</div>
            {isDoctor && (
              <Link 
                to="/patients" 
                className="text-sm text-medical-600 hover:text-medical-700 flex items-center mt-2"
              >
                View all patients
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            )}
          </CardContent>
        </Card>
        
        {/* Upcoming Appointments Card */}
        <Card className="clinic-card bg-gradient-to-br from-teal-50 to-teal-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5 text-teal-600" />
              Today's Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-700">{stats.upcomingAppointments}</div>
            <Link 
              to="/appointments" 
              className="text-sm text-teal-600 hover:text-teal-700 flex items-center mt-2"
            >
              Manage appointments
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </CardContent>
        </Card>
        
        {/* Completed Appointments Card */}
        <Card className="clinic-card bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Check className="h-5 w-5 text-purple-600" />
              Recent Consultations (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">{stats.completedAppointments}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Today's Appointments Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Today's Appointments</h2>
        {todaysAppointments.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {todaysAppointments.map((appointment) => (
  <Card key={appointment.id} className="clinic-card">
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">{appointment.patientName}</h3>
          <p className="text-gray-600 text-sm capitalize">{appointment.reason}</p>
        </div>
        <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
          <Clock className="h-3 w-3 mr-1" />
          {appointment.time || '--:--'}
        </div>
      </div>
    </CardContent>
  </Card>
))}
          </div>
        ) : (
          <Card className="clinic-card bg-gray-50">
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No appointments scheduled for today</p>
            </CardContent>
          </Card>
        )}
        <div className="mt-4 text-right">
          <Link 
            to="/appointments" 
            className="text-sm text-medical-600 hover:text-medical-700 flex items-center justify-end"
          >
            View all appointments
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;