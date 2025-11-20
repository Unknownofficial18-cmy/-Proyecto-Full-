import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select'; 
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { SpecialtyService } from '../../../services/specialty';
import { SpecialtyResponseI } from '../../../models/specialties'; 

@Component({
  selector: 'app-update',
  standalone: true, 
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    ButtonModule, 
    InputTextModule, 
    SelectModule, // 
    ToastModule
  ],
  templateUrl: './update.html',
  styleUrl: './update.css',
  providers: [MessageService]
})
export class Update implements OnInit { 
  form: FormGroup;
  loading: boolean = false;
  specialtyId: number = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private specialtyService: SpecialtyService,
    private messageService: MessageService
  ) {
    this.form = this.fb.group({
      specialtyname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.specialtyId = parseInt(id);
      this.loadSpecialty();
    }
  }

  loadSpecialty(): void {
    this.loading = true;
    this.specialtyService.getSpecialtyById(this.specialtyId).subscribe({
      next: (specialty: SpecialtyResponseI) => { 
        console.log('📋 Especialidad cargada:', specialty);
        this.form.patchValue({
          specialtyname: specialty.specialtyname 
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading specialty:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar la especialidad'
        });
        this.loading = false;
        // ✅ Redirigir si hay error
        setTimeout(() => {
          this.router.navigate(['/specialties']);
        }, 2000);
      }
    });
  }

  submit(): void {
    if (this.form.valid) {
      this.loading = true;
      const specialtyData = this.form.value;

      this.specialtyService.updateSpecialty(this.specialtyId, specialtyData).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Especialidad actualizada correctamente'
          });
          setTimeout(() => {
            this.router.navigate(['/specialties']); 
          }, 1000);
        },
        error: (error) => {
          console.error('❌ Error updating specialty:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar la especialidad'
          });
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor complete el campo requerido'
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/specialties']); 
  }

  private markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) return 'El nombre de la especialidad es requerido';
      if (field.errors['minlength']) return `El nombre debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength']) return `El nombre no puede exceder ${field.errors['maxlength'].requiredLength} caracteres`;
    }
    return '';
  }
}