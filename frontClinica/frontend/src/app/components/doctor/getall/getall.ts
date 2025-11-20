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
import { DoctorsService } from '../../../services/doctors';
import { DoctorResponseI } from '../../../models/doctors';

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
  doctors: DoctorResponseI[] = [];
  loading = false;
  private subscription = new Subscription();

  constructor(
    private doctorsService: DoctorsService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadDoctors();

    // Subscribe to doctor updates
    this.subscription.add(
      this.doctorsService.doctors$.subscribe(doctors => {
        this.doctors = doctors;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadDoctors(): void {
    this.loading = true;
    this.subscription.add(
      this.doctorsService.getAllDoctors().subscribe({
        next: (doctors) => {
          this.doctors = doctors;
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

  confirmDelete(doctor: DoctorResponseI): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar al doctor ${doctor.name} ${doctor.last_name}?`, // Agregado last_name
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteDoctor(doctor.id!);
      }
    });
  }

  deleteDoctor(id: number): void {
    this.subscription.add(
      this.doctorsService.deleteDoctor(id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Doctor eliminado correctamente'
          });
        },
        error: (error) => {
          console.error('Error deleting doctor:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar el doctor'
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
}