import { MedicineResponseI } from './medicines';

export interface RecipeDetailI {
  amount: number;
  indications: string;
  prescription_id: number;
  medicine_id: number;
}

export interface RecipeDetailResponseI {
  id: number;
  amount: number;
  indications: string;
  prescription_id: number;
  medicine_id: number;
  medicine: MedicineResponseI;  
}