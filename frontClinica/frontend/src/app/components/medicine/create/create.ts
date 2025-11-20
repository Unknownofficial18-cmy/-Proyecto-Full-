import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { MedicineService} from '../../../services/medicines';
import { MedicineI } from '../../../models/medicines';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonModule,
    ToastModule,
    InputTextModule,
  ],
  providers: [MessageService],
  templateUrl: './create.html',
  styleUrl: './create.css'
})
export class Create implements OnInit, OnDestroy {
  medicineForm: FormGroup;
  submitting = false;
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private medicineService: MedicineService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.medicineForm = this.createForm();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      presentation: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      dose: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]]
    });
  }

  onSubmit(): void {
    if (this.medicineForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.medicineForm.value;

    const medicineData: MedicineI = {
      name: formValue.name,
      presentation: formValue.presentation,
      dose: formValue.dose
    };

    console.log('Creando medicamento:', medicineData);

    this.subscription.add(
      this.medicineService.createMedicine(medicineData).subscribe({
        next: (response) => {
          console.log('Medicamento creado exitosamente:', response);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Medicamento creado correctamente'
          });
          
          setTimeout(() => {
            this.router.navigate(['/medicines']);
          }, 1000);
        },
        error: (error) => {
          console.error('Error creating medicine:', error);
          let errorDetail = 'No se pudo crear el medicamento';
          
          if (error.error) {
            if (error.error.name) {
              errorDetail = error.error.name[0];
            } else if (error.error.presentation) {
              errorDetail = error.error.presentation[0];
            } else if (error.error.dose) {
              errorDetail = error.error.dose[0];
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
    Object.keys(this.medicineForm.controls).forEach(key => {
      const control = this.medicineForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/medicines']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.medicineForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  getFieldError(fieldName: string): string {
    const field = this.medicineForm.get(fieldName);
    if (field?.errors?.['required']) {
      return 'Este campo es requerido';
    }
    if (field?.errors?.['minlength']) {
      return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    }
    if (field?.errors?.['maxlength']) {
      return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    }
    return '';
  }
}