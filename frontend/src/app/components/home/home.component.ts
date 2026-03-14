import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatChipsModule } from "@angular/material/chips";
import { ProductService } from "../../services/product.service";
import { CartService } from "../../services/cart.service";
import { Product, Category } from "../../models/product.model";
import { Observable } from "rxjs";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="home-container">
      <!-- Hero Section -->
      <section class="hero-section animate-fade-in">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">Discover Amazing Products</h1>
            <p class="hero-subtitle">
              Shop from thousands of sellers worldwide. Find unique items, great
              deals, and support small businesses.
            </p>
            <div class="hero-actions">
              <a
                mat-raised-button
                color="primary"
                routerLink="/products"
                class="hero-btn"
              >
                Shop Now
                <mat-icon>arrow_forward</mat-icon>
              </a>
              <a
                mat-stroked-button
                routerLink="/become-seller"
                class="hero-btn"
              >
                Start Selling
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="categories-section animate-slide-up animate-delay-1">
        <div class="container">
          <h2 class="section-title">Browse by Category</h2>
          <div
            class="categories-grid"
            *ngIf="categories$ | async as categories"
          >
            <mat-card
              *ngFor="let category of categories"
              class="category-card"
              [routerLink]="['/category', category.slug]"
            >
              <mat-card-content class="category-content">
                <mat-icon class="category-icon" *ngIf="category.icon">{{
                  category.icon
                }}</mat-icon>
                <mat-icon class="category-icon" *ngIf="!category.icon"
                  >category</mat-icon
                >
                <h3 class="category-name">{{ category.name }}</h3>
                <p class="category-count">
                  {{ category.product_count || 0 }} Products
                </p>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </section>

      <!-- Featured Products Section -->
      <section class="featured-section animate-slide-up animate-delay-2">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">Featured Products</h2>
            <a mat-button routerLink="/products" color="primary">
              View All
              <mat-icon>chevron_right</mat-icon>
            </a>
          </div>

          <div
            class="products-grid"
            *ngIf="featuredProducts$ | async as products"
          >
            <mat-card
              *ngFor="let product of products"
              class="product-card"
              [routerLink]="['/product', product.slug]"
            >
              <div class="product-image-container">
                <img
                  [src]="
                    product.primary_image || 'https://placehold.co/400x400/eeeeee/999999?text=No+Image'
                  "
                  [alt]="product.title"
                  class="product-image"
                />
                <div class="product-badge" *ngIf="product.is_featured">
                  Featured
                </div>
                <div
                  class="discount-badge"
                  *ngIf="product.discount_percentage > 0"
                >
                  -{{ product.discount_percentage }}%
                </div>
              </div>
              <mat-card-content class="product-content">
                <h3 class="product-title">{{ product.title }}</h3>
                <p class="product-seller">by {{ product.seller_name }}</p>
                <div class="product-price">
                  <span class="current-price"
                    >\${{ product.price | number: "1.2-2" }}</span
                  >
                  <span class="original-price" *ngIf="product.compare_at_price">
                    \${{ product.compare_at_price | number: "1.2-2" }}
                  </span>
                </div>
                <div class="product-rating" *ngIf="product.review_count > 0">
                  <mat-icon class="star-icon">star</mat-icon>
                  <span>{{ product.average_rating | number: "1.1-1" }}</span>
                  <span class="review-count">({{ product.review_count }})</span>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button
                  mat-button
                  color="primary"
                  (click)="addToCart($event, product)"
                >
                  <mat-icon>shopping_cart</mat-icon>
                  Add to Cart
                </button>
              </mat-card-actions>
            </mat-card>
          </div>

          <mat-progress-bar
            mode="indeterminate"
            *ngIf="loading"
          ></mat-progress-bar>
        </div>
      </section>

      <!-- Why Shop With Us -->
      <section class="features-section animate-slide-up animate-delay-3">
        <div class="container">
          <h2 class="section-title">Why Shop With Us</h2>
          <div class="features-grid">
            <div class="feature-item">
              <mat-icon class="feature-icon">local_shipping</mat-icon>
              <h3>Free Shipping</h3>
              <p>On orders over $50</p>
            </div>
            <div class="feature-item">
              <mat-icon class="feature-icon">verified</mat-icon>
              <h3>Verified Sellers</h3>
              <p>All sellers are vetted</p>
            </div>
            <div class="feature-item">
              <mat-icon class="feature-icon">security</mat-icon>
              <h3>Secure Payments</h3>
              <p>100% secure checkout</p>
            </div>
            <div class="feature-item">
              <mat-icon class="feature-icon">support_agent</mat-icon>
              <h3>24/7 Support</h3>
              <p>Always here to help</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .home-container {
        min-height: 100vh;
      }

      /* Hero Section */
      .hero-section {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 120px 0 80px;
        text-align: center;
      }

      .hero-title {
        font-size: 48px;
        font-weight: 700;
        margin-bottom: 16px;
      }

      .hero-subtitle {
        font-size: 20px;
        opacity: 0.9;
        max-width: 600px;
        margin: 0 auto 32px;
        line-height: 1.6;
      }

      .hero-actions {
        display: flex;
        gap: 16px;
        justify-content: center;
      }

      .hero-btn {
        padding: 12px 32px;
        font-size: 16px;
      }

      /* Section Styles */
      section {
        padding: 64px 0;
      }

      .section-title {
        font-size: 32px;
        font-weight: 600;
        margin-bottom: 32px;
        text-align: center;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 32px;
      }

      /* Categories Section */
      .categories-section {
        background-color: white;
      }

      .categories-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 24px;
      }

      .category-card {
        cursor: pointer;
        transition:
          transform 0.2s,
          box-shadow 0.2s;
        text-align: center;
      }

      .category-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      }

      .category-content {
        padding: 32px 16px;
      }

      .category-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        color: #1976d2;
      }

      .category-name {
        font-size: 16px;
        font-weight: 500;
        margin: 0 0 8px;
      }

      .category-count {
        font-size: 14px;
        color: #666;
        margin: 0;
      }

      /* Products Grid */
      .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 24px;
      }

      .product-card {
        cursor: pointer;
        transition:
          transform 0.2s,
          box-shadow 0.2s;
      }

      .product-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      }

      .product-image-container {
        position: relative;
        aspect-ratio: 1;
        overflow: hidden;
      }

      .product-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .product-badge {
        position: absolute;
        top: 12px;
        left: 12px;
        background-color: #1976d2;
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
      }

      .discount-badge {
        position: absolute;
        top: 12px;
        right: 12px;
        background-color: #d32f2f;
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
      }

      .product-content {
        padding: 16px;
      }

      .product-title {
        font-size: 16px;
        font-weight: 500;
        margin: 0 0 8px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .product-seller {
        font-size: 14px;
        color: #666;
        margin: 0 0 8px;
      }

      .product-price {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .current-price {
        font-size: 20px;
        font-weight: 600;
        color: #1976d2;
      }

      .original-price {
        font-size: 14px;
        color: #999;
        text-decoration: line-through;
      }

      .product-rating {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
      }

      .star-icon {
        color: #ffc107;
        font-size: 18px;
      }

      .review-count {
        color: #666;
      }

      /* Features Section */
      .features-section {
        background-color: #f5f5f5;
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 32px;
        text-align: center;
      }

      .feature-item {
        padding: 24px;
      }

      .feature-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #1976d2;
        margin-bottom: 16px;
      }

      .feature-item h3 {
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 8px;
      }

      .feature-item p {
        color: #666;
        margin: 0;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .hero-title {
          font-size: 32px;
        }

        .hero-subtitle {
          font-size: 16px;
        }

        .hero-actions {
          flex-direction: column;
          align-items: center;
        }

        .section-title {
          font-size: 24px;
        }

        .products-grid {
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        }
      }
    `,
  ],
})
export class HomeComponent implements OnInit {
  featuredProducts$: Observable<Product[]> | undefined;
  categories$: Observable<Category[]> | undefined;
  loading = true;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadFeaturedProducts();
    this.loadCategories();
  }

  private loadFeaturedProducts(): void {
    this.featuredProducts$ = this.productService.getFeaturedProducts(8);
    this.loading = false;
  }

  private loadCategories(): void {
    this.categories$ = this.productService.getCategories();
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
