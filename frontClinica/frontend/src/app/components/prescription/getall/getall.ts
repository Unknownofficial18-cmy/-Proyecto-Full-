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
import { PrescriptionResponseI } from '../../../models/prescriptions';
import { PrescriptionService } from '../../../services/prescriptions';
import { RecipeDetailService } from '../../../services/recipedetails';

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
  prescriptions: PrescriptionResponseI[] = [];
  loading = false;
  private subscription = new Subscription();

  constructor(
    private prescriptionService: PrescriptionService,
    private recipeDetailService: RecipeDetailService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadPrescriptions();

    this.subscription.add(
      this.prescriptionService.prescriptions$.subscribe(prescriptions => {
        this.prescriptions = prescriptions;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
loadPrescriptions(): void {
  this.loading = true;
  this.subscription.add(
    this.prescriptionService.getAllPrescriptions().subscribe({
      next: (prescriptions) => {
        this.prescriptions = prescriptions;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading prescriptions:', error);
        this.loading = false;
      }
    })
  );
}
 
  confirmDelete(prescription: PrescriptionResponseI): void {
    const patientName = this.getPatientName(prescription);
    
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar la receta #${prescription.id} del paciente ${patientName}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deletePrescription(prescription.id!);
      }
    });
  }

  deletePrescription(id: number): void {
    this.subscription.add(
      this.prescriptionService.deletePrescription(id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Receta eliminada correctamente'
          });
        },
        error: (error) => {
          console.error('Error deleting prescription:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar la receta'
          });
        }
      })
    );
  }

  confirmDeleteMedicine(detailId: number, medicineName: string): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el medicamento "${medicineName}" de esta receta?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteMedicine(detailId);
      }
    });
  }

  deleteMedicine(detailId: number): void {
    this.subscription.add(
      this.recipeDetailService.deleteRecipeDetail(detailId).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Medicamento eliminado de la receta'
          });
          // Recargar las recetas para reflejar el cambio
          this.loadPrescriptions();
        },
        error: (error) => {
          console.error('Error deleting medicine:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar el medicamento'
          });
        }
      })
    );
  }

  // Métodos helper para el template
  getPatientName(prescription: PrescriptionResponseI): string {
    if (prescription.appointment?.patient) {
      return `${prescription.appointment.patient.name} ${prescription.appointment.patient.last_name}`;
    }
    return `Paciente #${prescription.appointment?.patient_id}`;
  }

  getDoctorName(prescription: PrescriptionResponseI): string {
    if (prescription.appointment?.doctor) {
      return `Dr. ${prescription.appointment.doctor.name} ${prescription.appointment.doctor.last_name}`;
    }
    return `Doctor #${prescription.appointment?.doctor_id}`;
  }

  getSpecialtyName(prescription: PrescriptionResponseI): string {
    return prescription.appointment?.doctor?.specialty?.specialtyname || 'No especificada';
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  hasMedicines(prescription: PrescriptionResponseI): boolean {
    return !!(prescription.recipe_details && prescription.recipe_details.length > 0);
  }

  getMedicinesCount(prescription: PrescriptionResponseI): number {
    return prescription.recipe_details?.length || 0;
  }
}