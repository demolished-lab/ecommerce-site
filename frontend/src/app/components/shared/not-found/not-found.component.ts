import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="not-found-page">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <mat-icon class="error-icon">explore_off</mat-icon>
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <div class="action-buttons">
          <a mat-flat-button color="primary" routerLink="/" class="action-btn">
            <mat-icon>home</mat-icon> Go Home
          </a>
          <a mat-stroked-button color="primary" routerLink="/products" class="action-btn">
            <mat-icon>shopping_bag</mat-icon> Browse Products
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-page { display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 64px);
      padding: 80px 24px 24px; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); text-align: center; }
    .not-found-content { max-width: 500px; }
    .error-code { font-size: 120px; font-weight: 900; color: #667eea; line-height: 1; margin-bottom: 8px;
      background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .error-icon { font-size: 64px; width: 64px; height: 64px; color: #90a4ae; margin-bottom: 24px; }
    h1 { font-size: 32px; font-weight: 700; color: #1a1a2e; margin: 0 0 12px; }
    p { font-size: 18px; color: #666; margin: 0 0 32px; line-height: 1.6; }
    .action-buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
    .action-btn { height: 44px; padding: 0 24px; border-radius: 8px; }
  `],
})
export class NotFoundComponent {}
