import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { TextareaModule } from 'primeng/textarea'; 
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { DiagnosisService } from '../../../services/diagnosis';
import { DiagnosisI } from '../../../models/diagnosis';
import { AppointmentService } from '../../../services/appointment';
import { AppointmentResponseI } from '../../../models/appointments';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    ToastModule,
    TextareaModule, 

  ],
  providers: [MessageService],
  templateUrl: './create.html',
  styleUrl: './create.css'
})
export class Create implements OnInit, OnDestroy {
  diagnosisForm: FormGroup;
  loading = false;
  submitting = false;
  appointments: AppointmentResponseI[] = [];
  
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private diagnosisService: DiagnosisService,
    private appointmentService: AppointmentService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.diagnosisForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadAppointments();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadAppointments(): void {
    this.loading = true;
    this.subscription.add(
      this.appointmentService.getAllAppointments().subscribe({
        next: (appointments) => {
          this.appointments = appointments.filter(apt => 
            apt.status === 'ATENDIDA'
          );
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las citas'
          });
          this.loading = false;
        }
      })
    );
  }

  createForm(): FormGroup {
    return this.fb.group({
      appointment_id: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
    });
  }

  onSubmit(): void {
    if (this.diagnosisForm.invalid) {
      this.markFormGroupTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Por favor complete todos los campos requeridos'
      });
      return;
    }

    this.submitting = true;
    const formData: DiagnosisI = this.diagnosisForm.value;

    this.subscription.add(
      this.diagnosisService.createDiagnosis(formData).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Diagnóstico creado correctamente'
          });
          
          setTimeout(() => {
            this.router.navigate(['/diagnosis']);
          }, 1500);
        },
        error: (error) => {
          let errorDetail = 'No se pudo crear el diagnóstico';
          
          if (error.error) {
            if (error.error.description) {
              errorDetail = `Descripción: ${error.error.description[0]}`;
            } else if (error.error.appointment_id) {
              errorDetail = `Cita: ${error.error.appointment_id[0]}`;
            } else if (error.error.non_field_errors) {
              errorDetail = error.error.non_field_errors[0];
            }
          }
          
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorDetail
          });
          this.submitting = false;
        }
      })
    );
  }

  onCancel(): void {
    this.router.navigate(['/diagnosis']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.diagnosisForm.controls).forEach(key => {
      const control = this.diagnosisForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.diagnosisForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  getFieldError(fieldName: string): string {
    const field = this.diagnosisForm.get(fieldName);
    if (field?.errors?.['required']) {
      return 'Este campo es requerido';
    }
    if (field?.errors?.['minlength']) {
      return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    }
    if (field?.errors?.['maxlength']) {
      return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    }
    return '';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPatientName(appointment: AppointmentResponseI): string {
    if (appointment.patient) {
      return `${appointment.patient.name} ${appointment.patient.last_name}`;
    }
    return `Paciente #${appointment.patient_id}`;
  }

  getDoctorName(appointment: AppointmentResponseI): string {
    if (appointment.doctor) {
      return `Dr. ${appointment.doctor.name} ${appointment.doctor.last_name}`;
    }
    return `Doctor #${appointment.doctor_id}`;
  }
}