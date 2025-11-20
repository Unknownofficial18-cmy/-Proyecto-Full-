// medical-procedure.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MedicalProcedureI, MedicalProcedureResponseI } from '../models/medicalprocedure';

@Injectable({
  providedIn: 'root'
})
export class MedicalProcedureService {
  private baseUrl = 'http://localhost:8000/api/medicalprocedures';

  constructor(private http: HttpClient) {}

  createMedicalProcedure(procedure: MedicalProcedureI): Observable<MedicalProcedureResponseI> {
    return this.http.post<MedicalProcedureResponseI>(`${this.baseUrl}/`, procedure);
  }

  getAllMedicalProcedures(): Observable<MedicalProcedureResponseI[]> {
    return this.http.get<MedicalProcedureResponseI[]>(`${this.baseUrl}/`);
  }

  getMedicalProcedureById(id: number): Observable<MedicalProcedureResponseI> {
    return this.http.get<MedicalProcedureResponseI>(`${this.baseUrl}/${id}/`);
  }

  updateMedicalProcedure(id: number, procedure: Partial<MedicalProcedureI>): Observable<MedicalProcedureResponseI> {
    return this.http.put<MedicalProcedureResponseI>(`${this.baseUrl}/${id}/`, procedure);
  }

  deleteMedicalProcedure(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`);
  }

  getProceduresByAppointment(appointmentId: number): Observable<MedicalProcedureResponseI[]> {
    return this.http.get<MedicalProcedureResponseI[]>(`${this.baseUrl}/?appointment_id=${appointmentId}`);
  }
}