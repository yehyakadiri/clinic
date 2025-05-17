// src/types/appointment.ts
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  patient_name: string;
  date: string;
  time: string;
  type: string;
  reason?: string;
  notes?: string;
  status?: 'scheduled' | 'completed' | 'cancelled'; // Make sure this matches your type definition
  created_at?: string;
}