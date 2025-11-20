// header.component.ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  fechaActual: string = '';
  horaActual: string = '';

  ngOnInit() {
    this.actualizarTiempo();
    setInterval(() => this.actualizarTiempo(), 60000); // Actualizar cada minuto
  }

  private actualizarTiempo() {
    const now = new Date();
    this.fechaActual = now.toLocaleDateString('es-ES');
    this.horaActual = now.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}