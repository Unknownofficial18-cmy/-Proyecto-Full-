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
import { SpecialtyService } from '../../../services/specialty';
import { SpecialtyResponseI } from '../../../models/specialties';

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
  specialties: SpecialtyResponseI[] = [];
  loading = false;
  private subscription = new Subscription();

  constructor(
    private specialtyService: SpecialtyService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadSpecialties();

    // Subscribe to client updates
    this.subscription.add(
      this.specialtyService.specialties$.subscribe(specialties => {
        this.specialties = specialties;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadSpecialties(): void {
    this.loading = true;
    this.subscription.add(
      this.specialtyService.getAllSpecialties().subscribe({
        next: (specialties) => {
          this.specialties = specialties;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading specialties:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las especialidades'
          });
          this.loading = false;
        }
      })
    );
  }

  confirmDelete(specialty: SpecialtyResponseI): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar a ${specialty.specialtyname}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteSpecialty(specialty.id!);
      }
    });
  }

  deleteSpecialty(id: number): void {
    this.subscription.add(
      this.specialtyService.deleteSpecialty(id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Especialidad eliminada correctamente'
          });
        },
        error: (error) => {
          console.error('Error deleting specialty:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar la especialidad'
          });
        }
      })
    );
  }
}