export interface AppointmentI {
  id?: number;
  appointment_date: string; 
  reason: string;
  patient_id: number;
  doctor_id: number;
  status: AppointmentStatus;
}

export interface AppointmentResponseI {
  id: number;
  appointment_date: string;
  reason: string;
  patient_id: number;
  patient?: {
    id: number;
    name: string;
    last_name: string;
  };
  doctor_id: number;
  doctor?: {
    id: number;
    name: string;
    last_name: string;
    specialty?: {  
      id: number;
      specialtyname: string;
    };
    specialty_id?: number;
  };
  status: AppointmentStatus;
}

export type AppointmentStatus = 'PENDIENTE' | 'ATENDIDA' | 'CANCELADA' | 'REPROGRAMADA' | 'NO ASISTIO';


export const AppointmentStatusOptions = [
  { label: 'Pendiente', value: 'PENDIENTE' },
  { label: 'Atendida', value: 'ATENDIDA' },
  { label: 'Cancelada', value: 'CANCELADA' },
  { label: 'Reprogramada', value: 'REPROGRAMADA' },
  { label: 'No Asistió', value: 'NO ASISTIO' }
];


export interface AppointmentDisplayI {
  id: number;
  fechaHora: string;
  paciente: string;
  doctor: string;
  motivo: string;
  estado: string;
  estadoColor: string;
}