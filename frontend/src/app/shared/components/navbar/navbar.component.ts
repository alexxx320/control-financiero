import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  template: `
    <mat-toolbar color="primary" class="navbar">
      <div class="navbar-container">
        <div class="navbar-left">
          <button mat-icon-button class="menu-button" *ngIf="isLoggedIn">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="navbar-title" routerLink="/">Control Financiero</span>
        </div>

        <div class="navbar-right">
          <ng-container *ngIf="isLoggedIn; else authButtons">
            <button mat-button routerLink="/dashboard" routerLinkActive="active">
              <mat-icon>dashboard</mat-icon>
              Dashboard
            </button>
            <button mat-button routerLink="/fondos" routerLinkActive="active">
              <mat-icon>account_balance_wallet</mat-icon>
              Fondos
            </button>
            <button mat-button routerLink="/transacciones" routerLinkActive="active">
              <mat-icon>receipt_long</mat-icon>
              Transacciones
            </button>
            <button mat-button routerLink="/reportes" routerLinkActive="active">
              <mat-icon>assessment</mat-icon>
              Reportes
            </button>
            
            <button mat-icon-button [matMenuTriggerFor]="userMenu">
              <mat-icon>account_circle</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu">
              <div class="user-info" *ngIf="currentUser">
                <p class="user-name">{{ currentUser.nombre }}</p>
                <p class="user-email">{{ currentUser.email }}</p>
              </div>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                <span>Cerrar Sesión</span>
              </button>
            </mat-menu>
          </ng-container>

          <ng-template #authButtons>
            <button mat-button routerLink="/login" routerLinkActive="active">
              <mat-icon>login</mat-icon>
              Iniciar Sesión
            </button>
            <button mat-raised-button color="accent" routerLink="/register" routerLinkActive="active">
              <mat-icon>person_add</mat-icon>
              Registrarse
            </button>
          </ng-template>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,.1);
    }

    .navbar-container {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
    }

    .navbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .navbar-title {
      font-size: 20px;
      font-weight: 500;
      cursor: pointer;
    }

    .navbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .navbar-right button {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .active {
      background-color: rgba(0, 0, 0, 0.1);
    }

    .user-info {
      padding: 16px;
      min-width: 200px;
    }

    .user-name {
      font-weight: 500;
      margin: 0;
    }

    .user-email {
      font-size: 12px;
      color: #666;
      margin: 4px 0 0 0;
    }

    @media (max-width: 768px) {
      .navbar-right button span {
        display: none;
      }
      
      .navbar-right button mat-icon {
        margin: 0;
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Suscribirse a cambios en el estado de autenticación
    this.authService.isLoggedIn$.subscribe(
      isLoggedIn => this.isLoggedIn = isLoggedIn
    );

    // Suscribirse a cambios en el usuario actual
    this.authService.currentUser$.subscribe(
      user => this.currentUser = user
    );
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
