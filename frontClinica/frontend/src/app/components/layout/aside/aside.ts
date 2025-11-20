import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [PanelMenuModule, RouterModule],
  templateUrl: './aside.html',
  styleUrl: './aside.css'
})
export class Aside implements OnInit {
  
  items: MenuItem[] = [];

  ngOnInit() {
    this.items = [
      {
        label: 'Usuarios',
        icon: 'pi pi-fw pi-users',
        items: [
          {
            label: 'Especialidades',
            icon: 'pi pi-fw pi-list',
            routerLink: '/specialties'
          },
          {
            label: 'Doctores',
             icon: 'pi pi-fw pi-briefcase', 
            routerLink: '/doctors'
          },
          {
            label: 'Pacientes',
            icon: 'pi pi-fw pi-user',
            routerLink: '/patients'
          }
        ]
      },
      {
        label: 'Citas',
        icon: 'pi pi-fw pi-calendar',
        items: [
          {
            label: 'Agendar Cita',
            icon: 'pi pi-fw pi-calendar-plus',
            routerLink: '/appointments/schedule'
          },
          {
            label: 'Lista de Citas',
            icon: 'pi pi-fw pi-calendar',
            routerLink: '/appointments/my-appointments'
          }
        ]
      },
      {
        label: 'Medicinas',
        icon: 'pi pi-fw pi-shopping-bag',
        items: [
          {
            label: 'Inventario',
            icon: 'pi pi-fw pi-box',
            routerLink: '/medicines'
          },
          {
            label: 'Recetas',
            icon: 'pi pi-fw pi-file',
            routerLink: '/prescriptions'
          },
        ]
      },
      {
        label: 'Diagnósticos',
        icon: 'pi pi-fw pi-heart',
        items: [
          {
            label: 'Crear Diagnóstico',
            icon: 'pi pi-fw pi-plus-circle',
            routerLink: '/diagnosis'
          },
          {
            label: 'Procedimiento Médico',
            icon: 'pi pi-fw pi-cog',
            routerLink: '/medicalprocedures'
          }
        ]
      },
      {
        label: 'Pagos',
        icon: 'pi pi-fw pi-credit-card',
        items: [
          {
            label: 'Realizar Pago',
            icon: 'pi pi-fw pi-credit-card',
            routerLink: '/payments/new'
          },
          {
            label: 'Historial de Pagos',
            icon: 'pi pi-fw pi-history',
            routerLink: '/payments'
          }
        ]
      }
    ];
  }
}