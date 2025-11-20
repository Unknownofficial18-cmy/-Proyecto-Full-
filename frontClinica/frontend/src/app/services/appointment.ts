import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { AppointmentI, AppointmentResponseI } from '../models/appointments';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private baseUrl = 'http://localhost:8000/api/appointments';
  private appointmentsSubject = new BehaviorSubject<AppointmentResponseI[]>([]);
  public appointments$ = this.appointmentsSubject.asObservable();

  constructor(private http: HttpClient) {}


  getAllAppointments(): Observable<AppointmentResponseI[]> {
    return this.http.get<AppointmentResponseI[]>(`${this.baseUrl}/`)
      .pipe(
        tap(appointments => {
          console.log('Todas las citas obtenidas:', appointments);
          this.appointmentsSubject.next(appointments);
        }),
        catchError(error => {
          console.error('Error fetching appointments:', error);
          return throwError(() => error);
        })
      );
  }

  getAppointmentById(id: number): Observable<AppointmentResponseI> {
    return this.http.get<AppointmentResponseI>(`${this.baseUrl}/${id}/`)
      .pipe(
        tap(appointment => console.log('Cita por ID:', appointment)),
        catchError(error => {
          console.error('Error fetching appointment:', error);
          return throwError(() => error);
        })
      );
  }


  createAppointment(appointment: AppointmentI): Observable<AppointmentResponseI> {
    return this.http.post<AppointmentResponseI>(`${this.baseUrl}/`, appointment)
      .pipe(
        tap(response => {
          console.log('Cita creada exitosamente:', response);
          this.refreshAppointments();
        }),
        catchError(error => {
          console.error(' Error creating appointment:', error);
          if (error.status === 400) {
            console.error('Detalles del error 400:', error.error);
          }
          return throwError(() => error);
        })
      );
  }

  updateAppointment(id: number, appointment: Partial<AppointmentI>): Observable<AppointmentResponseI> {
    return this.http.put<AppointmentResponseI>(`${this.baseUrl}/${id}/`, appointment)
      .pipe(
        tap(response => {
          console.log('Cita actualizada:', response);
          this.refreshAppointments();
        }),
        catchError(error => {
          console.error(' Error updating appointment:', error);
          return throwError(() => error);
        })
      );
  }

  deleteAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`)
      .pipe(
        tap(() => {
          console.log('Cita eliminada:', id);
          this.refreshAppointments();
        }),
        catchError(error => {
          console.error('Error deleting appointment:', error);
          return throwError(() => error);
        })
      );
  }


  updateLocalAppointments(appointments: AppointmentResponseI[]): void {
    this.appointmentsSubject.next(appointments);
  }

  refreshAppointments(): void {
    this.getAllAppointments().subscribe({
      next: (appointments) => {
        console.log('Lista de citas actualizada');
        this.appointmentsSubject.next(appointments);
      },
      error: (error) => {
        console.error('Error refreshing appointments:', error);
      }
    });
  }

  getAppointmentsByStatus(status: string): Observable<AppointmentResponseI[]> {
    return this.http.get<AppointmentResponseI[]>(`${this.baseUrl}/?status=${status}`)
      .pipe(
        tap(appointments => console.log(`Citas con estado ${status}:`, appointments)),
        catchError(error => {
          console.error(`Error fetching appointments by status ${status}:`, error);
          return throwError(() => error);
        })
      );
  }

  getAppointmentsByPatient(patientId: number): Observable<AppointmentResponseI[]> {
    return this.http.get<AppointmentResponseI[]>(`${this.baseUrl}/?patient_id=${patientId}`)
      .pipe(
        tap(appointments => console.log(`Citas del paciente ${patientId}:`, appointments)),
        catchError(error => {
          console.error(` Error fetching appointments by patient ${patientId}:`, error);
          return throwError(() => error);
        })
      );
  }

  getAppointmentsByDoctor(doctorId: number): Observable<AppointmentResponseI[]> {
    return this.http.get<AppointmentResponseI[]>(`${this.baseUrl}/?doctor_id=${doctorId}`)
      .pipe(
        tap(appointments => console.log(`Citas del doctor ${doctorId}:`, appointments)),
        catchError(error => {
          console.error(` Error fetching appointments by doctor ${doctorId}:`, error);
          return throwError(() => error);
        })
      );
  }
}