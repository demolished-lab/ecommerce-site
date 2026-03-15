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
                class="hero-btn sell-btn"
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
            <div
              *ngFor="let category of categories; let i = index"
              class="category-card cat-reveal"
              [style.animation-delay]="i * 0.1 + 's'"
              [routerLink]="['/category', category.slug]"
            >
              <div class="category-banner">
                <img [src]="category.image_url || 'https://images.unsplash.com/photo-1549463591-24c18d2bd12a?q=80&w=400&auto=format&fit=crop'" [alt]="category.name" class="banner-img" />
                <div class="banner-overlay"></div>
              </div>
              <div class="category-glass-content">
                <div class="icon-floating">
                  <mat-icon>{{ category.icon || 'category' }}</mat-icon>
                </div>
                <div class="text-content">
                  <h3 class="category-name">{{ category.name }}</h3>
                  <span class="count-chip">{{ category.product_count || 0 }} Items</span>
                </div>
              </div>
            </div>
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
                <div class="stock-badge" [class.out-of-stock]="product.stock_quantity === 0">
                  {{ product.stock_quantity > 0 ? product.stock_quantity + ' available' : 'Sold Out' }}
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
        background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1920&auto=format&fit=crop');
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
        color: white;
        padding: 160px 0 120px;
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

      .sell-btn {
        background: linear-gradient(135deg, #e53935 0%, #b71c1c 100%) !important;
        color: white !important;
        border: none !important;
        box-shadow: 0 4px 14px 0 rgba(183, 28, 28, 0.39) !important;
        transition: transform 0.2s, box-shadow 0.2s !important;
      }

      .sell-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(183, 28, 28, 0.5) !important;
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
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 32px;
        padding: 20px 0;
      }

      .category-card {
        position: relative;
        height: 220px;
        border-radius: 24px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
      }

      .category-card:hover {
        transform: translateY(-12px);
        box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
      }

      .category-banner {
        position: absolute;
        inset: 0;
        z-index: 0;
      }

      .banner-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.8s ease;
      }

      .category-card:hover .banner-img {
        transform: scale(1.15);
      }

      .banner-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%);
      }

      .category-glass-content {
        position: absolute;
        bottom: 12px;
        left: 12px;
        right: 12px;
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(16px) saturate(180%);
        -webkit-backdrop-filter: blur(16px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 14px;
        z-index: 1;
        transition: transform 0.3s ease, background 0.3s ease;
      }

      .category-card:hover .category-glass-content {
        background: rgba(255, 255, 255, 0.25);
        transform: translateY(-4px);
      }

      .icon-floating {
        width: 44px;
        height: 44px;
        background: rgba(255, 255, 255, 0.9);
        color: #3f51b5;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transition: transform 0.4s ease;
      }

      .category-card:hover .icon-floating {
        transform: rotate(-12deg) scale(1.1);
      }

      .text-content h3 {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 800;
        color: white;
        text-shadow: 0 2px 8px rgba(0,0,0,0.4);
        letter-spacing: -0.2px;
      }

      .count-chip {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.9);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      /* Entrance Animation */
      .cat-reveal {
        opacity: 0;
        transform: translateY(40px);
        animation: revealCat 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
      }

      @keyframes revealCat {
        to {
          opacity: 1;
          transform: translateY(0);
        }
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
        font-size: 11px;
        font-weight: 600;
        z-index: 2;
      }

      .stock-badge {
        position: absolute;
        bottom: 12px;
        left: 12px;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(4px);
        color: #2e7d32;
        padding: 4px 10px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 700;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        z-index: 2;
      }

      .stock-badge.out-of-stock {
        color: #c62828;
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
    
    this.cartService.addItem({ 
      product_id: product.id, 
      quantity: 1,
      product_name: product.title,
      product_image: product.primary_image,
      unit_price: product.price
    }).subscribe({
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
