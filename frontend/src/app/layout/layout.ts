import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './layout.html',
})
export class Layout {
  auth = inject(AuthService);
  menuAbierto = signal(false); // en móvil el menú se muestra/oculta

  enlaces = [
    { ruta: '/dashboard', texto: 'Panel principal' },
    { ruta: '/productos', texto: 'Productos' },
    { ruta: '/categorias', texto: 'Categorías' },
    { ruta: '/movimientos', texto: 'Entradas y salidas' },
    { ruta: '/historial', texto: 'Historial' },
    { ruta: '/stock-bajo', texto: 'Stock bajo' },
  ];
}
