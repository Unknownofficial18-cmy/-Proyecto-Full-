import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { Subscription, switchMap } from 'rxjs';
import { MedicineService } from '../../../services/medicines';
import { MedicineI, MedicineResponseI } from '../../../models/medicines';

@Component({
  selector: 'app-update',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonModule,
    ToastModule,
    InputTextModule
  ],
  providers: [MessageService],
  templateUrl: './update.html',
  styleUrl: './update.css'
})
export class Update implements OnInit, OnDestroy {
  medicineForm: FormGroup;
  loading = false;
  submitting = false;
  medicineId!: number;
  medicine!: MedicineResponseI;
  
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private medicineService: MedicineService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.medicineForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadMedicineData();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadMedicineData(): void {
    this.loading = true;
    
    this.subscription.add(
      this.route.paramMap.pipe(
        switchMap(params => {
          this.medicineId = Number(params.get('id'));
          console.log('Cargando medicamento ID:', this.medicineId);
          return this.medicineService.getMedicineById(this.medicineId);
        })
      ).subscribe({
        next: (medicine) => {
          this.medicine = medicine;
          console.log('Medicamento cargado:', medicine);
          this.patchFormValues(medicine);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading medicine:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar el medicamento'
          });
          this.loading = false;
        }
      })
    );
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      presentation: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      dose: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]]
    });
  }

  patchFormValues(medicine: MedicineResponseI): void {
    this.medicineForm.patchValue({
      name: medicine.name,
      presentation: medicine.presentation,
      dose: medicine.dose
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

    console.log('Actualizando medicamento ID:', this.medicineId, 'con datos:', medicineData);

    this.subscription.add(
      this.medicineService.updateMedicine(this.medicineId, medicineData).subscribe({
        next: (response) => {
          console.log('Medicamento actualizado exitosamente:', response);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Medicamento actualizado correctamente'
          });
          
          setTimeout(() => {
            this.router.navigate(['/medicines']);
          }, 1000);
        },
        error: (error) => {
          console.error('Error updating medicine:', error);
          let errorDetail = 'No se pudo actualizar el medicamento';
          
          if (error.error) {
            if (error.error.name) {
              errorDetail = `Nombre: ${error.error.name[0]}`;
            } else if (error.error.presentation) {
              errorDetail = `Presentación: ${error.error.presentation[0]}`;
            } else if (error.error.dose) {
              errorDetail = `Dosis: ${error.error.dose[0]}`;
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