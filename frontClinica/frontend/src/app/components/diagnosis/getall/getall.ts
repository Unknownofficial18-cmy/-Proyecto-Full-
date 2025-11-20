import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { DiagnosisService } from '../../../services/diagnosis';
import { DiagnosisResponseI } from '../../../models/diagnosis';

@Component({
  selector: 'app-getall',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TableModule,
    CardModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './getall.html',
  styleUrl: './getall.css'
})
export class Getall implements OnInit, OnDestroy {
  diagnoses: DiagnosisResponseI[] = [];
  loading = false;
  
  private subscription = new Subscription();

  constructor(
    private diagnosisService: DiagnosisService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDiagnoses();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadDiagnoses(): void {
    this.loading = true;
    this.subscription.add(
      this.diagnosisService.getAllDiagnoses().subscribe({
        next: (diagnoses) => {
          this.diagnoses = diagnoses;
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los diagnósticos'
          });
          this.loading = false;
        }
      })
    );
  }

  onEdit(id: number): void {
    this.router.navigate(['/diagnosis/edit', id]);
  }

  onDelete(id: number): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar este diagnóstico?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.subscription.add(
          this.diagnosisService.deleteDiagnosis(id).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Diagnóstico eliminado correctamente'
              });
              this.loadDiagnoses();
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo eliminar el diagnóstico'
              });
            }
          })
        );
      }
    });
  }

  onCreate(): void {
    this.router.navigate(['/diagnosis/new']);
  }
}