import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Dashboard as DashboardDatos } from '../../core/models';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private servicio = inject(DashboardService);
  datos = signal<DashboardDatos | null>(null);

  constructor() {
    this.servicio.indicadores().subscribe((d) => this.datos.set(d));
  }
}
