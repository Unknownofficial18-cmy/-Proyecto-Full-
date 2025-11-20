export interface PatientI {
  id?: number;
  name: string;
  last_name: string;
  gender: "M" | "F" | "O"; 
  type_document: "R.C" | "T.I" | "C.C" | "C.E" | "PAS";
  documentnumber: string;
  birth_date: string;
  address: string;
  telephone: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface PatientResponseI {
  id?: number;
  name: string;
  last_name: string;
  gender: "M" | "F" | "O"; 
  type_document: "R.C" | "T.I" | "C.C" | "C.E" | "PAS"; 
  documentnumber: string;
  birth_date: string;
  address: string;
  telephone: string;
  status: "ACTIVE" | "INACTIVE";
}

export const DocumentTypeOptions = [
  { label: 'Registro Civil', value: 'R.C' },
  { label: 'Tarjeta de Identidad', value: 'T.I' },
  { label: 'Cédula de Ciudadanía', value: 'C.C' },
  { label: 'Cédula de Extranjería', value: 'C.E' },
  { label: 'Pasaporte', value: 'PAS' }
];

export const GenderOptions = [
  { label: 'Masculino', value: 'M' },
  { label: 'Femenino', value: 'F' },
  { label: 'Otros', value: 'O' }
];