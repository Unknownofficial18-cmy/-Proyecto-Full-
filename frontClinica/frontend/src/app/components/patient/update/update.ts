import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PatientService } from '../../../services/patients';

@Component({
  selector: 'app-update',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    ButtonModule, 
    InputTextModule, 
    SelectModule,
    ToastModule
  ],
  templateUrl: './update.html',
  styleUrl: './update.css',
  providers: [MessageService]
})
export class Update implements OnInit {
  form: FormGroup;
  loading: boolean = false;
  patientId: number = 0;
  
  // Opciones para los dropdowns
  genderOptions = [
    { label: 'Masculino', value: 'M' },
    { label: 'Femenino', value: 'F' },
    { label: 'Otros', value: 'O' } 
  ];
  
  statusOptions = [
    { label: 'Activo', value: 'ACTIVE' },
    { label: 'Inactivo', value: 'INACTIVE' }
  ];

  documentTypeOptions = [
    { label: 'Registro Civil', value: 'R.C' },
    { label: 'Tarjeta de Identidad', value: 'T.I' },
    { label: 'Cédula de Ciudadanía', value: 'C.C' },
    { label: 'Cédula de Extranjería', value: 'C.E' },
    { label: 'Pasaporte', value: 'PAS' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private patientService: PatientService, 
    private messageService: MessageService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      birth_date: ['', [Validators.required]],
      gender: ['M', [Validators.required]],
      type_document: ['R.C', [Validators.required]],
      documentnumber: ['', [
        Validators.required, 
        Validators.pattern(/^\d{10}$/),
        Validators.minLength(10),
        Validators.maxLength(10)
      ]],
      telephone: ['', [
        Validators.required, 
        Validators.pattern(/^\d{10}$/),
        Validators.minLength(10),
        Validators.maxLength(10)
      ]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      status: ['ACTIVE', [Validators.required]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.patientId = parseInt(id); // ✅ Cambiado: doctorId → patientId
      this.loadPatient(); // ✅ Cambiado: loadDoctor → loadPatient
    }
  }

  loadPatient(): void {
    this.loading = true;
    this.patientService.getPatientById(this.patientId).subscribe({ // ✅ Cambiado
      next: (patient) => {
        this.form.patchValue({
          name: patient.name,
          last_name: patient.last_name,
          birth_date: patient.birth_date,
          gender: patient.gender,
          type_document: patient.type_document,
          documentnumber: patient.documentnumber,
          telephone: patient.telephone,
          address: patient.address,
          status: patient.status
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading patient:', error); 
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el paciente' 
        });
        this.loading = false;
      }
    });
  }

  // === MÉTODOS PARA EL TELÉFONO ===
  cleanTelephoneInput(event: any): void {
    const input = event.target;
    let value = input.value;
    value = value.replace(/\D/g, '');
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    this.form.patchValue({ telephone: value });
    input.value = value;
  }

  onTelephoneKeyPress(event: KeyboardEvent): boolean {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  onTelephonePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    const numbersOnly = pastedText.replace(/\D/g, '').substring(0, 10);
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const currentValue = this.form.get('telephone')?.value || '';
    const newValue = currentValue.substring(0, start) + numbersOnly + currentValue.substring(end);
    const finalValue = newValue.replace(/\D/g, '').substring(0, 10);
    this.form.patchValue({ telephone: finalValue });
    input.value = finalValue;
    setTimeout(() => {
      input.setSelectionRange(start + numbersOnly.length, start + numbersOnly.length);
    });
  }

  // === MÉTODOS PARA EL NÚMERO DE DOCUMENTO ===
  cleanDocumentInput(event: any): void {
    const input = event.target;
    let value = input.value;
    value = value.replace(/\D/g, '');
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    this.form.patchValue({ documentnumber: value });
    input.value = value;
  }

  onDocumentKeyPress(event: KeyboardEvent): boolean {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  onDocumentPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    const numbersOnly = pastedText.replace(/\D/g, '').substring(0, 10);
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const currentValue = this.form.get('documentnumber')?.value || '';
    const newValue = currentValue.substring(0, start) + numbersOnly + currentValue.substring(end);
    const finalValue = newValue.replace(/\D/g, '').substring(0, 10);
    this.form.patchValue({ documentnumber: finalValue });
    input.value = finalValue;
    setTimeout(() => {
      input.setSelectionRange(start + numbersOnly.length, start + numbersOnly.length);
    });
  }

  submit(): void {
    if (this.form.valid) {
      this.loading = true;
      const patientData = this.form.value; 

      this.patientService.updatePatient(this.patientId, patientData).subscribe({ 
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Paciente actualizado correctamente' 
          });
          setTimeout(() => {
            this.router.navigate(['/patients']); 
          }, 1000);
        },
        error: (error) => {
          console.error('Error updating patient:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar el paciente' 
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
    this.router.navigate(['/patients']); 
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
          'birth_date': 'La fecha de nacimiento',
          'gender': 'El género',
          'type_document': 'El tipo de documento',
          'documentnumber': 'El número de documento',
          'telephone': 'El teléfono',
          'address': 'La dirección',
          'status': 'El estado'
        };
        return `${fieldLabels[fieldName] || fieldName} es requerido`;
      }
      if (field.errors['minlength']) return `Debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength']) return `No puede exceder ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['pattern']) {
        if (fieldName === 'telephone') return 'El teléfono debe tener exactamente 10 dígitos numéricos';
        if (fieldName === 'documentnumber') return 'El documento debe tener exactamente 10 dígitos numéricos';
        return 'Formato no válido';
      }
    }
    return '';
  }
}