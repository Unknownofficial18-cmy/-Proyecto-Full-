import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { AppointmentService } from '../../../services/appointment';
import { AppointmentResponseI } from '../../../models/appointments';

@Component({
  selector: 'app-getall',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    ButtonModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    TagModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './getall.html',
  styleUrl: './getall.css'
})
export class Getall implements OnInit, OnDestroy {
  appointments: AppointmentResponseI[] = [];
  loading = false;
  private subscription = new Subscription();

  constructor(
    private appointmentService: AppointmentService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadAppointments();

    this.subscription.add(
      this.appointmentService.appointments$.subscribe(appointments => {
        this.appointments = appointments;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadAppointments(): void {
  this.loading = true;
  this.subscription.add(
    this.appointmentService.getAllAppointments().subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.loading = false;
      }
    })
  );
}

  confirmDelete(appointment: AppointmentResponseI): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar la cita del paciente ${appointment.patient?.name || 'N/A'} con el doctor ${appointment.doctor?.name || 'N/A'}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteAppointment(appointment.id!);
      }
    });
  }

  deleteAppointment(id: number): void {
    this.subscription.add(
      this.appointmentService.deleteAppointment(id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Cita eliminada correctamente'
          });
        },
        error: (error) => {
          console.error('Error deleting appointment:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar la cita'
          });
        }
      })
    );
  }

  // Métodos helper para el template
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

 getStatusSeverity(status: string): any {
  switch (status) {
    case 'PENDIENTE': return 'warning';
    case 'ATENDIDA': return 'success';
    case 'CANCELADA': return 'danger';
    case 'REPROGRAMADA': return 'info';
    case 'NO ASISTIO': return 'contrast'; 
    default: return 'info';
  }
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

 getSpecialtyName(appointment: AppointmentResponseI): string {
  return appointment.doctor?.specialty?.specialtyname || 'No especificada';
}
}