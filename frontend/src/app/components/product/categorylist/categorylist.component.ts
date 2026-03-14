import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../../services/product.service';
import { Category } from '../../../models/product.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule],
  template: `
    <div class="page-container animate-fade-in">
      <header class="page-header">
        <h1 class="page-title">Explore Categories</h1>
        <p class="page-subtitle">Find exactly what you're looking for by browsing our curated collections.</p>
      </header>

      <div class="grid container" *ngIf="categories$ | async as categories; else loading">
        <mat-card *ngFor="let cat of categories; let i = index" 
                  class="cat-card animate-slide-up" 
                  [style.animation-delay]="(i * 0.05) + 's'"
                  [routerLink]="['/category', cat.slug]">
          <div class="card-glow"></div>
          <mat-card-content class="card-content">
            <div class="icon-wrapper">
              <mat-icon class="cat-icon">{{ cat.icon || 'category' }}</mat-icon>
            </div>
            <h3 class="cat-name">{{ cat.name }}</h3>
            <p class="cat-count">{{ cat.product_count || 0 }} Products</p>
            <div class="explore-hint">
              <span>Explore</span>
              <mat-icon>arrow_forward</mat-icon>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <ng-template #loading>
        <div class="loader-container">
          <div class="loader"></div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .page-container { min-height: 100vh; padding: 120px 24px 80px; background: #fafafa; }
    .container { max-width: 1200px; margin: 0 auto; }
    
    .page-header { text-align: center; margin-bottom: 64px; }
    .page-title { font-size: 48px; font-weight: 800; color: #111827; margin: 0 0 16px; letter-spacing: -0.025em; }
    .page-subtitle { font-size: 18px; color: #6b7280; max-width: 600px; margin: 0 auto; line-height: 1.6; }

    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px; }
    
    .cat-card { position: relative; border-radius: 20px !important; border: none !important; background: #ffffff; cursor: pointer; 
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .cat-card:hover { transform: translateY(-8px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
    
    .card-glow { position: absolute; inset: 0; background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.1), transparent 70%); opacity: 0; transition: opacity 0.4s; }
    .cat-card:hover .card-glow { opacity: 1; }

    .card-content { padding: 40px 24px; display: flex; flex-direction: column; align-items: center; text-align: center; }
    
    .icon-wrapper { width: 80px; height: 80px; border-radius: 24px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; 
                    transition: all 0.4s; color: #4f46e5; }
    .cat-card:hover .icon-wrapper { background: #4f46e5; color: #ffffff; transform: rotate(10deg); }
    
    .cat-icon { font-size: 36px; width: 36px; height: 36px; }
    
    .cat-name { font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 8px; }
    .cat-count { font-size: 14px; color: #6b7280; font-weight: 500; margin-bottom: 24px; }
    
    .explore-hint { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #4f46e5; opacity: 0; transform: translateX(-10px); transition: all 0.3s; }
    .cat-card:hover .explore-hint { opacity: 1; transform: translateX(0); }
    .explore-hint mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .loader-container { display: flex; justify-content: center; padding: 100px 0; }
    .loader { width: 48px; height: 48px; border: 5px solid #f3f4f6; border-top-color: #4f46e5; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 640px) {
      .page-title { font-size: 32px; }
      .grid { grid-template-columns: 1fr; }
    }
  `],
})
export class CategoryListComponent implements OnInit {
  categories$: Observable<Category[]> | undefined;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.categories$ = this.productService.getCategories();
  }
}
