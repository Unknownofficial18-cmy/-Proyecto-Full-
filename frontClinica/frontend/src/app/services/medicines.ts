import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { MedicineI, MedicineResponseI } from '../models/medicines';

@Injectable({
  providedIn: 'root'
})
export class MedicineService {
  private baseUrl = 'http://localhost:8000/api/medicines';
  private medicinesSubject = new BehaviorSubject<MedicineResponseI[]>([]);
  public medicines$ = this.medicinesSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAllMedicines(): Observable<MedicineResponseI[]> {
    return this.http.get<MedicineResponseI[]>(`${this.baseUrl}/`)
      .pipe(
        tap(medicines => {
          console.log('Todos los medicamentos obtenidos:', medicines);
          this.medicinesSubject.next(medicines);
        }),
        catchError(error => {
          console.error('Error fetching medicines:', error);
          return throwError(() => error);
        })
      );
  }

  getMedicineById(id: number): Observable<MedicineResponseI> {
    return this.http.get<MedicineResponseI>(`${this.baseUrl}/${id}/`)
      .pipe(
        tap(medicine => console.log('Medicamento por ID:', medicine)),
        catchError(error => {
          console.error('Error fetching medicine:', error);
          return throwError(() => error);
        })
      );
  }

  createMedicine(medicine: MedicineI): Observable<MedicineResponseI> {
    return this.http.post<MedicineResponseI>(`${this.baseUrl}/`, medicine)
      .pipe(
        tap(response => {
          console.log('Medicamento creado exitosamente:', response);
          this.refreshMedicines();
        }),
        catchError(error => {
          console.error('Error creating medicine:', error);
          return throwError(() => error);
        })
      );
  }

  updateMedicine(id: number, medicine: MedicineI): Observable<MedicineResponseI> {
    return this.http.put<MedicineResponseI>(`${this.baseUrl}/${id}/`, medicine)
      .pipe(
        tap(response => {
          console.log('Medicamento actualizado:', response);
          this.refreshMedicines();
        }),
        catchError(error => {
          console.error('Error updating medicine:', error);
          return throwError(() => error);
        })
      );
  }

  deleteMedicine(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`)
      .pipe(
        tap(() => {
          console.log('Medicamento eliminado:', id);
          this.refreshMedicines();
        }),
        catchError(error => {
          console.error('Error deleting medicine:', error);
          return throwError(() => error);
        })
      );
  }

  refreshMedicines(): void {
    this.getAllMedicines().subscribe({
      next: (medicines) => {
        console.log('Lista de medicamentos actualizada');
        this.medicinesSubject.next(medicines);
      },
      error: (error) => {
        console.error('Error refreshing medicines:', error);
      }
    });
  }
}