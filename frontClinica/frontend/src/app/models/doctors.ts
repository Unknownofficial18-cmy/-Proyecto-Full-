export interface DoctorI {
  id?: number;
  name: string;
  last_name: string;
  gender: "M" | "F" | "OTHER";
  telephone: string;
  email: string;
  specialty_id: number;
  status: "ACTIVE" | "INACTIVE";
}


export interface DoctorResponseI {
    id?: number;
    name: string;
    last_name: string;
    gender: "M" | "F" | "OTHER";
    telephone: string;
    email: string;
    specialty_id: number;
    status: "ACTIVE" | "INACTIVE";
    created_at?: string; 
    updated_at?: string;             
}