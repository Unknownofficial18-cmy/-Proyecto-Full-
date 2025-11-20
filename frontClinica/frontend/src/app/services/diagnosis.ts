import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DiagnosisI, DiagnosisResponseI } from '../models/diagnosis';

@Injectable({
  providedIn: 'root'
})
export class DiagnosisService {
  private baseUrl = 'http://localhost:8000/api/diagnoses';

  constructor(private http: HttpClient) {}

  createDiagnosis(diagnosis: DiagnosisI): Observable<DiagnosisResponseI> {
    return this.http.post<DiagnosisResponseI>(`${this.baseUrl}/`, diagnosis);
  }

  getAllDiagnoses(): Observable<DiagnosisResponseI[]> {
    return this.http.get<DiagnosisResponseI[]>(`${this.baseUrl}/`);
  }

  getDiagnosisById(id: number): Observable<DiagnosisResponseI> {
    return this.http.get<DiagnosisResponseI>(`${this.baseUrl}/${id}/`);
  }

  updateDiagnosis(id: number, diagnosis: Partial<DiagnosisI>): Observable<DiagnosisResponseI> {
    return this.http.put<DiagnosisResponseI>(`${this.baseUrl}/${id}/`, diagnosis);
  }

  deleteDiagnosis(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`);
  }

  getDiagnosesByAppointment(appointmentId: number): Observable<DiagnosisResponseI[]> {
    return this.http.get<DiagnosisResponseI[]>(`${this.baseUrl}/?appointment_id=${appointmentId}`);
  }
}