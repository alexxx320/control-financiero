import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatCardModule],
  template: `
    <div class="loading-container" [ngClass]="{'fullscreen': fullscreen, 'inline': !fullscreen}">
      <mat-card *ngIf="showCard" class="loading-card">
        <mat-card-content>
          <div class="loading-content">
            <mat-spinner [diameter]="size"></mat-spinner>
            <p *ngIf="message" class="loading-message">{{ message }}</p>
          </div>
        </mat-card-content>
      </mat-card>
      
      <div *ngIf="!showCard" class="loading-content">
        <mat-spinner [diameter]="size"></mat-spinner>
        <p *ngIf="message" class="loading-message">{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .loading-container.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.8);
      z-index: 9999;
    }

    .loading-container.inline {
      padding: 20px;
      min-height: 100px;
    }

    .loading-card {
      min-width: 200px;
      text-align: center;
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .loading-message {
      margin: 0;
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
    }
  `]
})
export class LoadingComponent {
  @Input() message?: string;
  @Input() size: number = 40;
  @Input() fullscreen: boolean = false;
  @Input() showCard: boolean = true;
}
