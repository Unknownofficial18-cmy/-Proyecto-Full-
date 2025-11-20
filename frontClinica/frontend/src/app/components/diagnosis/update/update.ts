import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Subscription, switchMap } from 'rxjs';
import { DiagnosisService } from '../../../services/diagnosis';
import { DiagnosisI, DiagnosisResponseI } from '../../../models/diagnosis';
import { AppointmentService } from '../../../services/appointment';
import { AppointmentResponseI } from '../../../models/appointments';

@Component({
  selector: 'app-update',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './update.html',
})
export class Update implements OnInit, OnDestroy {
  diagnosisForm: FormGroup;
  loading = false;
  submitting = false;
  diagnosisId!: number;
  diagnosis!: DiagnosisResponseI;
  appointments: AppointmentResponseI[] = [];
  
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private diagnosisService: DiagnosisService,
    private appointmentService: AppointmentService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.diagnosisForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadDiagnosisData();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadDiagnosisData(): void {
    this.loading = true;
    
    this.subscription.add(
      this.route.paramMap.pipe(
        switchMap(params => {
          this.diagnosisId = Number(params.get('id'));
          return this.diagnosisService.getDiagnosisById(this.diagnosisId);
        })
      ).subscribe({
        next: (diagnosis) => {
          this.diagnosis = diagnosis;
          this.patchFormValues(this.diagnosis);
          this.loadAppointments();
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar el diagnóstico'
          });
          this.loading = false;
        }
      })
    );
  }

  loadAppointments(): void {
    this.subscription.add(
      this.appointmentService.getAllAppointments().subscribe({
        next: (appointments) => {
          // Incluir la cita actual aunque no esté "ATENDIDA"
          const currentAppointment = this.appointments.find(apt => apt.id === this.diagnosis.appointment_id);
          if (currentAppointment) {
            this.appointments = [currentAppointment, ...appointments.filter(apt => 
              apt.status === 'ATENDIDA' && apt.id !== this.diagnosis.appointment_id
            )];
          } else {
            this.appointments = appointments.filter(apt => apt.status === 'ATENDIDA');
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las citas'
          });
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

  patchFormValues(diagnosis: DiagnosisResponseI): void {
    this.diagnosisForm.patchValue({
      appointment_id: diagnosis.appointment_id,
      description: diagnosis.description
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
    const formData: Partial<DiagnosisI> = this.diagnosisForm.value;

    this.subscription.add(
      this.diagnosisService.updateDiagnosis(this.diagnosisId, formData).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Diagnóstico actualizado correctamente'
          });
          
          setTimeout(() => {
            this.router.navigate(['/diagnosis']);
          }, 1500);
        },
        error: (error) => {
          let errorDetail = 'No se pudo actualizar el diagnóstico';
          
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