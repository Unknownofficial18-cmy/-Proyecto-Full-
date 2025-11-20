import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { SpecialtyI, SpecialtyResponseI } from '../models/specialties';

@Injectable({
  providedIn: 'root'
})
export class SpecialtyService {
  private baseUrl = 'http://localhost:8000/api/specialties';
  private specialtySubject = new BehaviorSubject<SpecialtyResponseI[]>([]);
  public specialties$ = this.specialtySubject.asObservable();

  constructor(private http: HttpClient) {}

  getAllSpecialties(): Observable<SpecialtyResponseI[]> {
      return this.http.get<SpecialtyResponseI[]>(`${this.baseUrl}/`) 
        .pipe(
          tap(specialties => {
            console.log('✅ Especialidades obtenidas (array directo):', specialties);
            this.specialtySubject.next(specialties);
          }),
          catchError(error => {
            console.error('❌ Error fetching specialties:', error);
            return throwError(() => error);
          })
        );
    }

  getSpecialtyById(id: number): Observable<SpecialtyResponseI> {
    return this.http.get<SpecialtyResponseI>(`${this.baseUrl}/${id}/`)
      .pipe(
        catchError(error => {
          console.error('Error fetching specialty:', error);
          return throwError(() => error);
        })
      );
  }

  createSpecialty(specialty: SpecialtyI): Observable<SpecialtyResponseI> {
    return this.http.post<SpecialtyResponseI>(`${this.baseUrl}/`, specialty)
      .pipe(
        tap(response => {
          console.log('Specialty created:', response);
          this.refreshSpecialties();
        }),
        catchError(error => {
          console.error('Error creating specialty:', error); 
          return throwError(() => error);
        })
      );
  }

  updateSpecialty(id: number, specialty: Partial<SpecialtyI>): Observable<SpecialtyResponseI> {
    return this.http.put<SpecialtyResponseI>(`${this.baseUrl}/${id}/`, specialty)
      .pipe(
        tap(response => {
          console.log('Specialty updated:', response);
          this.refreshSpecialties();
        }),
        catchError(error => {
          console.error('Error updating specialty:', error);
          return throwError(() => error);
        })
      );
  }

  partialUpdateSpecialty(id: number, specialty: Partial<SpecialtyI>): Observable<SpecialtyResponseI> { 
    return this.http.patch<SpecialtyResponseI>(`${this.baseUrl}/${id}/`, specialty)
      .pipe(
        tap(response => {
          console.log('Specialty partially updated:', response);
          this.refreshSpecialties();
        }),
        catchError(error => {
          console.error('Error partially updating specialty:', error);
          return throwError(() => error);
        })
      );
  }

  deleteSpecialty(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`)
      .pipe(
        tap(() => {
          console.log('Specialty deleted:', id);
          this.refreshSpecialties();
        }),
        catchError(error => {
          console.error('Error deleting specialty:', error);
          return throwError(() => error);
        })
      );
  }

  // Método para actualizar el estado local de especialidades
  updateLocalSpecialties(specialties: SpecialtyResponseI[]): void {
    this.specialtySubject.next(specialties);
  }

  refreshSpecialties(): void {
    this.getAllSpecialties().subscribe({
      next: (specialties) => {
        console.log('🔄 Especialidades actualizadas en BehaviorSubject');
        this.specialtySubject.next(specialties);
      },
      error: (error) => {
        console.error('Error refreshing specialties:', error);
      }
    });
  }
}