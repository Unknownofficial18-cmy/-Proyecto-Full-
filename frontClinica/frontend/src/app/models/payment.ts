export interface PaymentI {
  id?: number;
  payment_method: PaymentMethod;
  payment_date: string; // ISO string format
  amount: number; // Para enviar al backend
  appointment_id: number;
  payment_status: PaymentStatus;
}

export interface PaymentResponseI {
  id?: number;
  payment_method: PaymentMethod;
  payment_date: string; 
  amount: string; // El backend devuelve string por DecimalField
  appointment_id: number;
  payment_status: PaymentStatus;
}

export type PaymentMethod = 
  | 'EFECTIVO' 
  | 'TARJETA' 
  | 'TRANSFERENCIA_BANCARIA';

export type PaymentStatus = 
  | 'PENDIENTE' 
  | 'RECIBIDO' 
  | 'CANCELADO' 
  | 'REEMBOLSADO';