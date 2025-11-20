import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DoctorsService } from '../../../services/doctors';
import { SpecialtyService } from '../../../services/specialty';


@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    ButtonModule, 
    InputTextModule, 
    SelectModule,
    ToastModule
  ],
  templateUrl: './create.html',
  styleUrl: './create.css',
  providers: [MessageService]
})
export class Create implements OnInit {
  form: FormGroup;
  loading: boolean = false;
  loadingSpecialties: boolean = false;
  
  // Opciones para los dropdowns
  genderOptions = [
    { label: 'Masculino', value: 'M' },
    { label: 'Femenino', value: 'F' },
    { label: 'Otros', value: 'OTHER' }
  ];
  
  statusOptions = [
    { label: 'Activo', value: 'ACTIVE' },
    { label: 'Inactivo', value: 'INACTIVE' }
  ];

  // Especialidades cargadas desde el servicio
  specialtyOptions: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private doctorService: DoctorsService,
    private specialtyService: SpecialtyService,
    private messageService: MessageService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      gender: ['M', Validators.required], 
      telephone: ['', [
        Validators.required, 
        Validators.pattern(/^\d{10}$/), // Exactamente 10 dígitos
        Validators.minLength(10),
        Validators.maxLength(10)
      ]], 
      email: ['', [Validators.required, Validators.email]],
      specialty_id: ['', Validators.required], 
      status: ['ACTIVE', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSpecialties();
  }

  // Cargar especialidades desde el servicio
  loadSpecialties(): void {
    this.loadingSpecialties = true;
    this.specialtyService.getAllSpecialties().subscribe({
      next: (specialties) => {
        this.specialtyOptions = specialties.map(spec => ({
          label: spec.specialtyname,
          value: spec.id
        }));
        console.log('📋 Especialidades cargadas:', this.specialtyOptions);
        this.loadingSpecialties = false;
      },
      error: (error) => {
        console.error('❌ Error cargando especialidades:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las especialidades'
        });
        this.loadingSpecialties = false;
      }
    });
  }

  // === MÉTODOS PARA EL TELÉFONO (AGREGADOS) ===
  
  // Método para limpiar el input (solo números)
  cleanTelephoneInput(event: any): void {
    const input = event.target;
    let value = input.value;
    
    // Remover todo excepto números
    value = value.replace(/\D/g, '');
    
    // Limitar a 10 caracteres
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    
    // Actualizar el valor en el formulario y el input
    this.form.patchValue({ telephone: value });
    input.value = value;
  }

  // Método para prevenir caracteres no numéricos al escribir
  onTelephoneKeyPress(event: KeyboardEvent): boolean {
    const charCode = event.charCode;
    
    // Permitir solo números (0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }
    
    return true;
  }

  // Método para limpiar cuando se pega texto
  onTelephonePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    const numbersOnly = pastedText.replace(/\D/g, '').substring(0, 10);
    
    // Insertar los números limpios
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    
    const currentValue = this.form.get('telephone')?.value || '';
    const newValue = currentValue.substring(0, start) + numbersOnly + currentValue.substring(end);
    const finalValue = newValue.replace(/\D/g, '').substring(0, 10);
    
    this.form.patchValue({ telephone: finalValue });
    input.value = finalValue;
    
    // Posicionar el cursor
    setTimeout(() => {
      input.setSelectionRange(start + numbersOnly.length, start + numbersOnly.length);
    });
  }

  submit(): void {
    if (this.form.valid) {
      this.loading = true;
      const doctorData = this.form.value;

      this.doctorService.createDoctor(doctorData).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Doctor creado correctamente'
          });
          setTimeout(() => {
            this.router.navigate(['/doctors']);
          }, 1000);
        },
        error: (error) => {
          console.error('Error creating doctor:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear el doctor'
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
    this.router.navigate(['/doctors']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) {
        const fieldLabels: { [key: string]: string } = {
          'name': 'El nombre',
          'last_name': 'El apellido',
          'gender': 'El género',
          'telephone': 'El teléfono',
          'email': 'El email',
          'specialty_id': 'La especialidad',
          'status': 'El estado'
        };
        return `${fieldLabels[fieldName] || fieldName} es requerido`;
      }
      if (field.errors['email']) return 'Email no válido';
      if (field.errors['minlength']) return `Debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength']) return `No puede exceder ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['pattern']) {
        if (fieldName === 'telephone') return 'El teléfono debe tener exactamente 10 dígitos numéricos';
        return 'Formato no válido';
      }
    }
    return '';
  }
}