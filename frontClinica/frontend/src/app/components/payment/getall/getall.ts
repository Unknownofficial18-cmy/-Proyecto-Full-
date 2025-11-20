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
import { PaymentService } from '../../../services/payment';
import { PaymentResponseI, PaymentMethod, PaymentStatus } from '../../../models/payment';

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
  payments: PaymentResponseI[] = [];
  loading = false;
  private subscription = new Subscription();

  constructor(
    private paymentService: PaymentService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

 ngOnInit(): void {
  this.loadPayments();
  this.subscription.add(
    this.paymentService.payments$.subscribe(payments => {
      this.payments = payments;
    })
  );
}
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadPayments(): void {
  this.loading = true;
  this.paymentService.getPayments().subscribe({
    next: () => {
      this.loading = false;
    },
    error: (error) => {
      console.error('Error loading payments:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los pagos'
      });
      this.loading = false;
    }
  });
}

  confirmDelete(payment: PaymentResponseI): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el pago de $${payment.amount}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deletePayment(payment.id!);
      }
    });
  }

  deletePayment(id: number): void {
    this.subscription.add(
      this.paymentService.deletePayment(id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Pago eliminado correctamente'
          });
          // Recargar la lista después de eliminar
          this.loadPayments();
        },
        error: (error) => {
          console.error('Error deleting payment:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar el pago'
          });
        }
      })
    );
  }

  updatePaymentStatus(paymentId: number, newStatus: PaymentStatus): void {
    this.subscription.add(
      this.paymentService.updatePaymentStatus(paymentId, newStatus).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Estado actualizado a ${this.getPaymentStatusLabel(newStatus)}`
          });
          // Actualizar el estado localmente
          const payment = this.payments.find(p => p.id === paymentId);
          if (payment) {
            payment.payment_status = newStatus;
          }
        },
        error: (error) => {
          console.error('Error updating payment status:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el estado del pago'
          });
        }
      })
    );
  }

  // Métodos helper para el template
  getPaymentMethodLabel(method: PaymentMethod): string {
    switch (method) {
      case 'EFECTIVO': return 'Efectivo';
      case 'TARJETA': return 'Tarjeta';
      case 'TRANSFERENCIA_BANCARIA': return 'Transferencia Bancaria';
      default: return method;
    }
  }

  getPaymentStatusLabel(status: PaymentStatus): string {
    switch (status) {
      case 'PENDIENTE': return 'Pendiente';
      case 'RECIBIDO': return 'Recibido';
      case 'CANCELADO': return 'Cancelado';
      case 'REEMBOLSADO': return 'Reembolsado';
      default: return status;
    }
  }

  getPaymentMethodBadgeClass(method: PaymentMethod): string {
    switch (method) {
      case 'EFECTIVO': return 'bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border border-green-200';
      case 'TARJETA': return 'bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-200';
      case 'TRANSFERENCIA_BANCARIA': return 'bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded border border-purple-200';
      default: return 'bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-200';
    }
  }

  getPaymentStatusBadgeClass(status: PaymentStatus): string {
    switch (status) {
      case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded border border-yellow-200';
      case 'RECIBIDO': return 'bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border border-green-200';
      case 'CANCELADO': return 'bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded border border-red-200';
      case 'REEMBOLSADO': return 'bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-200';
      default: return 'bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-200';
    }
  }

  formatAmount(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
  formatPaymentAmount(amount: string): string {
  try {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      return `$${amount}`;
    }
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
  } catch (error) {
    return `$${amount}`;
  }
}
} 