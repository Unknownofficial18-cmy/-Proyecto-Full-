import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { Subscription, switchMap } from 'rxjs';
import { RecipeDetailService} from '../../../services/recipedetails';
import { RecipeDetailI, RecipeDetailResponseI } from '../../../models/recipedetails';
import { MedicineService} from '../../../services/medicines';
import { MedicineResponseI } from '../../../models/medicines';

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
  recipeDetailForm: FormGroup;
  loading = false;
  submitting = false;
  recipeDetailId!: number;
  recipeDetail!: RecipeDetailResponseI;
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
  this.loadRecipeDetailData();
}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadRecipeDetailData(): void {
    
  this.loading = true;
  
  this.subscription.add(
    this.route.paramMap.pipe(
      switchMap(params => {
        this.recipeDetailId = Number(params.get('id'));
        return this.recipeDetailService.getRecipeDetailById(this.recipeDetailId);
      })
    ).subscribe({
      next: (recipeDetail) => {
        this.recipeDetail = recipeDetail;
        this.patchFormValues(this.recipeDetail);
        this.loadMedicines();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading recipe detail:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el detalle de la receta'
        });
        this.loading = false;
      }
    })
  );
  
}

  loadMedicines(): void {
    this.subscription.add(
      this.medicineService.getAllMedicines().subscribe({
        next: (medicines) => {
          this.medicines = medicines;
        },
        error: (error) => {
          console.error('Error loading medicines:', error);
        }
      })
    );
  }

  createForm(): FormGroup {
    return this.fb.group({
      medicine_id: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      indications: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  patchFormValues(recipeDetail: RecipeDetailResponseI): void {
    this.recipeDetailForm.patchValue({
      medicine_id: recipeDetail.medicine_id,
      amount: recipeDetail.amount,
      indications: recipeDetail.indications
    });
  }

onSubmit(): void {
  this.submitting = true;
  const formValue = this.recipeDetailForm.value;

  const recipeDetailData: any = {
  medicine_id: formValue.medicine_id,
  amount: formValue.amount,
  indications: formValue.indications,
  prescription_id: this.recipeDetail.prescription_id  // ← AGREGAR ESTE CAMPO
};

  this.subscription.add(
    this.recipeDetailService.updateRecipeDetail(this.recipeDetailId, recipeDetailData).subscribe({
      next: (response) => {
        console.log(' Respuesta del backend:', response);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Medicamento actualizado correctamente'
        });
        
        setTimeout(() => {
          this.router.navigate(['/prescriptions']);
        }, 1000);
      },
      error: (error) => {
        console.error('Error updating recipe detail:', error);
        
        let errorDetail = 'No se pudo actualizar el medicamento';
        
        if (error.error) {
          if (error.error.medicine_id) {
            errorDetail = `Medicamento: ${error.error.medicine_id[0]}`;
          } else if (error.error.amount) {
            errorDetail = `Cantidad: ${error.error.amount[0]}`;
          } else if (error.error.indications) {
            errorDetail = `Indicaciones: ${error.error.indications[0]}`;
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
  onFieldChange(): void {
  console.log('Campo cambiado - Form dirty:', this.recipeDetailForm.dirty);
  console.log('Valores actuales:', this.recipeDetailForm.value);
}
}