import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { DoctorI, DoctorResponseI } from '../models/doctors';

@Injectable({
  providedIn: 'root'
})
export class DoctorsService {
  private baseUrl = 'http://localhost:8000/api/doctors';
  private doctorsSubject = new BehaviorSubject<DoctorResponseI[]>([]);
  public doctors$ = this.doctorsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAllDoctors(): Observable<DoctorResponseI[]> {
    return this.http.get<DoctorResponseI[]>(`${this.baseUrl}/`) 
      .pipe(
        tap(doctors => {
          console.log('✅ Doctores obtenidos (array directo):', doctors);
          this.doctorsSubject.next(doctors);
        }),
        catchError(error => {
          console.error('❌ Error fetching doctors:', error);
          return throwError(() => error);
        })
      );
  }

  getDoctorById(id: number): Observable<DoctorResponseI> {
    return this.http.get<DoctorResponseI>(`${this.baseUrl}/${id}/`)
      .pipe(
        catchError(error => {
          console.error('Error fetching doctor:', error);
          return throwError(() => error);
        })
      );
  }

  createDoctor(doctor: DoctorI): Observable<DoctorResponseI> {
    return this.http.post<DoctorResponseI>(`${this.baseUrl}/`, doctor)
      .pipe(
        tap(response => {
          console.log('Doctor created:', response);
          this.refreshDoctors();
        }),
        catchError(error => {
          console.error('Error creating doctor:', error);
          return throwError(() => error);
        })
      );
  }

  updateDoctor(id: number, doctor: Partial<DoctorI>): Observable<DoctorResponseI> {
    return this.http.put<DoctorResponseI>(`${this.baseUrl}/${id}/`, doctor)
      .pipe(
        tap(response => {
          console.log('Doctor updated:', response);
          this.refreshDoctors();
        }),
        catchError(error => {
          console.error('Error updating doctor:', error);
          return throwError(() => error);
        })
      );
  }

  deleteDoctor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`)
      .pipe(
        tap(() => {
          console.log('Doctor deleted:', id);
          this.refreshDoctors();
        }),
        catchError(error => {
          console.error('Error deleting doctor:', error);
          return throwError(() => error);
        })
      );
  }

  // Método para actualizar el estado local de doctores
  updateLocalDoctors(doctors: DoctorResponseI[]): void {
    this.doctorsSubject.next(doctors);
  }

  refreshDoctors(): void {
    this.getAllDoctors().subscribe({
      next: (doctors) => {
        this.doctorsSubject.next(doctors);
      },
      error: (error) => {
        console.error('Error refreshing doctors:', error);
      }
    });
  }
}