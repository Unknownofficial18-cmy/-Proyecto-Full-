import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Subscription, switchMap } from 'rxjs';
import { MedicalProcedureService } from '../../../services/medicalprocedure';
import { MedicalProcedureI, MedicalProcedureResponseI } from '../../../models/medicalprocedure';
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
  procedureForm: FormGroup;
  loading = false;
  submitting = false;
  procedureId!: number;
  procedure!: MedicalProcedureResponseI;
  appointments: AppointmentResponseI[] = [];
  
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private medicalProcedureService: MedicalProcedureService,
    private appointmentService: AppointmentService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.procedureForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadProcedureData();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadProcedureData(): void {
    this.loading = true;
    
    this.subscription.add(
      this.route.paramMap.pipe(
        switchMap(params => {
          this.procedureId = Number(params.get('id'));
          return this.medicalProcedureService.getMedicalProcedureById(this.procedureId);
        })
      ).subscribe({
        next: (procedure) => {
          this.procedure = procedure;
          this.patchFormValues(this.procedure);
          this.loadAppointments();
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar el procedimiento médico'
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
          // Solo citas ATENDIDA
          this.appointments = appointments.filter(apt => apt.status === 'ATENDIDA');
          
          // Si la cita actual no está ATENDIDA, mostrar advertencia
          const currentAppointment = appointments.find(apt => apt.id === this.procedure.appointment_id);
          if (currentAppointment && currentAppointment.status !== 'ATENDIDA') {
            this.messageService.add({
              severity: 'warn',
              summary: 'Advertencia',
              detail: 'La cita actual no está marcada como ATENDIDA. Debe seleccionar una cita ATENDIDA.',
              life: 5000
            });
            this.procedureForm.get('appointment_id')?.setValue('');
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

  patchFormValues(procedure: MedicalProcedureResponseI): void {
    this.procedureForm.patchValue({
      appointment_id: procedure.appointment_id,
      description: procedure.description
    });
  }

  onSubmit(): void {
    if (this.procedureForm.invalid) {
      this.markFormGroupTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Por favor complete todos los campos requeridos'
      });
      return;
    }

    this.submitting = true;
    const formData: Partial<MedicalProcedureI> = this.procedureForm.value;

    this.subscription.add(
      this.medicalProcedureService.updateMedicalProcedure(this.procedureId, formData).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Procedimiento médico actualizado correctamente'
          });
          
          setTimeout(() => {
            this.router.navigate(['/medicalprocedures']);
          }, 1500);
        },
        error: (error) => {
          let errorDetail = 'No se pudo actualizar el procedimiento médico';
          
          if (error.error) {
            if (error.error.description) {
              errorDetail = `Descripción: ${error.error.description[0]}`;
            } else if (error.error.appointment_id) {
              errorDetail = `Cita: ${error.error.appointment_id[0]}`;
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
    this.router.navigate(['/medicalprocedures']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.procedureForm.controls).forEach(key => {
      const control = this.procedureForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.procedureForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  getFieldError(fieldName: string): string {
    const field = this.procedureForm.get(fieldName);
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