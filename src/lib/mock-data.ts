// Types
export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female';
  primaryCondition: string;
  parentName: string;
  parentOccupation: string;
  address: string;
  motherPhone: string;
  fatherPhone: string;
  homePhone: string;
  email: string;
  insuranceInfo: string;
  schoolName: string;
  dateOfBirth?: string; // Added field
  motherName?: string; // Added field
  fatherName?: string; // Added field
  screeningPerformedDate?: string; // Added field
  diagnosticResult?: string; // Added field
  birthInfo: {
    deliveryType: 'C-Section' | 'NVD';
    gestationWeeks: number;
    birthWeight: number;
    birthHeight: number;
    headCircumference: number;
    prenatalComplications: string;
    icnAdmission: boolean;
    icnAdmissionReason: string;
  };
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string; // Added field
}

export interface Consultation {
  id: string;
  patientId: string;
  type: 'vaccine' | 'well-child' | 'disease';
  date: string;
  notes: string;
  vaccineInfo?: {
    name: string;
    childAge: string;
  };
  wellChildInfo?: {
    development: string;
    height: number;
    weight: number;
  };
  diseaseInfo?: {
    symptoms: string;
    diagnosis: string;
    medication: string;
    dosage: string;
  };
}

// Mock Data
export const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    age: 8,
    gender: 'Female',
    primaryCondition: 'Asthma',
    parentName: 'Michael Johnson',
    parentOccupation: 'Engineer',
    address: '123 Main St, Cityville',
    motherPhone: '555-123-4567',
    fatherPhone: '555-123-4568',
    homePhone: '555-123-4569',
    email: 'johnson@example.com',
    insuranceInfo: 'MedCare Insurance #12345',
    schoolName: 'Cityville Elementary',
    dateOfBirth: '2017-05-10',
    motherName: 'Jessica Johnson',
    fatherName: 'Michael Johnson',
    screeningPerformedDate: '2023-08-15',
    diagnosticResult: 'Normal',
    birthInfo: {
      deliveryType: 'C-Section',
      gestationWeeks: 38,
      birthWeight: 3.2,
      birthHeight: 49,
      headCircumference: 34,
      prenatalComplications: 'None',
      icnAdmission: false,
      icnAdmissionReason: '',
    },
    createdAt: '2023-01-15',
  },
  {
    id: '2',
    name: 'Thomas Wilson',
    age: 5,
    gender: 'Male',
    primaryCondition: 'Allergies',
    parentName: 'Jennifer Wilson',
    parentOccupation: 'Teacher',
    address: '456 Oak Ave, Townsburg',
    motherPhone: '555-987-6543',
    fatherPhone: '555-987-6544',
    homePhone: '555-987-6545',
    email: 'wilson@example.com',
    insuranceInfo: 'HealthPlus #56789',
    schoolName: 'Townsburg Kindergarten',
    dateOfBirth: '2020-02-15',
    motherName: 'Jennifer Wilson',
    fatherName: 'Robert Wilson',
    screeningPerformedDate: '2023-10-05',
    diagnosticResult: 'Normal',
    birthInfo: {
      deliveryType: 'NVD',
      gestationWeeks: 39,
      birthWeight: 3.5,
      birthHeight: 51,
      headCircumference: 35,
      prenatalComplications: 'Mild hypertension',
      icnAdmission: false,
      icnAdmissionReason: '',
    },
    createdAt: '2023-04-22',
  },
  {
    id: '3',
    name: 'Emma Davis',
    age: 3,
    gender: 'Female',
    primaryCondition: 'Eczema',
    parentName: 'Robert Davis',
    parentOccupation: 'Accountant',
    address: '789 Pine Rd, Villagetown',
    motherPhone: '555-456-7890',
    fatherPhone: '555-456-7891',
    homePhone: '555-456-7892',
    email: 'davis@example.com',
    insuranceInfo: 'CarePlus #98765',
    schoolName: 'Villagetown Preschool',
    dateOfBirth: '2022-01-20',
    motherName: 'Amanda Davis',
    fatherName: 'Robert Davis',
    screeningPerformedDate: '2024-01-10',
    diagnosticResult: 'Abnormal',
    birthInfo: {
      deliveryType: 'NVD',
      gestationWeeks: 40,
      birthWeight: 3.1,
      birthHeight: 48,
      headCircumference: 33,
      prenatalComplications: 'None',
      icnAdmission: false,
      icnAdmissionReason: '',
    },
    createdAt: '2024-02-10',
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'Sarah Johnson',
    date: '2025-05-10',
    time: '09:00',
    reason: 'Annual check-up',
    status: 'scheduled',
    notes: 'Bring medical history records',
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Thomas Wilson',
    date: '2025-05-11',
    time: '10:30',
    reason: 'Vaccination',
    status: 'scheduled',
    notes: 'MMR vaccine scheduled',
  },
  {
    id: '3',
    patientId: '3',
    patientName: 'Emma Davis',
    date: '2025-05-12',
    time: '14:00',
    reason: 'Eczema follow-up',
    status: 'scheduled',
    notes: 'Check on treatment effectiveness',
  },
  {
    id: '4',
    patientId: '1',
    patientName: 'Sarah Johnson',
    date: '2025-04-20',
    time: '11:15',
    reason: 'Asthma review',
    status: 'completed',
    notes: 'Inhaler technique checked, good control',
  },
];

export const mockConsultations: Consultation[] = [
  {
    id: '1',
    patientId: '1',
    type: 'vaccine',
    date: '2025-04-20',
    notes: 'Patient handled vaccination well with no immediate adverse reactions.',
    vaccineInfo: {
      name: 'MMR',
      childAge: '7 years',
    },
  },
  {
    id: '2',
    patientId: '2',
    type: 'disease',
    date: '2025-04-15',
    notes: 'Prescribed antihistamine for 7 days. Follow-up if symptoms persist.',
    diseaseInfo: {
      symptoms: 'Sneezing, itchy eyes, runny nose',
      diagnosis: 'Seasonal allergies',
      medication: 'Cetirizine',
      dosage: '5mg once daily',
    },
  },
  {
    id: '3',
    patientId: '3',
    type: 'well-child',
    date: '2025-04-10',
    notes: 'Development on track. Eczema improving with prescribed regimen.',
    wellChildInfo: {
      development: 'Normal speech and motor skills',
      height: 94,
      weight: 14.2,
    },
  },
];

export interface Vaccine {
  id: string;
  patientId: string;
  name: string;
  alternatives: string;
  dose: string;
  childAge: string;
  dateAdministered: string;
  notes: string;
}

export const mockVaccines: Vaccine[] = [
  {
    id: '1',
    patientId: '1',
    name: 'MMR',
    alternatives: 'MMRV',
    dose: 'Second',
    childAge: '7 years',
    dateAdministered: '2025-04-20',
    notes: 'No adverse reactions',
  },
  {
    id: '2',
    patientId: '2',
    name: 'DTaP',
    alternatives: 'Tdap',
    dose: 'Fourth',
    childAge: '4 years',
    dateAdministered: '2025-03-15',
    notes: 'Slight fever after 24 hours',
  },
  {
    id: '3',
    patientId: '3',
    name: 'Hepatitis A',
    alternatives: 'None',
    dose: 'First',
    childAge: '2 years',
    dateAdministered: '2025-01-10',
    notes: 'Well tolerated',
  },
];

export interface FamilyHistory {
  patientId: string;
  condition: string;
  father: boolean;
  mother: boolean;
  other: boolean;
  notes: string;
}

export const mockFamilyHistory: FamilyHistory[] = [
  { patientId: '1', condition: 'Allergy', father: true, mother: false, other: true, notes: 'Grandfather has severe allergies' },
  { patientId: '1', condition: 'Diabetes', father: false, mother: true, other: false, notes: 'Mother diagnosed at age 45' },
  { patientId: '2', condition: 'Hypertension', father: true, mother: true, other: false, notes: 'Both parents on medication' },
];

export interface SurgicalHistory {
  id: string;
  patientId: string;
  type: string;
  date: string;
  ageAtSurgery: string;
  notes: string;
}

export const mockSurgicalHistory: SurgicalHistory[] = [
  { id: '1', patientId: '1', type: 'Tonsillectomy', date: '2022-07-15', ageAtSurgery: '5 years', notes: 'No complications' },
  { id: '2', patientId: '3', type: 'Ear tube placement', date: '2024-01-20', ageAtSurgery: '2 years', notes: 'Bilateral tubes for recurrent ear infections' },
];

export interface AllergyHistory {
  id: string;
  patientId: string;
  allergyType: 'Medication' | 'Food' | 'Environmental' | 'Other';
  name: string;
  testDone: 'Yes' | 'No';
  testResults: string;
  notes: string;
  attachmentUrl?: string;
}

export const mockAllergyHistory: AllergyHistory[] = [
  { id: '1', patientId: '2', allergyType: 'Food', name: 'Peanuts', testDone: 'Yes', testResults: 'Positive skin prick test', notes: 'Moderate reaction, avoid all peanut products' },
  { id: '2', patientId: '1', allergyType: 'Environmental', name: 'Pollen', testDone: 'Yes', testResults: 'Elevated IgE levels', notes: 'Seasonal symptoms, worse in spring' },
];

export interface ChronicTherapy {
  id: string;
  patientId: string;
  medication: string;
  birthTo1YearPrevention: string;
  oneYearTo2YearsPrevention: string;
  treatment: string;
  notes?: string; // Added field
}

export const mockChronicTherapy: ChronicTherapy[] = [
  { id: '1', patientId: '1', medication: 'Albuterol', birthTo1YearPrevention: 'N/A', oneYearTo2YearsPrevention: 'N/A', treatment: 'Rescue inhaler for asthma symptoms', notes: 'Use as needed for wheezing or shortness of breath' },
  { id: '2', patientId: '3', medication: 'Hydrocortisone cream', birthTo1YearPrevention: 'Moisturize daily', oneYearTo2YearsPrevention: 'Avoid irritants, daily moisturizing', treatment: 'Apply 1% cream to affected areas twice daily', notes: 'Avoid applying to face and neck area' },
];

export interface AllergyTreatment {
  id: string;
  patientId: string;
  allergyType: 'Medication' | 'Food' | 'Environmental' | 'Other';
  date: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
}

export const mockAllergyTreatments: AllergyTreatment[] = [
  { id: '1', patientId: '2', allergyType: 'Food', date: '2025-04-01', medication: 'Epinephrine auto-injector', dosage: '0.15mg', frequency: 'As needed', duration: 'Indefinite', notes: 'For emergency use only in case of anaphylaxis' },
  { id: '2', patientId: '1', allergyType: 'Environmental', date: '2025-03-15', medication: 'Loratadine', dosage: '5mg', frequency: 'Once daily', duration: 'During pollen season', notes: 'Take in the morning with or without food' },
];

export interface ScreeningTest {
  id: string;
  patientId: string;
  type: string;
  performed: 'Yes' | 'No';
  result: 'Normal' | 'Abnormal';
  notes: string;
  performedDate?: string; // Added field
}

export const mockScreeningTests: ScreeningTest[] = [
  { id: '1', patientId: '1', type: 'Hearing', performed: 'Yes', result: 'Normal', notes: 'Passed all frequencies', performedDate: '2023-11-15' },
  { id: '2', patientId: '2', type: 'Vision', performed: 'Yes', result: 'Abnormal', notes: 'Referred to ophthalmologist', performedDate: '2023-12-10' },
  { id: '3', patientId: '3', type: 'Dental Referral', performed: 'No', result: 'Normal', notes: 'Scheduled for next visit', performedDate: '2024-01-05' },
];

export interface Diagnostic {
  id: string;
  patientId: string;
  test: string;
  date: string;
  results: string;
  observations: string;
  attachmentName?: string;
}

export const mockDiagnostics: Diagnostic[] = [
  { id: '1', patientId: '1', test: 'Blood Test', date: '2025-04-20', results: 'Normal', observations: 'Complete blood count within normal ranges', attachmentName: 'sarah_cbc_results.pdf' },
  { id: '2', patientId: '2', test: 'Radiology', date: '2025-04-15', results: 'Pending', observations: 'Chest X-ray for persistent cough', attachmentName: 'thomas_chest_xray.jpg' },
  { id: '3', patientId: '3', test: 'Hip X-ray', date: '2025-04-10', results: 'Normal', observations: 'No developmental issues identified', attachmentName: 'emma_hip_xray.jpg' },
];

export interface Document {
  id: string;
  patientId: string;
  patientName: string;
  name: string;
  uploadDate: string;
  type: 'consultation' | 'diagnostic' | 'vaccination' | 'medicalHistory' | 'billing';
  fileUrl: string; // In a real app, this would be a URL to the document storage
  doctorNotes?: string; // Added field
}

export const mockDocuments: Document[] = [
  { id: '1', patientId: '1', patientName: 'Sarah Johnson', name: 'Asthma Action Plan', uploadDate: '2025-04-20', type: 'consultation', fileUrl: '/documents/sarah_asthma_plan.pdf', doctorNotes: 'Reviewed and updated for summer activities' },
  { id: '2', patientId: '2', patientName: 'Thomas Wilson', name: 'Allergy Test Results', uploadDate: '2025-04-15', type: 'medicalHistory', fileUrl: '/documents/thomas_allergy_results.pdf', doctorNotes: 'Shows sensitivity to tree nuts and pollen' },
  { id: '3', patientId: '3', patientName: 'Emma Davis', name: 'Growth Chart', uploadDate: '2025-04-10', type: 'diagnostic', fileUrl: '/documents/emma_growth_chart.pdf', doctorNotes: 'Height and weight within normal percentiles' },
];

export interface BillingRecord {
  id: string;
  patientId: string;
  patientName: string;
  service: string;
  cost: number;
  date: string;
  paid: boolean;
}

export const mockBillingRecords: BillingRecord[] = [
  { id: '1', patientId: '1', patientName: 'Sarah Johnson', service: 'Annual check-up', cost: 150, date: '2025-04-20', paid: true },
  { id: '2', patientId: '2', patientName: 'Thomas Wilson', service: 'Vaccination - DTaP', cost: 85, date: '2025-03-15', paid: true },
  { id: '3', patientId: '3', patientName: 'Emma Davis', service: 'Eczema consultation', cost: 120, date: '2025-04-10', paid: false },
];

// Helper functions
export const getPatientById = (id: string) => {
  return mockPatients.find(patient => patient.id === id) || null;
};

export const getPatientAppointments = (patientId: string) => {
  return mockAppointments.filter(appointment => appointment.patientId === patientId);
};

export const getPatientConsultations = (patientId: string) => {
  return mockConsultations.filter(consultation => consultation.patientId === patientId);
};

export const getPatientVaccines = (patientId: string) => {
  return mockVaccines.filter(vaccine => vaccine.patientId === patientId);
};

export const getPatientFamilyHistory = (patientId: string) => {
  return mockFamilyHistory.filter(history => history.patientId === patientId);
};

export const getPatientSurgicalHistory = (patientId: string) => {
  return mockSurgicalHistory.filter(history => history.patientId === patientId);
};

export const getPatientAllergyHistory = (patientId: string) => {
  return mockAllergyHistory.filter(history => history.patientId === patientId);
};

export const getPatientChronicTherapy = (patientId: string) => {
  return mockChronicTherapy.filter(therapy => therapy.patientId === patientId);
};

export const getPatientAllergyTreatments = (patientId: string) => {
  return mockAllergyTreatments.filter(treatment => treatment.patientId === patientId);
};

export const getPatientScreeningTests = (patientId: string) => {
  return mockScreeningTests.filter(test => test.patientId === patientId);
};

export const getPatientDiagnostics = (patientId: string) => {
  return mockDiagnostics.filter(diagnostic => diagnostic.patientId === patientId);
};

export const getPatientDocuments = (patientId: string) => {
  return mockDocuments.filter(document => document.patientId === patientId);
};

export const getPatientBillingRecords = (patientId: string) => {
  return mockBillingRecords.filter(record => record.patientId === patientId);
};

// Stats for dashboard
export const getClinicStats = () => {
  const totalPatients = mockPatients.length;
  const upcomingAppointments = mockAppointments.filter(
    (appointment) => appointment.status === 'scheduled'
  ).length;
  const completedAppointments = mockAppointments.filter(
    (appointment) => appointment.status === 'completed'
  ).length;
  
  return {
    totalPatients,
    upcomingAppointments,
    completedAppointments,
  };
};
