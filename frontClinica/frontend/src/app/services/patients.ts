import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { PatientI, PatientResponseI } from '../models/patients';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private baseUrl = 'http://localhost:8000/api/patients';
  private patientSubject = new BehaviorSubject<PatientResponseI[]>([]);
  public patients$ = this.patientSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAllPatients(): Observable<PatientResponseI[]> {
    return this.http.get<PatientResponseI[]>(`${this.baseUrl}/`) 
      .pipe(
        tap(patients => {
          console.log('Pacientes obtenidos (array directo):', patients);
          this.patientSubject.next(patients);
        }),
        catchError(error => {
          console.error(' Error fetching patients:', error);
          return throwError(() => error);
        })
      );
  }

  getPatientById(id: number): Observable<PatientResponseI> {
    return this.http.get<PatientResponseI>(`${this.baseUrl}/${id}/`)
      .pipe(
        catchError(error => {
          console.error('Error fetching patient:', error);
          return throwError(() => error);
        })
      );
  }

  createPatient(patient: PatientI): Observable<PatientResponseI> {
    return this.http.post<PatientResponseI>(`${this.baseUrl}/`, patient)
      .pipe(
        tap(response => {
          console.log('Patient created:', response);
          this.refreshPatients();
        }),
        catchError(error => {
          console.error('Error creating patient:', error);
          return throwError(() => error);
        })
      );
  }

  updatePatient(id: number, patient: Partial<PatientI>): Observable<PatientResponseI> {
    return this.http.put<PatientResponseI>(`${this.baseUrl}/${id}/`, patient)
      .pipe(
        tap(response => {
          console.log('Patient updated:', response);
          this.refreshPatients();
        }),
        catchError(error => {
          console.error('Error updating patient:', error);
          return throwError(() => error);
        })
      );
  }

  deletePatient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`)
      .pipe(
        tap(() => {
          console.log('Doctor deleted:', id);
          this.refreshPatients();
        }),
        catchError(error => {
          console.error('Error deleting doctor:', error);
          return throwError(() => error);
        })
      );
  }

    // Método para actualizar el estado local de pacientes
  updateLocalPatients(patients: PatientResponseI[]): void {
    this.patientSubject.next(patients);
  }

  refreshPatients(): void {
    this.getAllPatients().subscribe({
      next: (patients) => {
        this.patientSubject.next(patients);
      },
      error: (error) => {
        console.error('Error refreshing patients:', error);
      }
    });
  }
}