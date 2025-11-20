import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { PrescriptionService } from '../../../services/prescriptions';
import { PrescriptionI } from '../../../models/prescriptions';
import { AppointmentService } from '../../../services/appointment';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './create.html',
  styleUrl: './create.css'
})
export class Create implements OnInit, OnDestroy {
  prescriptionForm: FormGroup;
  loading = false;
  submitting = false;
  
  appointments: any[] = [];
  
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private prescriptionService: PrescriptionService,
    private appointmentService: AppointmentService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.prescriptionForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadAppointments();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  createForm(): FormGroup {
    return this.fb.group({
      appointment_id: ['', Validators.required]
    });
  }

  loadAppointments(): void {
    this.loading = true;
    this.subscription.add(
      this.appointmentService.getAllAppointments().subscribe({
        next: (appointments) => {
          // Filtrar solo citas atendidas o pendientes que no tengan receta
          this.appointments = appointments.filter(apt => 
            apt.status === 'ATENDIDA' || apt.status === 'PENDIENTE'
          );
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading appointments:', error);
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

  onSubmit(): void {
    if (this.prescriptionForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.prescriptionForm.value;

    const prescriptionData: PrescriptionI = {
      prescription_date: new Date().toISOString().split('T')[0], // Fecha actual
      appointment_id: formValue.appointment_id
    };

    console.log('Creando receta:', prescriptionData);

    this.subscription.add(
      this.prescriptionService.createPrescription(prescriptionData).subscribe({
        next: (response) => {
          console.log('Receta creada exitosamente:', response);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Receta creada correctamente'
          });
          
          // Redirigir a la lista de recetas
          setTimeout(() => {
            this.router.navigate(['/prescriptions']);
          }, 1000);
        },
        error: (error) => {
          console.error('Error creating prescription:', error);
          let errorDetail = 'No se pudo crear la receta';
          
          if (error.error) {
            if (error.error.appointment_id) {
              errorDetail = error.error.appointment_id[0];
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

  // Método para mostrar información de la cita
  getAppointmentDisplay(appointment: any): string {
  if (!appointment) return '';
  
  const patientName = appointment.patient ? 
    `${appointment.patient.name} ${appointment.patient.last_name}` : 
    `Paciente #${appointment.patient_id}`;
  
  const doctorName = appointment.doctor ?
    `Dr. ${appointment.doctor.name} ${appointment.doctor.last_name}` :
    `Doctor #${appointment.doctor_id}`;
  
  const date = this.formatDateTime(appointment.appointment_date);
  const status = this.getStatusLabel(appointment.status);
  
  return `${patientName} | ${doctorName} | ${date} | ${status}`;
}
  formatDateTime(dateTime: string): string {
  if (!dateTime) return 'N/A';
  const date = new Date(dateTime);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

getStatusLabel(status: string): string {
  switch (status) {
    case 'PENDIENTE': return 'Pendiente';
    case 'ATENDIDA': return 'Atendida';
    case 'CANCELADA': return 'Cancelada';
    case 'REPROGRAMADA': return 'Reprogramada';
    case 'NO ASISTIO': return 'No Asistió';
    default: return status;
  }
}

getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded';
    case 'ATENDIDA': return 'bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded';
    case 'CANCELADA': return 'bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded';
    case 'REPROGRAMADA': return 'bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded';
    case 'NO ASISTIO': return 'bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded';
    default: return 'bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded';
  }
}
}