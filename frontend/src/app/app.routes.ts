import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login').then((m) => m.Login) },
  {
    // Todas las pantallas internas viven dentro del Layout y están protegidas por el guard
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/layout').then((m) => m.Layout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard) },
      { path: 'productos', loadComponent: () => import('./pages/productos/productos').then((m) => m.Productos) },
      { path: 'categorias', loadComponent: () => import('./pages/categorias/categorias').then((m) => m.Categorias) },
      { path: 'movimientos', loadComponent: () => import('./pages/movimientos/movimientos').then((m) => m.Movimientos) },
      { path: 'historial', loadComponent: () => import('./pages/historial/historial').then((m) => m.Historial) },
      { path: 'stock-bajo', loadComponent: () => import('./pages/stock-bajo/stock-bajo').then((m) => m.StockBajo) },
    ],
  },
  { path: '**', redirectTo: '' },
];
