import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { PrescriptionI, PrescriptionResponseI } from '../models/prescriptions';

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {
  private baseUrl = 'http://localhost:8000/api/prescriptions';
  private prescriptionsSubject = new BehaviorSubject<PrescriptionResponseI[]>([]);
  public prescriptions$ = this.prescriptionsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAllPrescriptions(): Observable<PrescriptionResponseI[]> {
    return this.http.get<PrescriptionResponseI[]>(`${this.baseUrl}/`)
      .pipe(
        tap(prescriptions => {
          console.log('Todas las recetas obtenidas:', prescriptions);
          this.prescriptionsSubject.next(prescriptions);
        }),
        catchError(error => {
          console.error('Error fetching prescriptions:', error);
          return throwError(() => error);
        })
      );
  }

  getPrescriptionById(id: number): Observable<PrescriptionResponseI> {
    return this.http.get<PrescriptionResponseI>(`${this.baseUrl}/${id}/`)
      .pipe(
        tap(prescription => console.log('Receta por ID:', prescription)),
        catchError(error => {
          console.error('Error fetching prescription:', error);
          return throwError(() => error);
        })
      );
  }

  createPrescription(prescription: PrescriptionI): Observable<PrescriptionResponseI> {
    return this.http.post<PrescriptionResponseI>(`${this.baseUrl}/`, prescription)
      .pipe(
        tap(response => {
          console.log('Receta creada exitosamente:', response);
          this.refreshPrescriptions();
        }),
        catchError(error => {
          console.error('Error creating prescription:', error);
          return throwError(() => error);
        })
      );
  }

  updatePrescription(id: number, prescription: Partial<PrescriptionI>): Observable<PrescriptionResponseI> {
    return this.http.put<PrescriptionResponseI>(`${this.baseUrl}/${id}/`, prescription)
      .pipe(
        tap(response => {
          console.log('Receta actualizada:', response);
          this.refreshPrescriptions();
        }),
        catchError(error => {
          console.error('Error updating prescription:', error);
          return throwError(() => error);
        })
      );
  }

  deletePrescription(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`)
      .pipe(
        tap(() => {
          console.log('Receta eliminada:', id);
          this.refreshPrescriptions();
        }),
        catchError(error => {
          console.error('Error deleting prescription:', error);
          return throwError(() => error);
        })
      );
  }

  refreshPrescriptions(): void {
    this.getAllPrescriptions().subscribe({
      next: (prescriptions) => {
        console.log('Lista de recetas actualizada');
        this.prescriptionsSubject.next(prescriptions);
      },
      error: (error) => {
        console.error('Error refreshing prescriptions:', error);
      }
    });
  }
}