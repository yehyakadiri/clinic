
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import AddPatient from "./pages/AddPatient";
import PatientDetails from "./pages/PatientDetails";
import Consultations from "./pages/Consultations";
import Vaccinations from "./pages/Vaccinations";
import MedicalHistory from "./pages/MedicalHistory";
import MedicalRecord from "./pages/MedicalRecord";
import Diagnostics from "./pages/Diagnostics";
import Documents from "./pages/Documents";
import Billing from "./pages/Billing";
import Appointments from "./pages/Appointments";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Doctor-only routes */}
            <Route 
              path="/patients" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <Patients />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/add-patient" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <AddPatient />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/patients/:patientId" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <PatientDetails />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/patients/:patientId/consultations" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <Consultations />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/patients/:patientId/medical-record" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <MedicalRecord />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/patients/:patientId/vaccinations" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <Vaccinations />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/patients/:patientId/medical-history" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <MedicalHistory />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/patients/:patientId/diagnostics" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <Diagnostics />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/patients/:patientId/documents" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <Documents />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/patients/:patientId/billing" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <Billing />
                </ProtectedRoute>
              } 
            />
            
            {/* Routes accessible to both doctor and secretary */}
            <Route 
              path="/appointments" 
              element={
                <ProtectedRoute>
                  <Appointments />
                </ProtectedRoute>
              } 
            />
            
            {/* Default route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
