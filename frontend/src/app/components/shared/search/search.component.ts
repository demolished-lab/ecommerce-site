import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { Product } from '../../../models/product.model';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatFormFieldModule, MatSelectModule, FormsModule, MatSnackBarModule],
  template: `
    <div class="search-page" style="padding: 80px 24px 24px;">
      <div class="search-header animate-fade-in">
        <h1>Search Results</h1>
        <p *ngIf="query">Showing results for "<strong>{{ query }}</strong>"</p>
        <p *ngIf="!query">Enter a search term to find products</p>
      </div>

      <div class="search-controls animate-fade-in" *ngIf="query">
        <mat-form-field appearance="outline" class="sort-field">
          <mat-label>Sort by</mat-label>
          <mat-select [(ngModel)]="sortBy" (selectionChange)="search()">
            <mat-option value="relevance">Relevance</mat-option>
            <mat-option value="price_asc">Price: Low to High</mat-option>
            <mat-option value="price_desc">Price: High to Low</mat-option>
            <mat-option value="newest">Newest</mat-option>
            <mat-option value="rating">Highest Rated</mat-option>
          </mat-select>
        </mat-form-field>
        <span class="result-count" *ngIf="results">{{ results.length }} result{{ results.length !== 1 ? 's' : '' }} found</span>
      </div>

      <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>

      <div class="products-grid animate-slide-up animate-delay-1" *ngIf="results && results.length > 0">
        <mat-card *ngFor="let product of results" class="product-card" [routerLink]="['/product', product.slug]">
          <div class="product-image-wrap">
            <img [src]="product.primary_image || 'https://placehold.co/400x400/eeeeee/999999?text=No+Image'" [alt]="product.title" />
            <div class="discount-badge" *ngIf="product.discount_percentage > 0">-{{ product.discount_percentage }}%</div>
          </div>
          <mat-card-content>
            <h3 class="product-title">{{ product.title }}</h3>
            <p class="product-seller">by {{ product.seller_name }}</p>
            <div class="price-row">
              <span class="current-price">\${{ product.price | number:'1.2-2' }}</span>
              <span class="original-price" *ngIf="product.compare_at_price">\${{ product.compare_at_price | number:'1.2-2' }}</span>
            </div>
            <div class="product-rating" *ngIf="product.review_count > 0">
              <mat-icon class="star">star</mat-icon>
              <span>{{ product.average_rating | number:'1.1-1' }}</span>
              <span class="count">({{ product.review_count }})</span>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-flat-button color="primary" (click)="addToCart($event, product)">Add to Cart</button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div class="empty-state animate-slide-up animate-delay-1" *ngIf="results && results.length === 0 && !loading">
        <mat-icon>search_off</mat-icon>
        <h3>No products found</h3>
        <p>Try adjusting your search or browse our categories</p>
        <a mat-flat-button color="primary" routerLink="/products">Browse All Products</a>
      </div>
    </div>
  `,
  styles: [`
    .search-header { margin-bottom: 24px; }
    .search-header h1 { font-size: 28px; font-weight: 700; margin: 0 0 8px; }
    .search-header p { color: #666; margin: 0; }
    .search-controls { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .sort-field { width: 200px; }
    .result-count { color: #666; font-size: 14px; }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
    .product-card { cursor: pointer; transition: transform .2s, box-shadow .2s; }
    .product-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,.1); }
    .product-image-wrap { position: relative; aspect-ratio: 1; overflow: hidden; }
    .product-image-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .discount-badge { position: absolute; top: 12px; right: 12px; background: #d32f2f; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .product-title { font-size: 15px; font-weight: 500; margin: 8px 0 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .product-seller { font-size: 13px; color: #888; margin: 0 0 6px; }
    .price-row { display: flex; gap: 8px; align-items: baseline; margin-bottom: 4px; }
    .current-price { font-size: 18px; font-weight: 700; color: #1976d2; }
    .original-price { font-size: 13px; color: #999; text-decoration: line-through; }
    .product-rating { display: flex; align-items: center; gap: 4px; font-size: 13px; }
    .star { color: #ffc107; font-size: 16px; width: 16px; height: 16px; }
    .count { color: #999; }
    .empty-state { text-align: center; padding: 64px 24px; color: #666; }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; color: #ccc; margin-bottom: 16px; }
    .empty-state h3 { font-size: 22px; margin: 0 0 8px; color: #333; }
    .empty-state p { margin: 0 0 24px; }
  `],
})
export class SearchComponent implements OnInit {
  query = '';
  sortBy = 'relevance';
  results: Product[] | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute, 
    private productService: ProductService, 
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.query = params['q'] || '';
      if (this.query) this.search();
    });
  }

  search(): void {
    if (!this.query) return;
    this.loading = true;
    this.productService.getFeaturedProducts(50).subscribe({
      next: (products) => { this.results = products; this.loading = false; },
      error: () => { this.results = []; this.loading = false; },
    });
  }

  addToCart(event: Event, product: Product): void {
    event.preventDefault();
    event.stopPropagation();
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
