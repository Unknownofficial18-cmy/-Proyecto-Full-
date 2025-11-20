import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Subscription, switchMap } from 'rxjs';
import { PrescriptionService } from '../../../services/prescriptions';
import { PrescriptionI, PrescriptionResponseI } from '../../../models/prescriptions';
import { AppointmentService } from '../../../services/appointment';

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
  prescriptionForm: FormGroup;
  loading = false;
  submitting = false;
  prescriptionId!: number;
  prescription!: PrescriptionResponseI;
  
  appointments: any[] = [];
  
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private prescriptionService: PrescriptionService,
    private appointmentService: AppointmentService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.prescriptionForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadPrescriptionData();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadPrescriptionData(): void {
    this.loading = true;
    
    this.subscription.add(
      this.route.paramMap.pipe(
        switchMap(params => {
          this.prescriptionId = Number(params.get('id'));
          return this.prescriptionService.getPrescriptionById(this.prescriptionId);
        })
      ).subscribe({
        next: (prescription) => {
          this.prescription = prescription;
          this.patchFormValues(prescription);
          this.loadAppointments();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading prescription:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar la receta'
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
          this.appointments = appointments.filter(apt => 
            apt.status === 'ATENDIDA' || apt.status === 'PENDIENTE'
          );
        },
        error: (error) => {
          console.error('Error loading appointments:', error);
        }
      })
    );
  }

  createForm(): FormGroup {
    return this.fb.group({
      appointment_id: ['', Validators.required],
      prescription_date: ['', Validators.required]
    });
  }

  patchFormValues(prescription: PrescriptionResponseI): void {
    this.prescriptionForm.patchValue({
      appointment_id: prescription.appointment_id,
      prescription_date: prescription.prescription_date
    });
  }

  onSubmit(): void {
    if (this.prescriptionForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.prescriptionForm.value;

    const prescriptionData: Partial<PrescriptionI> = {
      appointment_id: formValue.appointment_id,
      prescription_date: formValue.prescription_date
    };

    this.subscription.add(
      this.prescriptionService.updatePrescription(this.prescriptionId, prescriptionData).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Receta actualizada correctamente'
          });
          
          setTimeout(() => {
            this.router.navigate(['/prescriptions']);
          }, 1000);
        },
        error: (error) => {
          console.error('Error updating prescription:', error);
          let errorDetail = 'No se pudo actualizar la receta';
          
          if (error.error) {
            if (error.error.appointment_id) {
              errorDetail = error.error.appointment_id[0];
            } else if (error.error.prescription_date) {
              errorDetail = error.error.prescription_date[0];
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
    Object.keys(this.prescriptionForm.controls).forEach(key => {
      const control = this.prescriptionForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/prescriptions']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.prescriptionForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  getFieldError(fieldName: string): string {
    const field = this.prescriptionForm.get(fieldName);
    if (field?.errors?.['required']) {
      return 'Este campo es requerido';
    }
    return '';
  }

  // Métodos helper para mostrar información
  getPatientName(): string {
    if (this.prescription?.appointment?.patient) {
      return `${this.prescription.appointment.patient.name} ${this.prescription.appointment.patient.last_name}`;
    }
    return `Paciente #${this.prescription?.appointment?.patient_id}`;
  }

  getDoctorName(): string {
    if (this.prescription?.appointment?.doctor) {
      return `Dr. ${this.prescription.appointment.doctor.name} ${this.prescription.appointment.doctor.last_name}`;
    }
    return `Doctor #${this.prescription?.appointment?.doctor_id}`;
  }

  getMedicinesCount(): number {
    return this.prescription?.recipe_details?.length || 0;
  }

  formatDate(date: string | undefined): string {
  if (!date) return 'N/A';
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}
  getAppointmentDisplay(appointment: any): string {
  if (!appointment) return '';
  
  const patientName = appointment.patient ? 
    `${appointment.patient.name} ${appointment.patient.last_name}` : 
    `Paciente #${appointment.patient_id}`;
  
  const doctorName = appointment.doctor ?
    `Dr. ${appointment.doctor.name} ${appointment.doctor.last_name}` :
    `Doctor #${appointment.doctor_id}`;
  
  const date = new Date(appointment.appointment_date).toLocaleDateString('es-ES');
  
  return `${patientName} | ${doctorName} | ${date}`;
}
}