import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { SpecialtyService } from '../../../services/specialty';

@Component({
  selector: 'app-create',
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, SelectModule, ToastModule],
  templateUrl: './create.html',
  styleUrl: './create.css',
  providers: [MessageService]
})
export class Create {
  form: FormGroup;
  loading: boolean = false;
  

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private specialtyService: SpecialtyService,
    private messageService: MessageService
  ) {
    this.form = this.fb.group({
      specialtyname: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  submit(): void {
    if (this.form.valid) {
      this.loading = true;
      const specialtyData = this.form.value;

      this.specialtyService.createSpecialty(specialtyData).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Especialidad creada correctamente'
          });
          setTimeout(() => {
            this.router.navigate(['/specialties']);
          }, 1000);
        },
        error: (error) => {
          console.error('Error creating specialty:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear la especialidad'
          });
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor complete todos los campos requeridos'
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
