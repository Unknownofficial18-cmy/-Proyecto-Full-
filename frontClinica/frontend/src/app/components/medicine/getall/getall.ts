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
import { MedicineService } from '../../../services/medicines';
import { MedicineResponseI } from '../../../models/medicines';

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
  medicines: MedicineResponseI[] = [];
  loading = false;
  private subscription = new Subscription();

  constructor(
    private medicineService: MedicineService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadMedicines();

    this.subscription.add(
      this.medicineService.medicines$.subscribe(medicines => {
        this.medicines = medicines;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadMedicines(): void {
    this.loading = true;
    this.subscription.add(
      this.medicineService.getAllMedicines().subscribe({
        next: (medicines) => {
          console.log('Medicamentos cargados:', medicines);
          this.medicines = medicines;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading medicines:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los medicamentos'
          });
          this.loading = false;
        }
      })
    );
  }

  confirmDelete(medicine: MedicineResponseI): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el medicamento "${medicine.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteMedicine(medicine.id!);
      }
    });
  }

  deleteMedicine(id: number): void {
    this.subscription.add(
      this.medicineService.deleteMedicine(id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Medicamento eliminado correctamente'
          });
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
}