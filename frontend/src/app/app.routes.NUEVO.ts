import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'transacciones',
    loadComponent: () => import('./features/transacciones/transacciones.component').then(m => m.TransaccionesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'fondos',
    loadComponent: () => import('./features/fondos/fondos.component').then(m => m.FondosComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'reportes',
    loadComponent: () => import('./features/reportes/reportes-unificado.component').then(m => m.ReportesUnificadoComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'reportes-ejecutivos',
    redirectTo: '/reportes',
    pathMatch: 'full'
  },
  {
    path: 'reportes-basicos',
    redirectTo: '/reportes',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
