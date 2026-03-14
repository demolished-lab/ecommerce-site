import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { Observable } from 'rxjs';
import { Product, Category } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatChipsModule, MatSnackBarModule],
  template: `
    <div class="page-container">
      <div class="page-header animate-fade-in">
        <h1>Products</h1>
        <p>Browse available products and add them to your cart.</p>
      </div>

      <div class="product-grid animate-slide-up animate-delay-1" *ngIf="products$ | async as products; else loading">
        <mat-card *ngFor="let product of products" class="product-card">
          <div class="image-wrap">
            <img [src]="product.primary_image || 'https://placehold.co/400x400/eeeeee/999999?text=No+Image'" [alt]="product.title" />
          </div>
          <mat-card-content>
            <h3>{{ product.title }}</h3>
            <p>{{ product.short_description || product.description }}</p>
            <div class="price-row">
              <span class="current">{{ '$' + product.price }}</span>
              <span class="original" *ngIf="product.compare_at_price">{{ '$' + product.compare_at_price }}</span>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-flat-button color="primary" (click)="addToCart(product)">Add to Cart</button>
            <a mat-button [routerLink]="['/product', product.slug]">View</a>
          </mat-card-actions>
        </mat-card>
      </div>

      <ng-template #loading>
        <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .page-container { padding: 24px; }
      .page-header { margin-bottom: 16px; }
      .product-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
      .product-card { display: flex; flex-direction: column; }
      .image-wrap { height: 160px; width: 100%; overflow: hidden; }
      .image-wrap img { width: 100%; height: 100%; object-fit: cover; }
      .price-row { margin-top: 8px; font-weight: 600; display: flex; gap: 8px; align-items: baseline; }
      .current { color: #1b5e20; }
      .original { text-decoration: line-through; color: rgba(0,0,0,0.65); font-size: 0.9rem; }
    `,
  ],
})
export class ProductListComponent implements OnInit {
  products$: Observable<Product[]> | undefined;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.products$ = this.productService.getFeaturedProducts(20);
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
