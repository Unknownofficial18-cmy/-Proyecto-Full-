import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { AppointmentService } from '../../../services/appointment';
import { DoctorsService } from '../../../services/doctors';
import { PatientService } from '../../../services/patients';
import { PatientResponseI } from '../../../models/patients';
import { DoctorResponseI } from '../../../models/doctors';
import { AppointmentI } from '../../../models/appointments';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './create.html',
  styleUrl: './create.css'
})
export class Create implements OnInit, OnDestroy {
  appointmentForm: FormGroup;
  loading = false;
  loadingPatients = false;
  submitting = false;
  
  doctors: DoctorResponseI[] = [];
  patients: PatientResponseI[] = [];
  statusOptions = [
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'Atendida', value: 'ATENDIDA' },
    { label: 'Cancelada', value: 'CANCELADA' },
    { label: 'Reprogramada', value: 'REPROGRAMADA' },
    { label: 'No Asistió', value: 'NO ASISTIO' }
  ];

  private subscription = new Subscription();
  minDate: string;

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private doctorsService: DoctorsService,
    private patientsService: PatientService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.minDate = new Date().toISOString().slice(0, 16);
    this.appointmentForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadDoctors();
    this.loadPatients();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  createForm(): FormGroup {
    return this.fb.group({
      appointment_date: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      patient_id: ['', Validators.required],
      doctor_id: ['', Validators.required],
      status: ['PENDIENTE', Validators.required]
    });
  }

  loadDoctors(): void {
    this.loading = true;
    this.subscription.add(
      this.doctorsService.getAllDoctors().subscribe({
        next: (doctors) => {
          this.doctors = doctors.filter(doctor => doctor.status === 'ACTIVE');
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading doctors:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los doctores'
          });
          this.loading = false;
        }
      })
    );
  }

  loadPatients(): void {
    this.loadingPatients = true;
    this.subscription.add(
      this.patientsService.getAllPatients().subscribe({
        next: (patients) => {
          this.patients = patients;
          this.loadingPatients = false;
        },
        error: (error) => {
          console.error('Error loading patients:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los pacientes'
          });
          this.loadingPatients = false;
        }
      })
    );
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.appointmentForm.value;

    const appointmentData: AppointmentI = {
      appointment_date: new Date(formValue.appointment_date).toISOString(),
      reason: formValue.reason,
      patient_id: formValue.patient_id,
      doctor_id: formValue.doctor_id,
      status: formValue.status
    };

    this.subscription.add(
      this.appointmentService.createAppointment(appointmentData).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Cita creada correctamente'
          });
          
          setTimeout(() => {
            this.router.navigate(['/appointments/schedule']);
          }, 1000);
        },
        error: (error) => {
          console.error('Error creating appointment:', error);
          let errorDetail = 'No se pudo crear la cita';
          
          if (error.error) {
            if (error.error.appointment_date) {
              errorDetail = error.error.appointment_date[0];
            } else if (error.error.reason) {
              errorDetail = error.error.reason[0];
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

  private markFormGroupTouched(): void {
    Object.keys(this.appointmentForm.controls).forEach(key => {
      const control = this.appointmentForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/appointments/my-appointments']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.appointmentForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  getFieldError(fieldName: string): string {
    const field = this.appointmentForm.get(fieldName);
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
}