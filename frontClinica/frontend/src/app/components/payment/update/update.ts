import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PaymentService } from '../../../services/payment';
import { AppointmentService } from '../../../services/appointment';
import { AppointmentResponseI } from '../../../models/appointments';

@Component({
  selector: 'app-update',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    ButtonModule, 
    InputTextModule, 
    SelectModule,
    ToastModule
  ],
  templateUrl: './update.html',
  providers: [MessageService]
})
export class Update implements OnInit {
  form: FormGroup;
  loading = false;
  paymentId!: number;
  
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
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private appointmentService: AppointmentService,
    private messageService: MessageService
  ) {
    this.form = this.fb.group({
      payment_method: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      appointment_id: ['', Validators.required],
      payment_status: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.paymentId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAppointments();
    this.loadPayment();
  }

  loadAppointments(): void {
    this.appointmentService.getAllAppointments().subscribe({
      next: (appointments) => {
        const activeAppointments = appointments.filter(apt => 
          apt.status !== 'CANCELADA' && apt.status !== 'NO ASISTIO'
        );

        this.appointmentOptions = activeAppointments.map(appointment => ({
          label: `Cita #${appointment.id} - ${appointment.patient?.name || 'Paciente'} - ${new Date(appointment.appointment_date).toLocaleDateString()}`,
          value: appointment.id
        }));
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las citas'
        });
      }
    });
  }

  loadPayment(): void {
    this.loading = true;
    this.paymentService.getPaymentById(this.paymentId).subscribe({
      next: (payment) => {
        this.form.patchValue({
          payment_method: payment.payment_method,
          amount: payment.amount,
          appointment_id: payment.appointment_id,
          payment_status: payment.payment_status
        });
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el pago'
        });
        this.loading = false;
        this.router.navigate(['/payments']);
      }
    });
  }

  submit(): void {
    if (this.form.valid) {
      this.loading = true;

      const paymentData = {
        ...this.form.value,
        amount: parseFloat(this.form.value.amount),
        appointment_id: parseInt(this.form.value.appointment_id)
      };

      this.paymentService.updatePayment(this.paymentId, paymentData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Pago actualizado correctamente'
          });
          setTimeout(() => this.router.navigate(['/payments']), 1000);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar el pago'
          });
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Complete todos los campos requeridos'
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
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['min']) return 'El valor debe ser mayor a 0';
    }
    return '';
  }
}