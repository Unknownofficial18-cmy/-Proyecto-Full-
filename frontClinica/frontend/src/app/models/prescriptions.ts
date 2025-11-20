import { RecipeDetailResponseI } from './recipedetails';

export interface PrescriptionI {
  id?: number;
  prescription_date: string;
  appointment_id: number;
}

export interface PrescriptionResponseI {
  id: number;
  prescription_date: string;
  appointment_id: number;
  appointment?: {
    id: number;
    appointment_date: string;
    reason: string;
    patient_id: number;
    doctor_id: number;
    status: string;
    patient?: {
      id: number;
      name: string;
      last_name: string;
    };
    doctor?: {
      id: number;
      name: string;
      last_name: string;
      specialty?: {
        id: number;
        specialtyname: string;
      };
    };
  };
  // ← AGREGAR ESTE CAMPO QUE FALTA
  recipe_details?: RecipeDetailResponseI[];
}

