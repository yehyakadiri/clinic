// src/api/patientService.ts
import axios from 'axios';
import { Appointment, AppointmentStatus } from '@/types/appointment';
const API_URL = 'http://localhost:8082'; // Your backend URL

// Add authorization header to requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const PatientService = {
  // Add a new patient
  async addPatient(patientData: any) {
    try {
      const response = await axios.post(`${API_URL}/patients`, patientData);
      return response.data;
    } catch (error) {
      console.error('Error adding patient:', error);
      throw error;
    }
  },

  // Get all patients
  async getPatients() {
    try {
      const response = await axios.get(`${API_URL}/patients`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  // Get single patient by ID
  async getPatientById(id: string) {
    try {
      const response = await axios.get(`${API_URL}/patients/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  },
  

// Vaccinations
// Add these to your PatientService object

// Get all vaccines for a patient
async getVaccinations(patientId: string) {
  try {
    const response = await axios.get(`${API_URL}/patients/${patientId}/vaccinations`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vaccinations:', error);
    throw error;
  }
},

async addVaccination(patientId: string, vaccinationData: any) {
  try {
    // Transform data to match backend expectations
    const payload = {
      name: vaccinationData.name,
      alternatives: vaccinationData.alternatives || null,
      dose: vaccinationData.dose,
      child_age: vaccinationData.child_age,
      date_administered: vaccinationData.date_administered,
      notes: vaccinationData.notes || null
    };

    console.log('Sending to backend:', payload);
    
    const response = await axios.post(`${API_URL}/patients/${patientId}/vaccinations`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    console.log('Full backend response:', response);
    
    if (response.status !== 201) {
      throw new Error(`Unexpected status code: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error('Detailed API error:', {
      message: error.message,
      response: error.response?.data,
      config: error.config
    });
    throw error;
  }
},

async updateVaccination(vaccinationId: string, vaccinationData: any) {
  try {
    // Transform data to match backend expectations
    const payload = {
      name: vaccinationData.name,
      alternatives: vaccinationData.alternatives || null,
      dose: vaccinationData.dose,
      child_age: vaccinationData.child_age,
      date_administered: vaccinationData.date_administered,
      notes: vaccinationData.notes || null
    };

    const response = await axios.put(`${API_URL}/vaccinations/${vaccinationId}`, payload);
    
    // Transform response to frontend format
    return {
      id: response.data.id,
      name: response.data.name,
      alternatives: response.data.alternatives || '',
      dose: response.data.dose,
      child_age: response.data.childAge || response.data.child_age,
      date_administered: response.data.dateAdministered || response.data.date_administered,
      notes: response.data.notes || ''
    };
  } catch (error) {
    console.error('Error updating vaccination:', error.response?.data || error.message);
    throw error;
  }
},

// Delete a vaccination
async deleteVaccination(vaccinationId: string) {
  try {
    const response = await axios.delete(`${API_URL}/vaccinations/${vaccinationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting vaccination:', error);
    throw error;
  }
},

// Add similar methods for:
// - medical-history
// - diagnostics
// - documents
// - billing
// Add these to your PatientService object

// Get all consultations for a patient
async getConsultations(patientId: string) {
  try {
    const response = await axios.get(`${API_URL}/patients/${patientId}/consultations`);
    return response.data;
  } catch (error) {
    console.error('Error fetching consultations:', error);
    throw error;
  }
},

// Add a new consultation
async addConsultation(patientId: string, consultationData: any) {
  try {
    const response = await axios.post(`${API_URL}/patients/${patientId}/consultations`, consultationData);
    return response.data;
  } catch (error) {
    console.error('Error adding consultation:', error);
    throw error;
  }
},

// Update a consultation
async updateConsultation(consultationId: string, consultationData: any) {
  try {
    const response = await axios.put(`${API_URL}/consultations/${consultationId}`, consultationData);
    return response.data;
  } catch (error) {
    console.error('Error updating consultation:', error);
    throw error;
  }
},

// Delete a consultation
async deleteConsultation(consultationId: string) {
  try {
    const response = await axios.delete(`${API_URL}/consultations/${consultationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting consultation:', error);
    throw error;
  }
},

// Screening Tests
async getScreeningTests(patientId: string) {
  try {
    const response = await axios.get(`${API_URL}/patients/${patientId}/screening-tests`);
    return response.data;
  } catch (error) {
    console.error('Error fetching screening tests:', error);
    throw error;
  }
},

async addScreeningTest(patientId: string, testData: any) {
  try {
    console.log('Sending screening test data:', testData);
    const response = await axios.post(`${API_URL}/patients/${patientId}/screening-tests`, testData);
    console.log('Screening test response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding screening test:', error.response?.data || error.message);
    throw error;
  }
},

// Diagnostics
async getDiagnostics(patientId: string) {
    try {
        const response = await axios.get(`${API_URL}/patients/${patientId}/diagnostics`);
        return response.data;
    } catch (error) {
        console.error('Error fetching diagnostics:', error);
        throw error;
    }
},



async uploadDiagnostic(patientId: string, diagnosticData: FormData) {
    try {
        console.log('Sending diagnostic data:', diagnosticData);
        const response = await axios.post(`${API_URL}/patients/${patientId}/diagnostics`, diagnosticData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        console.log('Diagnostic response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error uploading diagnostic:', error.response?.data || error.message);
        throw error;
    }
},// Medical History
async getFamilyHistory(patientId: string) {
  try {
    const response = await axios.get(`${API_URL}/patients/${patientId}/family-history`);
    return response.data;
  } catch (error) {
    console.error('Error fetching family history:', error);
    throw error;
  }
},

async addFamilyHistory(patientId: string, data: any) {
  try {
    const response = await axios.post(`${API_URL}/patients/${patientId}/family-history`, data);
    return response.data;
  } catch (error) {
    console.error('Error adding family history:', error);
    throw error;
  }
},

async getSurgicalHistory(patientId: string) {
  try {
    const response = await axios.get(`${API_URL}/patients/${patientId}/surgical-history`);
    return response.data;
  } catch (error) {
    console.error('Error fetching surgical history:', error);
    throw error;
  }
},

async addSurgicalHistory(patientId: string, data: any) {
  try {
    // Convert field names to snake_case for the backend
    const payload = {
      type: data.type,
      date: data.date,
      age_at_surgery: data.age_at_surgery || null,  // Use snake_case here
      notes: data.notes || null
    };
    
    const response = await axios.post(`${API_URL}/patients/${patientId}/surgical-history`, payload);
    return response.data;
  } catch (error) {
    console.error('Error adding surgical history:', error);
    throw error;
  }
},

async getAllergyHistory(patientId: string) {
  try {
    const response = await axios.get(`${API_URL}/patients/${patientId}/allergy-history`);
    return response.data;
  } catch (error) {
    console.error('Error fetching allergy history:', error);
    throw error;
  }
},

async addAllergyHistory(patientId: string, data: any) {
  try {
    // Convert field names to snake_case and ensure proper data types
    const payload = {
      allergy_type: data.allergyType,
      name: data.name,
      test_done: Boolean(data.testDone),
      test_results: data.testResults || null,
      notes: data.notes || null
    };
    
    console.log('Sending allergy history:', payload);
    const response = await axios.post(`${API_URL}/patients/${patientId}/allergy-history`, payload);
    return response.data;
  } catch (error) {
    console.error('Detailed allergy history error:', {
      message: error.message,
      response: error.response?.data,
      config: error.config
    });
    throw error;
  }
},

async getChronicTherapy(patientId: string) {
  try {
    const response = await axios.get(`${API_URL}/patients/${patientId}/chronic-therapy`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chronic therapy:', error);
    throw error;
  }
},

async addChronicTherapy(patientId: string, data: any) {
  try {
    const response = await axios.post(`${API_URL}/patients/${patientId}/chronic-therapy`, data);
    return response.data;
  } catch (error) {
    console.error('Error adding chronic therapy:', error);
    throw error;
  }
},

async getAllergyTreatment(patientId: string) {
  try {
    const response = await axios.get(`${API_URL}/patients/${patientId}/allergy-treatment`);
    return response.data;
  } catch (error) {
    console.error('Error fetching allergy treatment:', error);
    throw error;
  }
},

async addAllergyTreatment(patientId: string, data: any) {
  try {
    // Convert to snake_case and ensure proper data types
    const payload = {
      allergy_type: data.allergyType,
      treatment_date: data.treatmentDate,
      medication: data.medication,
      dosage: data.dosage,
      frequency: data.frequency,
      duration: data.duration,
      notes: data.notes || null  // Make notes optional
    };
    
    console.log('Sending allergy treatment:', payload);
    const response = await axios.post(
      `${API_URL}/patients/${patientId}/allergy-treatment`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error('Detailed allergy treatment error:', {
      message: error.message,
      response: error.response?.data,
      config: error.config
    });
    throw error;
  }
},
// Billing methods
async getBillingRecords(patientId: string) {
  try {
    const response = await axios.get(`${API_URL}/patients/${patientId}/billing`);
    return response.data;
  } catch (error) {
    console.error('Error fetching billing records:', error);
    throw error;
  }
},

async addBillingRecord(patientId: string, billingData: any) {
  try {
    const response = await axios.post(
      `${API_URL}/patients/${patientId}/billing`,
      billingData
    );
    return response.data;
  } catch (error) {
    console.error('Error adding billing record:', error);
    throw error;
  }
},

async updateBillingRecord(billingId: string, updateData: any) {
  try {
    const response = await axios.put(
      `${API_URL}/billing/${billingId}`,
      updateData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating billing record:', error);
    throw error;
  }
},// Dashboard Statistics
async getDashboardStats() {
  try {
    const response = await axios.get(`${API_URL}/dashboard/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
},// Appointments Service Methods
  // In PatientService.ts
async getAppointments(status?: string, search?: string) {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    
    const response = await axios.get(`${API_URL}/appointments?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching appointments:', {
      message: error.message,
      response: error.response?.data,
      config: error.config
    });
    throw error;
  }
},

// src/api/PatientService.ts
async createAppointment(appointmentData: Omit<Appointment, 'id'>) {
  try {
    const response = await axios.post(`${API_URL}/appointments`, appointmentData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.status !== 201) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    
    return response.data;
  } catch (error) {
    console.error('Detailed appointment creation error:', {
      message: error.message,
      response: error.response?.data,
      config: error.config
    });
    
    let errorMessage = 'Failed to create appointment';
    if (error.response?.data?.message) {
      errorMessage += `: ${error.response.data.message}`;
    }
    
    throw new Error(errorMessage);
  }
},
 // In PatientService.ts
async updateAppointmentStatus(id: string, status: 'scheduled' | 'completed' | 'cancelled') {
  try {
    const response = await axios.put(`${API_URL}/appointments/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
},

 async getTodayAppointments() {
  try {
    const response = await axios.get(`${API_URL}/dashboard/today-appointments`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    // Transform data to match frontend expectations
    return response.data.map((appt: any) => ({
      ...appt,
      // Ensure time is always in HH:MM format
      time: appt.time?.match(/^\d{2}:\d{2}$/) ? appt.time : '--:--'
    }));
  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    throw error;
  }
},// Get all medical records for a patient
// Medical Records
async getMedicalRecords(patientId: string) {
  try {
    const response = await axios.get(`${API_URL}/patients/${patientId}/medical-records`);
    return response.data;
  } catch (error) {
    console.error('Error fetching medical records:', error);
    throw error;
  }
},

async addMedicalRecord(patientId: string, recordData: any) {
  try {
    // Transform data to match backend expectations
    const payload = {
      ...recordData,
      visitDate: recordData.visitDate, // Already in correct format
      visitType: recordData.visitType,
      weight: recordData.weight,
      height: recordData.height,
      head_circumference: recordData.head_circumference,
      pulse: recordData.pulse,
      temperature: recordData.temperature,
      bloodPressure: recordData.bloodPressure,
      respiratoryRate: recordData.respiratoryRate,
      vaccineName: recordData.vaccineName || null,
      childAge: recordData.childAge || null,
      vaccineNotes: recordData.vaccineNotes || null,
      wellChildNotes: recordData.wellChildNotes || null,
      symptoms: recordData.symptoms || null,
      diagnosis: recordData.diagnosis || null,
      treatment: recordData.treatment || null,
      prescribedMedications: recordData.prescribedMedications || null
    };

    const response = await axios.post(
      `${API_URL}/patients/${patientId}/medical-records`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error('Error adding medical record:', error);
    throw error;
  }
},// In your PatientService
 async uploadScreeningTest(patientId: string, formData: FormData) {
  const response = await fetch(`${API_URL}/patients/${patientId}/screening-tests`, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header - the browser will set it automatically
    // with the correct boundary for FormData
  });
  return response.json();
}
};
