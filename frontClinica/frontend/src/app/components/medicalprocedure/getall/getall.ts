import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { MedicalProcedureService } from '../../../services/medicalprocedure';
import { MedicalProcedureResponseI } from '../../../models/medicalprocedure';

@Component({
  selector: 'app-getall',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TableModule,
    CardModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './getall.html',
  styleUrl: './getall.css'
})
export class Getall implements OnInit, OnDestroy {
  procedures: MedicalProcedureResponseI[] = [];
  loading = false;
  
  private subscription = new Subscription();

  constructor(
    private medicalProcedureService: MedicalProcedureService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProcedures();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadProcedures(): void {
    this.loading = true;
    this.subscription.add(
      this.medicalProcedureService.getAllMedicalProcedures().subscribe({
        next: (procedures) => {
          this.procedures = procedures;
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los procedimientos médicos'
          });
          this.loading = false;
        }
      })
    );
  }

  onEdit(id: number): void {
    this.router.navigate(['/medicalprocedures/edit', id]);
  }

  onDelete(id: number): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar este procedimiento médico?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.subscription.add(
          this.medicalProcedureService.deleteMedicalProcedure(id).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Procedimiento médico eliminado correctamente'
              });
              this.loadProcedures();
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo eliminar el procedimiento médico'
              });
            }
          })
        );
      }
    });
  }

  onCreate(): void {
    this.router.navigate(['/medicalprocedures/new']);
  }

  getSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | null {
    if (!status) return null;
    
    switch (status) {
      case 'ATENDIDA':
        return 'success';
      case 'PENDIENTE':
        return 'warn';
      case 'CANCELADA':
        return 'danger';
      case 'REPROGRAMADA':
        return 'info';
      case 'NO ASISTIO':
        return 'contrast';
      default:
        return 'info';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPatientName(procedure: MedicalProcedureResponseI): string {
    if (procedure.patient) {
      return `${procedure.patient.name} ${procedure.patient.last_name}`;
    }
    return `Paciente #${procedure.appointment.patient_id}`;
  }

  getDoctorName(procedure: MedicalProcedureResponseI): string {
    if (procedure.doctor) {
      return `Dr. ${procedure.doctor.name} ${procedure.doctor.last_name}`;
    }
    return `Doctor #${procedure.appointment.doctor_id}`;
  }
}