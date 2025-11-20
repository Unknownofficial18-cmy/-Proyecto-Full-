export interface MedicalProcedureI {
  id?: number;
  description: string;
  appointment_id: number;
}

export interface MedicalProcedureResponseI {
  id: number;
  description: string;
  appointment_id: number;
  appointment: {
    id: number;
    appointment_date: string;
    reason: string;
    patient_id: number;
    doctor_id: number;
    status: string;
  };
  patient: {
    id: number;
    name: string;
    last_name: string;
    email?: string;
    phone?: string;
  };
  doctor: {
    id: number;
    name: string;
    last_name: string;
    specialty?: {
      id: number;
      specialtyname: string;
    };
    specialty_id?: number;
  };
}