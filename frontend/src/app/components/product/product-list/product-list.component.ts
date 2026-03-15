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
            <img [src]="product.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop'" [alt]="product.title" />
          </div>
          <mat-card-content>
            <div class="header-row">
              <h3>{{ product.title }}</h3>
              <mat-chip-set>
                <mat-chip [class.out-of-stock]="product.stock_quantity === 0" [class.in-stock]="product.stock_quantity > 0">
                  {{ product.stock_quantity === 0 ? 'Out of Stock' : product.stock_quantity + ' in stock' }}
                </mat-chip>
              </mat-chip-set>
            </div>
            <p class="description-text">{{ product.short_description || product.description }}</p>
            <div class="price-row">
              <span class="current">{{ '$' + product.price }}</span>
              <span class="original" *ngIf="product.compare_at_price">{{ '$' + product.compare_at_price }}</span>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <div class="quantity-selector" *ngIf="product.stock_quantity > 0">
              <button mat-icon-button (click)="updateQuantity(product.id, -1)" [disabled]="getQuantity(product.id) <= 1">
                <mat-icon>remove</mat-icon>
              </button>
              <input type="number" [value]="getQuantity(product.id)" (change)="onQuantityInputChange($event, product)" min="1" [max]="product.stock_quantity" />
              <button mat-icon-button (click)="updateQuantity(product.id, 1)" [disabled]="getQuantity(product.id) >= product.stock_quantity">
                <mat-icon>add</mat-icon>
              </button>
            </div>
            <div class="action-buttons">
              <button mat-flat-button color="primary" (click)="addToCart(product)" [disabled]="product.stock_quantity === 0">Add to Cart</button>
              <a mat-button [routerLink]="['/product', product.slug]">View</a>
            </div>
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
      .page-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
      .page-header { margin-bottom: 24px; text-align: center; }
      .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 32px; }
      .product-card { display: flex; flex-direction: column; transition: transform 0.3s ease, box-shadow 0.3s ease; border-radius: 16px; overflow: hidden; height: 100%; border: 1px solid rgba(0,0,0,0.05); }
      .product-card:hover { transform: translateY(-8px); box-shadow: 0 12px 32px rgba(0,0,0,0.12); }
      .image-wrap { height: 220px; width: 100%; overflow: hidden; position: relative; background: #f9f9f9; }
      .image-wrap img { width: 100%; height: 100%; object-fit: contain; padding: 12px; transition: transform 0.3s ease; }
      .product-card:hover .image-wrap img { transform: scale(1.05); }
      
      .header-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 8px; }
      .header-row h3 { margin: 0; font-size: 1.1rem; font-weight: 600; flex: 1; }
      
      .description-text { font-size: 0.9rem; color: #666; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 12px; height: 2.7rem; }
      
      .price-row { margin-top: auto; font-weight: 700; display: flex; gap: 12px; align-items: baseline; font-size: 1.2rem; }
      .current { color: #2e7d32; }
      .original { text-decoration: line-through; color: #999; font-size: 0.95rem; font-weight: 400; }
      
      .out-of-stock { background-color: #ffebee !important; color: #c62828 !important; font-size: 0.75rem; }
      .in-stock { background-color: #e8f5e9 !important; color: #2e7d32 !important; font-size: 0.75rem; }
      
      mat-card-actions { display: flex; flex-direction: column; gap: 12px; padding: 16px !important; border-top: 1px solid rgba(0,0,0,0.05); }
      
      .quantity-selector { display: flex; align-items: center; justify-content: center; gap: 4px; background: #f5f5f5; border-radius: 8px; padding: 2px; }
      .quantity-selector input { width: 40px; text-align: center; border: none; background: transparent; font-weight: 600; -moz-appearance: textfield; }
      .quantity-selector input::-webkit-outer-spin-button, .quantity-selector input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      .quantity-selector button { width: 32px; height: 32px; line-height: 32px; }
      
      .action-buttons { display: flex; gap: 8px; width: 100%; }
      .action-buttons button { flex: 2; border-radius: 8px; }
      .action-buttons a { flex: 1; border-radius: 8px; }
    `,
  ],
})
export class ProductListComponent implements OnInit {
  products$: Observable<Product[]> | undefined;
  quantities: { [productId: string]: number } = {};

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.products$ = this.productService.getFeaturedProducts(100);
  }

  getQuantity(productId: string): number {
    return this.quantities[productId] || 1;
  }

  updateQuantity(productId: string, delta: number): void {
    const current = this.getQuantity(productId);
    const newVal = Math.max(1, current + delta);
    this.quantities[productId] = newVal;
  }

  onQuantityInputChange(event: any, product: Product): void {
    let val = parseInt(event.target.value);
    if (isNaN(val) || val < 1) val = 1;
    if (val > product.stock_quantity) val = product.stock_quantity;
    this.quantities[product.id] = val;
    event.target.value = val;
  }

  addToCart(product: Product): void {
    const quantity = this.getQuantity(product.id);
    this.cartService.addItem({ 
      product_id: product.id, 
      quantity: quantity,
      product_name: product.title,
      product_image: product.primary_image,
      unit_price: product.price
    }).subscribe({
      next: () => {
        this.snackBar.open(`${quantity}x ${product.title} added to cart`, 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom'
        });
        // Reset quantity back to 1 after adding to cart
        this.quantities[product.id] = 1;
      },
      error: () => {
        this.snackBar.open('Error adding to cart', 'Close', { duration: 3000 });
      }
    });
  }
}
