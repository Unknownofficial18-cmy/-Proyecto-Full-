import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { PaymentI, PaymentResponseI, PaymentMethod, PaymentStatus } from '../models/payment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  // TODAS las URLs CON barra final
  private apiUrl = 'http://localhost:8000/api/payments/'; 

  private paymentsSubject = new BehaviorSubject<PaymentResponseI[]>([]);
  public payments$ = this.paymentsSubject.asObservable();

  constructor(private http: HttpClient) { 
    this.loadInitialPayments();
  }

  private loadInitialPayments(): void {
    this.getPayments().subscribe({
      next: (payments) => {
        this.paymentsSubject.next(payments);
      },
      error: (error) => {
        console.error('Error loading initial payments:', error);
      }
    });
  }

  getPayments(params?: {
    payment_method?: PaymentMethod;
    payment_status?: PaymentStatus;
    appointment_id?: number;
  }): Observable<PaymentResponseI[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params] !== undefined) {
          httpParams = httpParams.set(key, params[key as keyof typeof params]!.toString());
        }
      });
    }
    
    // GET a /api/payments/ (URL base ya tiene barra)
    return this.http.get<PaymentResponseI[]>(this.apiUrl, { params: httpParams })
      .pipe(
        tap(payments => {
          this.paymentsSubject.next(payments);
        }),
        catchError(this.handleError)
      );
  }

  getPaymentById(id: number): Observable<PaymentResponseI> {
    // GET a /api/payments/1/ (URL base + id + barra)
    return this.http.get<PaymentResponseI>(`${this.apiUrl}${id}/`)
      .pipe(catchError(this.handleError));
  }

  createPayment(payment: PaymentI): Observable<PaymentResponseI> {
    // POST a /api/payments/ (URL base ya tiene barra)
    return this.http.post<PaymentResponseI>(this.apiUrl, payment)
      .pipe(
        tap(newPayment => {
          const currentPayments = this.paymentsSubject.value;
          this.paymentsSubject.next([newPayment, ...currentPayments]);
        }),
        catchError(this.handleError)
      );
  }

  updatePayment(id: number, payment: Partial<PaymentI>): Observable<PaymentResponseI> {
    // PUT a /api/payments/1/ (URL base + id + barra)
    return this.http.put<PaymentResponseI>(`${this.apiUrl}${id}/`, payment)
      .pipe(
        tap(updatedPayment => {
          const currentPayments = this.paymentsSubject.value;
          const updatedPayments = currentPayments.map(p => 
            p.id === id ? updatedPayment : p
          );
          this.paymentsSubject.next(updatedPayments);
        }),
        catchError(this.handleError)
      );
  }

  deletePayment(id: number): Observable<void> {
    // DELETE a /api/payments/1/ (URL base + id + barra)
    return this.http.delete<void>(`${this.apiUrl}${id}/`)
      .pipe(
        tap(() => {
          const currentPayments = this.paymentsSubject.value;
          const filteredPayments = currentPayments.filter(p => p.id !== id);
          this.paymentsSubject.next(filteredPayments);
        }),
        catchError(this.handleError)
      );
  }

  updatePaymentStatus(id: number, status: PaymentStatus): Observable<PaymentResponseI> {
    // PATCH a /api/payments/1/ (URL base + id + barra)
    return this.http.patch<PaymentResponseI>(`${this.apiUrl}${id}/`, { payment_status: status })
      .pipe(
        tap(updatedPayment => {
          const currentPayments = this.paymentsSubject.value;
          const updatedPayments = currentPayments.map(p => 
            p.id === id ? updatedPayment : p
          );
          this.paymentsSubject.next(updatedPayments);
        }),
        catchError(this.handleError)
      );
  }

  getPaymentsByAppointment(appointmentId: number): Observable<PaymentResponseI[]> {
    // GET a /api/payments/?appointment_id=1 (URL base + query params)
    return this.http.get<PaymentResponseI[]>(`${this.apiUrl}?appointment_id=${appointmentId}`)
      .pipe(
        tap(payments => {
          this.paymentsSubject.next(payments);
        }),
        catchError(this.handleError)
      );
  }

  getPaymentsByStatus(status: PaymentStatus): Observable<PaymentResponseI[]> {
    // GET a /api/payments/?payment_status=PENDIENTE (URL base + query params)
    return this.http.get<PaymentResponseI[]>(`${this.apiUrl}?payment_status=${status}`)
      .pipe(
        tap(payments => {
          this.paymentsSubject.next(payments);
        }),
        catchError(this.handleError)
      );
  }

  refreshPayments(): void {
    this.getPayments().subscribe();
  }

  getCurrentPayments(): PaymentResponseI[] {
    return this.paymentsSubject.value;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 404: errorMessage = 'Recurso no encontrado'; break;
        case 400: errorMessage = 'Datos inválidos enviados al servidor'; break;
        case 401: errorMessage = 'No autorizado'; break;
        case 403: errorMessage = 'Acceso denegado'; break;
        case 500: errorMessage = 'Error interno del servidor'; break;
        default: errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    console.error('Error en PaymentService:', error);
    return throwError(() => new Error(errorMessage));
  }
}