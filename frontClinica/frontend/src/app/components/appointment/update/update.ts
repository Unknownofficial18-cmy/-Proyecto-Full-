import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AppointmentService } from '../../../services/appointment';
import { DoctorsService } from '../../../services/doctors';
import { PatientService } from '../../../services/patients';
import { PatientResponseI } from '../../../models/patients';
import { DoctorResponseI } from '../../../models/doctors';
import { AppointmentI, AppointmentResponseI } from '../../../models/appointments';

@Component({
  selector: 'app-update',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './update.html',
  styleUrl: './update.css'
})
export class Update implements OnInit, OnDestroy {
  appointmentForm: FormGroup;
  loading = false;
  loadingPatients = false;
  submitting = false;
  appointmentId!: number;
  
  doctors: DoctorResponseI[] = [];
  patients: PatientResponseI[] = [];
  appointment!: AppointmentResponseI;
  
  statusOptions = [
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'Atendida', value: 'ATENDIDA' },
    { label: 'Cancelada', value: 'CANCELADA' },
    { label: 'Reprogramada', value: 'REPROGRAMADA' },
    { label: 'No Asistió', value: 'NO ASISTIO' }
  ];

  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private doctorsService: DoctorsService,
    private patientsService: PatientService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.appointmentForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadAppointmentData();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadAppointmentData(): void {
    this.loading = true;
    
    this.subscription.add(
      this.route.paramMap.pipe(
        switchMap(params => {
          this.appointmentId = Number(params.get('id'));
          return this.appointmentService.getAppointmentById(this.appointmentId);
        }),
        switchMap(appointment => {
          this.appointment = appointment;
          // Cargar el formulario con los datos existentes
          this.patchFormValues(appointment);
          
          // Cargar doctores y pacientes en paralelo
          return this.doctorsService.getAllDoctors();
        })
      ).subscribe({
        next: (doctors) => {
          this.doctors = doctors.filter(doctor => doctor.status === 'ACTIVE');
          this.loadPatients();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading appointment data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar la cita'
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
          this.loadingPatients = false;
        }
      })
    );
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

  patchFormValues(appointment: AppointmentResponseI): void {
    // Convertir la fecha del backend al formato del input datetime-local
    const appointmentDate = new Date(appointment.appointment_date);
    const formattedDate = this.formatDateForInput(appointmentDate);

    this.appointmentForm.patchValue({
      appointment_date: formattedDate,
      reason: appointment.reason,
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
      status: appointment.status
    });
  }

  private formatDateForInput(date: Date): string {
    // Formatear fecha para input datetime-local (YYYY-MM-DDTHH:MM)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.appointmentForm.value;

    const appointmentData: Partial<AppointmentI> = {
      appointment_date: new Date(formValue.appointment_date).toISOString(),
      reason: formValue.reason,
      patient_id: formValue.patient_id,
      doctor_id: formValue.doctor_id,
      status: formValue.status
    };

    console.log('Actualizando cita:', this.appointmentId, appointmentData);

    this.subscription.add(
      this.appointmentService.updateAppointment(this.appointmentId, appointmentData).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Cita actualizada correctamente'
          });
          
          setTimeout(() => {
            this.router.navigate(['/appointments/my-appointments']);
          }, 1000);
        },
        error: (error) => {
          console.error('Error updating appointment:', error);
          let errorDetail = 'No se pudo actualizar la cita';
          
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

  // Método para mostrar información del paciente y doctor actual
  getCurrentPatientName(): string {
    if (this.appointment?.patient) {
      return `${this.appointment.patient.name} ${this.appointment.patient.last_name}`;
    }
    return `Paciente #${this.appointment?.patient_id}`;
  }

  getCurrentDoctorName(): string {
    if (this.appointment?.doctor) {
      return `Dr. ${this.appointment.doctor.name} ${this.appointment.doctor.last_name}`;
    }
    return `Doctor #${this.appointment?.doctor_id}`;
  }
}