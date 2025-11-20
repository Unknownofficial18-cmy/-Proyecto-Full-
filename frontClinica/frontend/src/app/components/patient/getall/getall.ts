import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button'; 
import { ConfirmDialogModule } from 'primeng/confirmdialog'; 
import { ToastModule } from 'primeng/toast'; 
import { TooltipModule } from 'primeng/tooltip'; 
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { PatientService } from '../../../services/patients';
import { PatientResponseI } from '../../../models/patients';

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
    TooltipModule 
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './getall.html',
  styleUrl: './getall.css'
})
export class Getall implements OnInit, OnDestroy { 
  patients: PatientResponseI[] = [];
  loading = false;
  private subscription = new Subscription();

  constructor(
    private patientService: PatientService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadPatients();

    // Subscribe to patient updates
    this.subscription.add(
      this.patientService.patients$.subscribe(patients => {
        this.patients = patients;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadPatients(): void {
    this.loading = true;
    this.subscription.add(
      this.patientService.getAllPatients().subscribe({
        next: (patients) => {
          this.patients = patients;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading patients:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los pacientes'
          });
          this.loading = false;
        }
      })
    );
  }

  confirmDelete(patient: PatientResponseI): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar al paciente ${patient.name} ${patient.last_name}?`, // Agregado last_name
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deletePatient(patient.id!);
      }
    });
  }

  deletePatient(id: number): void {
    this.subscription.add(
      this.patientService.deletePatient(id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Paciente eliminado correctamente'
          });
        },
        error: (error) => {
          console.error('Error deleting patient:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar el paciente'
          });
        }
      })
    );
  }

  // Métodos helper para el template - AGREGADOS
  getGenderLabel(gender: string): string {
    switch (gender) {
      case 'M': return 'Masculino';
      case 'F': return 'Femenino';
      case 'OTHER': return 'Otros';
      default: return gender;
    }
  }

  getGenderBadgeClass(gender: string): string {
    switch (gender) {
      case 'M': return 'bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded';
      case 'F': return 'bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded';
      case 'OTHER': return 'bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded';
      default: return 'bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded';
    }
  }

  getStatusBadgeClass(status: string): string {
    return status === 'ACTIVE' 
      ? 'bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded'
      : 'bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded';
  }
  getDocumentTypeLabel(type: string): string {
  switch (type) {
    case 'R.C': return 'Registro Civil';
    case 'T.I': return 'Tarjeta de Identidad'; 
    case 'C.C': return 'Cédula de Ciudadanía';
    case 'C.E': return 'Cédula de Extranjería';
    case 'PAS': return 'Pasaporte';
    default: return type;
  }
}
}