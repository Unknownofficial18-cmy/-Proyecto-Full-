import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { RecipeDetailService } from '../../../services/recipedetails';
import { MedicineService } from '../../../services/medicines';
import { RecipeDetailI } from '../../../models/recipedetails';
import { MedicineResponseI } from '../../../models/medicines';

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
    InputNumberModule
  ],
  providers: [MessageService],
  templateUrl: './create.html',
  styleUrl: './create.css'
})

export class Create implements OnInit, OnDestroy {
  recipeDetailForm: FormGroup;
  loading = false;
  submitting = false;
  prescriptionId!: number;
  
  medicines: MedicineResponseI[] = [];
  
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private recipeDetailService: RecipeDetailService,
    private medicineService: MedicineService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.recipeDetailForm = this.createForm();
  }

ngOnInit(): void {
  this.prescriptionId = Number(this.route.snapshot.paramMap.get('prescriptionId'));
  console.log('Prescription ID recibido:', this.prescriptionId);
  
  this.loadMedicines();  // Esto debe cargar los medicamentos del inventario
}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  createForm(): FormGroup {
    return this.fb.group({
      medicine_id: ['', Validators.required],
      amount: [1, [Validators.required, Validators.min(1)]],
      indications: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  loadMedicines(): void {
  this.loading = true;
  this.subscription.add(
    this.medicineService.getAllMedicines().subscribe({  // ← Este servicio debe existir
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

  onSubmit(): void {
    if (this.recipeDetailForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.recipeDetailForm.value;

    const recipeDetailData: RecipeDetailI = {
      prescription_id: this.prescriptionId,
      medicine_id: formValue.medicine_id,
      amount: formValue.amount,
      indications: formValue.indications
    };

    this.subscription.add(
      this.recipeDetailService.createRecipeDetail(recipeDetailData).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Medicamento agregado a la receta correctamente'
          });
          
          setTimeout(() => {
            this.router.navigate(['/prescriptions']);
          }, 1000);
        },
        error: (error) => {
          console.error('Error creating recipe detail:', error);
          let errorDetail = 'No se pudo agregar el medicamento a la receta';
          
          if (error.error) {
            if (error.error.medicine_id) {
              errorDetail = error.error.medicine_id[0];
            } else if (error.error.amount) {
              errorDetail = error.error.amount[0];
            } else if (error.error.indications) {
              errorDetail = error.error.indications[0];
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
    Object.keys(this.recipeDetailForm.controls).forEach(key => {
      const control = this.recipeDetailForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/prescriptions']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.recipeDetailForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  getFieldError(fieldName: string): string {
    const field = this.recipeDetailForm.get(fieldName);
    if (field?.errors?.['required']) {
      return 'Este campo es requerido';
    }
    if (field?.errors?.['minlength']) {
      return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    }
    if (field?.errors?.['min']) {
      return `La cantidad mínima es ${field.errors['min'].min}`;
    }
    return '';
  }
}