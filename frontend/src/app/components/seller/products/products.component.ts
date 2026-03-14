import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-seller-products',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressBarModule],
  template: `
    <div class="page" style="padding: 80px 24px 24px; max-width: 1100px; margin: auto;">
      <div class="page-header">
        <h1>My Products</h1>
        <a mat-flat-button color="primary" routerLink="/seller/products/new"><mat-icon>add</mat-icon> Add Product</a>
      </div>
      <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>
      <div *ngIf="!loading && products.length === 0" class="empty">
        <mat-icon>inventory_2</mat-icon>
        <h3>No products yet</h3>
        <p>Start by adding your first product</p>
      </div>
      <div class="product-table" *ngIf="products.length > 0">
        <div class="table-header"><span>Product</span><span>Price</span><span>Stock</span><span>Status</span><span>Actions</span></div>
        <div class="table-row" *ngFor="let p of products">
          <div class="product-info">
            <img [src]="p.primary_image || 'https://placehold.co/100x100/eeeeee/999999?text=No+Image'" class="thumb" />
            <span>{{ p.title }}</span>
          </div>
          <span>\${{ p.price | number:'1.2-2' }}</span>
          <span>{{ p.stock_quantity }}</span>
          <mat-chip [class]="'status-' + p.status">{{ p.status | titlecase }}</mat-chip>
          <div class="actions">
            <a mat-icon-button [routerLink]="['/seller/products/edit', p.id]"><mat-icon>edit</mat-icon></a>
            <button mat-icon-button color="warn" (click)="deleteProduct(p)"><mat-icon>delete</mat-icon></button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { font-size: 28px; font-weight: 700; margin: 0; }
    .empty { text-align: center; padding: 64px 24px; }
    .empty mat-icon { font-size: 64px; width: 64px; height: 64px; color: #ccc; }
    .product-table { border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
    .table-header { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; padding: 12px 16px; background: #f5f5f5; font-weight: 600; font-size: 13px; color: #666; text-transform: uppercase; }
    .table-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; padding: 12px 16px; border-top: 1px solid #f0f0f0; align-items: center; }
    .table-row:hover { background: #fafafa; }
    .product-info { display: flex; align-items: center; gap: 12px; }
    .thumb { width: 40px; height: 40px; border-radius: 6px; object-fit: cover; }
    .actions { display: flex; gap: 4px; }
    .status-active { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .status-draft { background: #f5f5f5 !important; color: #757575 !important; }
    .status-out_of_stock { background: #fff3e0 !important; color: #e65100 !important; }
  `],
})
export class SellerProductsComponent implements OnInit {
  products: Product[] = [];
  loading = true;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getFeaturedProducts(50).subscribe({
      next: (p) => { this.products = p; this.loading = false; },
      error: () => { this.products = []; this.loading = false; },
    });
  }

  deleteProduct(p: Product): void {
    if (confirm('Delete "' + p.title + '"?')) {
      this.products = this.products.filter(x => x.id !== p.id);
    }
  }
}
