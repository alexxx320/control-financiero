import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule
  ],
  template: `
    <!-- Mostrar layout completo solo si está autenticado -->
    <div *ngIf="authService.isLoggedIn$ | async; else loginView">
      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav 
          #drawer 
          class="sidenav" 
          fixedInViewport
          [attr.role]="(isHandset$ | async) ? 'dialog' : 'navigation'"
          [mode]="(isHandset$ | async) ? 'over' : 'side'"
          [opened]="!(isHandset$ | async)">
          
          <mat-toolbar class="sidenav-header">
            <span>Control Financiero</span>
            <button mat-icon-button (click)="drawer.close()" *ngIf="isHandset$ | async">
              <mat-icon>close</mat-icon>
            </button>
          </mat-toolbar>
          
          <mat-nav-list>
            <a mat-list-item 
               routerLink="/dashboard" 
               routerLinkActive="active-link"
               (click)="closeDrawerOnMobile()">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>Dashboard</span>
            </a>
            
            <a mat-list-item 
               routerLink="/transacciones" 
               routerLinkActive="active-link"
               (click)="closeDrawerOnMobile()">
              <mat-icon matListItemIcon>account_balance_wallet</mat-icon>
              <span matListItemTitle>Transacciones</span>
            </a>
            
            <a mat-list-item 
               routerLink="/fondos" 
               routerLinkActive="active-link"
               (click)="closeDrawerOnMobile()">
              <mat-icon matListItemIcon>savings</mat-icon>
              <span matListItemTitle>Fondos</span>
            </a>
            
            <a mat-list-item 
               routerLink="/reportes" 
               routerLinkActive="active-link"
               (click)="closeDrawerOnMobile()">
              <mat-icon matListItemIcon>assessment</mat-icon>
              <span matListItemTitle>Reportes</span>
            </a>

            <mat-divider></mat-divider>

            <a mat-list-item (click)="logout()">
              <mat-icon matListItemIcon>logout</mat-icon>
              <span matListItemTitle>Cerrar Sesión</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>
        
        <mat-sidenav-content>
          <mat-toolbar color="primary" class="main-toolbar">
            <button
              type="button"
              aria-label="Toggle sidenav"
              mat-icon-button
              (click)="drawer.toggle()">
              <mat-icon>menu</mat-icon>
            </button>
            
            <span class="app-title">Control Financiero</span>
            <span class="spacer"></span>
            
            <span class="user-info" *ngIf="authService.currentUser$ | async as user">
              <mat-icon>account_circle</mat-icon>
              {{ user.nombre }}
            </span>
            
            <button mat-icon-button [matMenuTriggerFor]="userMenu">
              <mat-icon>more_vert</mat-icon>
            </button>
            
            <mat-menu #userMenu="matMenu">
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                <span>Cerrar Sesión</span>
              </button>
            </mat-menu>
          </mat-toolbar>
          
          <div class="main-content">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>

    <!-- Vista de login -->
    <ng-template #loginView>
      <router-outlet></router-outlet>
    </ng-template>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }
    
    .sidenav {
      width: 260px;
      box-shadow: 3px 0 6px rgba(0,0,0,.24);
    }
    
    .sidenav-header {
      background: #1976d2;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
    }
    
    .main-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,.1);
    }
    
    .app-title {
      font-weight: 500;
      margin-left: 8px;
    }
    
    .main-content {
      padding: 20px;
      min-height: calc(100vh - 64px);
      background-color: #fafafa;
    }
    
    .active-link {
      background-color: rgba(63, 81, 181, 0.1) !important;
      border-right: 3px solid #3f51b5;
    }
    
    .active-link .mat-list-item-icon {
      color: #3f51b5;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9em;
      margin-right: 8px;
    }
    
    .spacer {
      flex: 1 1 auto;
    }

    mat-nav-list .mat-list-item {
      border-radius: 0 25px 25px 0;
      margin: 4px 8px 4px 0;
      transition: all 0.3s ease;
    }

    mat-nav-list .mat-list-item:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
    
    @media (max-width: 768px) {
      .sidenav {
        width: 280px;
      }
      
      .main-content {
        padding: 16px;
        min-height: calc(100vh - 56px);
      }

      .user-info span {
        display: none;
      }

      .app-title {
        font-size: 1.1em;
      }
    }

    @media (max-width: 480px) {
      .user-info {
        display: none;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  @ViewChild('drawer') drawer!: MatSidenav;
  title = 'Control Financiero';

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    // Verificar autenticación al iniciar
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      if (!isLoggedIn && !this.router.url.includes('login') && !this.router.url.includes('register')) {
        this.router.navigate(['/login']);
      }
    });
  }

  closeDrawerOnMobile(): void {
    this.isHandset$.subscribe(isHandset => {
      if (isHandset && this.drawer) {
        this.drawer.close();
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
