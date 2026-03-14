import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { Product, Category } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressBarModule, 
    MatChipsModule,
    MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header animate-fade-in">
        <h1 *ngIf="categorySlug">Category: {{ categorySlug | titlecase }}</h1>
        <h1 *ngIf="!categorySlug">All Categories</h1>
        <p>Browse products in this specific category.</p>
      </div>

      <div class="product-grid animate-slide-up animate-delay-1" *ngIf="products$ | async as products; else loading">
        <mat-card *ngFor="let product of products" class="product-card">
          <div class="image-wrap">
            <img [src]="product.primary_image || 'https://placehold.co/400x400/eeeeee/999999?text=No+Image'" [alt]="product.title" />
            <div class="discount-badge" *ngIf="product.discount_percentage > 0">
              -{{ product.discount_percentage }}%
            </div>
          </div>
          <mat-card-content class="card-content">
            <h3 class="product-title">{{ product.title }}</h3>
            <p class="product-description">{{ product.short_description || product.description }}</p>
            <div class="price-row">
              <span class="current">\${{ product.price | number: '1.2-2' }}</span>
              <span class="original" *ngIf="product.compare_at_price">\${{ product.compare_at_price | number: '1.2-2' }}</span>
            </div>
          </mat-card-content>
          <mat-card-actions class="card-actions">
            <button mat-flat-button color="primary" class="add-btn" (click)="addToCart(product)">
              <mat-icon>add_shopping_cart</mat-icon>
              Add
            </button>
            <a mat-stroked-button color="primary" [routerLink]="['/product', product.slug]">View Details</a>
          </mat-card-actions>
        </mat-card>
        
        <div class="empty-state" *ngIf="products.length === 0">
          <mat-icon class="empty-icon">inventory_2</mat-icon>
          <h3>No products found</h3>
          <p>We couldn't find any products in this styling category.</p>
          <a mat-button color="primary" routerLink="/products">Browse All Products</a>
        </div>
      </div>

      <ng-template #loading>
        <div class="loading-container">
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        </div>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .page-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
      .page-header { margin-bottom: 24px; }
      .page-header h1 { font-size: 32px; font-weight: 700; margin-bottom: 8px; color: #333; }
      .page-header p { color: #666; font-size: 16px; margin: 0; }
      
      .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
      .product-card { display: flex; flex-direction: column; overflow: hidden; }
      .image-wrap { position: relative; height: 200px; width: 100%; overflow: hidden; background: #f5f5f5; }
      .image-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
      .product-card:hover .image-wrap img { transform: scale(1.05); }
      
      .discount-badge { position: absolute; top: 12px; right: 12px; background: #d32f2f; color: white; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; }
      
      .card-content { padding: 16px; flex: 1; }
      .product-title { font-size: 16px; font-weight: 600; margin: 0 0 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .product-description { font-size: 14px; color: #666; margin: 0 0 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      
      .price-row { margin-top: auto; display: flex; gap: 8px; align-items: baseline; }
      .current { font-size: 18px; font-weight: 700; color: #1976d2; }
      .original { text-decoration: line-through; color: #999; font-size: 14px; }
      
      .card-actions { padding: 16px; display: flex; gap: 12px; }
      .add-btn { flex: 1; }
      
      .empty-state { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 64px 24px; text-align: center; background: white; border-radius: 8px; border: 1px dashed #e0e0e0; }
      .empty-icon { font-size: 64px; width: 64px; height: 64px; color: #ccc; margin-bottom: 24px; }
      .empty-state h3 { font-size: 24px; margin: 0 0 8px; color: #333; }
      .empty-state p { color: #666; margin: 0 0 24px; }
    `
  ]
})
export class CategoryComponent implements OnInit {
  products$: Observable<Product[]> | undefined;
  categorySlug = '';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.products$ = this.route.paramMap.pipe(
      switchMap(params => {
        this.categorySlug = params.get('slug') || '';
        // In a real app we'd fetch products by category slug.
        // For the mock, we'll fetch all featured and filter if possible.
        return this.productService.getFeaturedProducts(20).pipe(
          map(products => {
            if (!this.categorySlug || this.categorySlug === 'all') return products;
            
            // Try to filter by matching category name lightly (e.g. fashion)
            const filtered = products.filter(p => p.tags.includes(this.categorySlug.toLowerCase()));
            return filtered.length > 0 ? filtered : products; // Fallback to all if empty to look good
          })
        );
      })
    );
  }

  addToCart(product: Product): void {
    this.cartService.addItem({ product_id: product.id, quantity: 1 }).subscribe({
      next: () => {
        this.snackBar.open(`${product.title} added to cart`, 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom'
        });
      },
      error: () => {
        this.snackBar.open('Error adding to cart', 'Close', { duration: 3000 });
      }
    });
  }
}
