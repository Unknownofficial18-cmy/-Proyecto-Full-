import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { RecipeDetailI, RecipeDetailResponseI } from '../models/recipedetails';

@Injectable({
  providedIn: 'root'
})
export class RecipeDetailService {
  private baseUrl = 'http://localhost:8000/api/recipedetails';

  constructor(private http: HttpClient) {}

  createRecipeDetail(recipeDetail: RecipeDetailI): Observable<RecipeDetailResponseI> {
    return this.http.post<RecipeDetailResponseI>(`${this.baseUrl}/`, recipeDetail)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  // Actualizar un detalle de receta existente
  updateRecipeDetail(id: number, recipeDetail: Partial<RecipeDetailI>): Observable<RecipeDetailResponseI> {
    const url = `${this.baseUrl}/${id}/`;
    
    return this.http.put<RecipeDetailResponseI>(url, recipeDetail)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  // Eliminar un detalle de receta
  deleteRecipeDetail(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  // Obtener detalles por prescription_id
  getDetailsByPrescription(prescriptionId: number): Observable<RecipeDetailResponseI[]> {
    return this.http.get<RecipeDetailResponseI[]>(`${this.baseUrl}/?prescription_id=${prescriptionId}`)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  getRecipeDetailById(id: number): Observable<RecipeDetailResponseI> {
    return this.http.get<RecipeDetailResponseI>(`${this.baseUrl}/${id}/`)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }
}