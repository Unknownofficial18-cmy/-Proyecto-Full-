
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PaymentService } from '../../../services/payment';
import { AppointmentService } from '../../../services/appointment';
import { AppointmentResponseI } from '../../../models/appointments';
import { PaymentStatus } from '../../../models/payment';
@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    ButtonModule, 
    InputTextModule, 
    SelectModule,
    ToastModule
  ],
  templateUrl: './create.html',
  styleUrl: './create.css',
  providers: [MessageService]
})
export class Create implements OnInit {
  form: FormGroup;
  loading: boolean = false;
  loadingAppointments: boolean = false;
  
  // Opciones para los dropdowns
  paymentMethodOptions = [
    { label: 'Efectivo', value: 'EFECTIVO' },
    { label: 'Tarjeta', value: 'TARJETA' },
    { label: 'Transferencia Bancaria', value: 'TRANSFERENCIA_BANCARIA' }
  ];
  
  paymentStatusOptions = [
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'Recibido', value: 'RECIBIDO' },
    { label: 'Cancelado', value: 'CANCELADO' },
    { label: 'Reembolsado', value: 'REEMBOLSADO' }
  ];

  appointmentOptions: { label: string, value: number }[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private paymentService: PaymentService,
    private appointmentService: AppointmentService,
    private messageService: MessageService
  ) {
    this.form = this.fb.group({
      payment_method: ['EFECTIVO', [Validators.required]],
      amount: ['', [
        Validators.required, 
        Validators.min(0.01),
        Validators.pattern(/^\d+(\.\d{1,2})?$/)
      ]],
      appointment_id: ['', [Validators.required]],
      payment_status: ['PENDIENTE', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loadingAppointments = true;
    this.appointmentService.getAllAppointments().subscribe({
      next: (appointments) => {
        // Filtrar solo citas que podrían necesitar pago (por ejemplo, no canceladas)
        const activeAppointments = appointments.filter(apt => 
          apt.status !== 'CANCELADA' && apt.status !== 'NO ASISTIO'
        );

        // Transformar las citas a opciones para el dropdown
        this.appointmentOptions = activeAppointments.map(appointment => ({
          label: this.formatAppointmentLabel(appointment),
          value: appointment.id
        }));
        
        this.loadingAppointments = false;
        
        if (this.appointmentOptions.length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Sin citas disponibles',
            detail: 'No hay citas activas para asignar pagos'
          });
        }
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las citas'
        });
        this.loadingAppointments = false;
      }
    });
  }

  private formatAppointmentLabel(appointment: AppointmentResponseI): string {
    const patientName = appointment.patient 
      ? `${appointment.patient.name} ${appointment.patient.last_name}`
      : 'Paciente no disponible';
    
    const doctorName = appointment.doctor 
      ? `Dr. ${appointment.doctor.name} ${appointment.doctor.last_name}`
      : 'Doctor no disponible';
    
    const specialty = appointment.doctor?.specialty?.specialtyname 
      ? ` - ${appointment.doctor.specialty.specialtyname}`
      : '';
    
    const date = appointment.appointment_date 
      ? new Date(appointment.appointment_date).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Sin fecha';
    
    return `Cita #${appointment.id} - ${patientName} - ${doctorName}${specialty} - ${date}`;
  }

  // === MÉTODOS PARA EL MONTO ===
  cleanAmountInput(event: any): void {
    const input = event.target;
    let value = input.value;
    
    // Permitir solo números y un punto decimal
    value = value.replace(/[^\d.]/g, '');
    
    // Permitir solo un punto decimal
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limitar a 2 decimales
    if (parts.length === 2 && parts[1].length > 2) {
      value = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    this.form.patchValue({ amount: value });
    input.value = value;
  }

  onAmountKeyPress(event: KeyboardEvent): boolean {
    const charCode = event.charCode;
    const currentValue = (event.target as HTMLInputElement).value;
    
    // Permitir números (48-57), punto (46), y teclas de control
    if (charCode === 46) { // punto
      // Solo permitir un punto decimal
      if (currentValue.includes('.')) {
        event.preventDefault();
        return false;
      }
      return true;
    }
    
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }
    
    // Si ya hay decimales, verificar que no excedan 2 dígitos
    if (currentValue.includes('.')) {
      const decimalPart = currentValue.split('.')[1];
      if (decimalPart && decimalPart.length >= 2) {
        event.preventDefault();
        return false;
      }
    }
    
    return true;
  }

  onAmountPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    
    // Limpiar el texto pegado para permitir solo números y un punto decimal
    let cleanedValue = pastedText.replace(/[^\d.]/g, '');
    
    // Manejar múltiples puntos decimales
    const parts = cleanedValue.split('.');
    if (parts.length > 2) {
      cleanedValue = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limitar decimales a 2
    if (parts.length === 2 && parts[1].length > 2) {
      cleanedValue = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const currentValue = this.form.get('amount')?.value || '';
    const newValue = currentValue.substring(0, start) + cleanedValue + currentValue.substring(end);
    
    this.form.patchValue({ amount: newValue });
    input.value = newValue;
    
    setTimeout(() => {
      input.setSelectionRange(start + cleanedValue.length, start + cleanedValue.length);
    });
  }

  submit(): void {
    if (this.form.valid) {
      this.loading = true;
      const paymentData = {
        ...this.form.value,
        amount: parseFloat(this.form.value.amount),
        appointment_id: this.form.value.appointment_id
      };

      this.paymentService.createPayment(paymentData).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Pago creado correctamente'
          });
          setTimeout(() => {
            this.router.navigate(['/payments']);
          }, 1000);
        },
        error: (error) => {
          console.error('Error creating payment:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear el pago'
          });
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor complete todos los campos requeridos'
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/payments']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) {
        const fieldLabels: { [key: string]: string } = {
          'payment_method': 'El método de pago',
          'amount': 'El monto',
          'appointment_id': 'La cita',
          'payment_status': 'El estado del pago'
        };
        return `${fieldLabels[fieldName] || fieldName} es requerido`;
      }
      if (field.errors['min']) {
        if (fieldName === 'amount') return 'El monto debe ser mayor a 0';
      }
      if (field.errors['pattern']) {
        if (fieldName === 'amount') return 'El monto debe ser un número válido (ej: 100.50)';
      }
    }
    return '';
  }
  formatAmountPreview(amount: string): string {
  if (!amount) return '$0.00';
  const numAmount = parseFloat(amount);
  return isNaN(numAmount) ? '$0.00' : `$${numAmount.toFixed(2)}`;
}
getPaymentMethodLabel(method: string): string {
  const methods = {
    'EFECTIVO': 'Efectivo',
    'TARJETA': 'Tarjeta', 
    'TRANSFERENCIA_BANCARIA': 'Transferencia Bancaria'
  };
  return methods[method as keyof typeof methods] || method;
}

getPaymentStatusLabel(status: string): string {
  const statuses = {
    'PENDIENTE': 'Pendiente',
    'RECIBIDO': 'Recibido',
    'CANCELADO': 'Cancelado',
    'REEMBOLSADO': 'Reembolsado'
  };
  return statuses[status as keyof typeof statuses] || status;
}

getStatusBadgeClass(status: PaymentStatus): string {
  switch (status) {
    case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded border border-yellow-200';
    case 'RECIBIDO': return 'bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border border-green-200';
    case 'CANCELADO': return 'bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded border border-red-200';
    case 'REEMBOLSADO': return 'bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-200';
    default: return 'bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-200';
  }
}
}