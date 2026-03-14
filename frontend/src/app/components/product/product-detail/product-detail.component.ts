import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  template: `
    <div class="page-container" *ngIf="product$ | async as product; else loading">
      <div class="product-layout">
        <!-- Image Section -->
        <div class="product-gallery animate-fade-in">
          <div class="main-image-container">
            <img [src]="product.primary_image || 'https://placehold.co/800x800/eeeeee/999999?text=No+Image'" [alt]="product.title" class="main-image" />
            <div class="product-badge" *ngIf="product.is_featured">Featured</div>
            <div class="discount-badge" *ngIf="product.discount_percentage > 0">
              -{{ product.discount_percentage }}%
            </div>
          </div>
        </div>

        <!-- Details Section -->
        <div class="product-info animate-slide-up animate-delay-1">
          <nav class="breadcrumb">
            <a routerLink="/">Home</a> &gt; 
            <a routerLink="/products">Products</a> &gt; 
            <span class="current">{{ product.category_name }}</span>
          </nav>

          <h1 class="product-title">{{ product.title }}</h1>
          
          <div class="seller-info">
            <span class="seller-label">Sold by:</span>
            <a [routerLink]="['/seller', product.seller_slug]" class="seller-link">{{ product.seller_name }}</a>
          </div>

          <div class="rating-row" *ngIf="product.review_count > 0">
            <mat-icon class="star-icon">star</mat-icon>
            <span class="rating-value">{{ product.average_rating | number: '1.1-1' }}</span>
            <span class="review-count">({{ product.review_count }} reviews)</span>
          </div>

          <mat-divider class="divider"></mat-divider>

          <div class="price-section">
            <span class="current-price">\${{ product.price | number: '1.2-2' }}</span>
            <span class="original-price" *ngIf="product.compare_at_price">\${{ product.compare_at_price | number: '1.2-2' }}</span>
            <span class="stock-status" [class.in-stock]="product.stock_quantity > 0">
              {{ product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock' }}
            </span>
          </div>

          <p class="product-description">{{ product.description }}</p>

          <div class="features-list">
            <div class="feature-item" *ngIf="product.requires_shipping">
              <mat-icon color="primary">local_shipping</mat-icon>
              <span>Physical item - Requires shipping</span>
            </div>
            <div class="feature-item" *ngIf="product.condition">
              <mat-icon color="primary">info</mat-icon>
              <span>Condition: {{ product.condition | titlecase }}</span>
            </div>
          </div>

          <mat-divider class="divider"></mat-divider>

          <div class="action-buttons">
            <button 
              mat-flat-button 
              color="primary" 
              class="add-to-cart-btn" 
              [disabled]="product.stock_quantity === 0"
              (click)="addToCart(product)">
              <mat-icon>shopping_cart</mat-icon>
              Add to Cart
            </button>
            <button mat-stroked-button color="primary" class="wishlist-btn">
              <mat-icon>favorite_border</mat-icon>
            </button>
          </div>
          
          <div class="tags-section" *ngIf="product.tags && product.tags.length > 0">
            <h3>Tags</h3>
            <mat-chip-set>
              <mat-chip *ngFor="let tag of product.tags">{{ tag }}</mat-chip>
            </mat-chip-set>
          </div>

        </div>
      </div>
    </div>

    <ng-template #loading>
      <div class="loading-container">
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      </div>
    </ng-template>
  `,
  styles: [`
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .product-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
    }

    /* Image Gallery */
    .product-gallery {
      position: sticky;
      top: 100px;
    }

    .main-image-container {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      aspect-ratio: 1;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      background: white;
    }

    .main-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .product-badge {
      position: absolute;
      top: 16px;
      left: 16px;
      background-color: #1976d2;
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
    }

    .discount-badge {
      position: absolute;
      top: 16px;
      right: 16px;
      background-color: #d32f2f;
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
    }

    /* Product Info */
    .breadcrumb {
      font-size: 14px;
      color: #666;
      margin-bottom: 16px;
    }

    .breadcrumb a {
      color: #1976d2;
      text-decoration: none;
    }

    .breadcrumb a:hover {
      text-decoration: underline;
    }

    .breadcrumb .current {
      color: #999;
    }

    .product-title {
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 12px;
      line-height: 1.2;
      color: #333;
    }

    .seller-info {
      font-size: 16px;
      margin-bottom: 16px;
    }

    .seller-label {
      color: #666;
      margin-right: 8px;
    }

    .seller-link {
      color: #1976d2;
      text-decoration: none;
      font-weight: 500;
    }

    .rating-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 24px;
    }

    .star-icon {
      color: #ffc107;
      font-size: 20px;
      height: 20px;
      width: 20px;
    }

    .rating-value {
      font-weight: 600;
      font-size: 16px;
    }

    .review-count {
      color: #666;
    }

    .divider {
      margin: 24px 0;
    }

    .price-section {
      display: flex;
      align-items: baseline;
      gap: 16px;
      margin-bottom: 24px;
    }

    .current-price {
      font-size: 36px;
      font-weight: 700;
      color: #1976d2;
    }

    .original-price {
      font-size: 20px;
      color: #999;
      text-decoration: line-through;
    }

    .stock-status {
      font-size: 14px;
      font-weight: 500;
      padding: 4px 12px;
      border-radius: 4px;
      background: #f5f5f5;
      color: #666;
    }

    .stock-status.in-stock {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .product-description {
      font-size: 16px;
      line-height: 1.6;
      color: #555;
      margin-bottom: 32px;
    }

    .features-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #444;
    }

    .action-buttons {
      display: flex;
      gap: 16px;
      margin-bottom: 32px;
    }

    .add-to-cart-btn {
      flex: 1;
      height: 54px;
      font-size: 18px;
      border-radius: 8px !important;
    }

    .wishlist-btn {
      height: 54px;
      width: 54px;
      border-radius: 8px !important;
    }

    .tags-section h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    @media (max-width: 960px) {
      .product-layout {
        grid-template-columns: 1fr;
        gap: 32px;
      }

      .product-gallery {
        position: static;
      }

      .product-title {
        font-size: 28px;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product$: Observable<Product> | undefined;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.product$ = this.route.paramMap.pipe(
      switchMap(params => {
        const slug = params.get('slug') || '';
        return this.productService.getProductBySlug(slug);
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
