// footer.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer implements OnInit, OnDestroy {
  tiempoSesion: string = '00:00';
  ultimaActualizacion: string = '';
  private intervalo: any;

  ngOnInit() {
    this.iniciarTiempoSesion();
    this.ultimaActualizacion = new Date().toLocaleString('es-ES');
  }

  ngOnDestroy() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }

  private iniciarTiempoSesion() {
    const inicioSesion = new Date();
    this.intervalo = setInterval(() => {
      const ahora = new Date();
      const diff = new Date(ahora.getTime() - inicioSesion.getTime());
      this.tiempoSesion = 
        diff.getUTCHours().toString().padStart(2, '0') + ':' +
        diff.getUTCMinutes().toString().padStart(2, '0');
    }, 1000);
  }
}