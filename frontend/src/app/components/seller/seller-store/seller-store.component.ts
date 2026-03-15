import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SellerService } from '../../../services/seller.service';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { Seller } from '../../../models/seller.model';
import { Product } from '../../../models/product.model';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-seller-store',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressBarModule, MatSnackBarModule],
  template: `
    <div class="page" style="padding-top:64px; min-height: calc(100vh - 200px);">
      <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>
      <div *ngIf="seller" class="store animate-fade-in">
        <div class="banner-wrapper">
          <img class="banner-img" [src]="seller.store_banner || 'https://placehold.co/1200x300/667eea/ffffff?text=Store+Banner'" [alt]="seller.store_name" />
          <div class="overlay"></div>
        </div>
        <div class="store-info-section">
          <div class="logo">
            <img *ngIf="seller.store_logo" [src]="seller.store_logo" [alt]="seller.store_name" />
            <mat-icon *ngIf="!seller.store_logo">store</mat-icon>
          </div>
          <div class="info">
            <div class="title-row">
              <h1>
                {{seller.store_name}} 
                <mat-icon class="verified-icon" *ngIf="seller.is_verified">verified</mat-icon>
              </h1>
              <div class="actions">
                <button mat-flat-button color="primary" (click)="dummyAction('You are now following ' + seller.store_name + '!')">
                  <mat-icon>person_add</mat-icon> Follow
                </button>
                <button mat-stroked-button color="primary" (click)="dummyAction('Opening message window for ' + seller.store_name + '...')">
                  <mat-icon>chat</mat-icon> Contact
                </button>
                <button mat-stroked-button (click)="dummyAction('Redirecting to ' + seller.store_name + '\\\'s external website...')">
                  <mat-icon>language</mat-icon> Website
                </button>
                <button mat-icon-button (click)="dummyAction('Link copied to clipboard!')" matTooltip="Share Store">
                  <mat-icon>share</mat-icon>
                </button>
              </div>
            </div>
            <p class="desc">{{seller.store_description}}</p>
            <div class="meta">
              <span><mat-icon class="star">star</mat-icon>{{seller.average_rating|number:'1.1-1'}} ({{seller.review_count}} reviews)</span>
              <span class="dot">•</span>
              <span><mat-icon>inventory_2</mat-icon>{{seller.total_products}} products</span>
              <span class="dot">•</span>
              <span><mat-icon>location_on</mat-icon>{{seller.address_city}}, {{seller.address_country}}</span>
            </div>
          </div>
        </div>
        
        <div class="products-section animate-slide-up animate-delay-1" style="padding:40px 24px;max-width:1200px;margin:auto;">
          <h2 class="section-title">All Products</h2>
          <div class="grid">
            <mat-card *ngFor="let p of products" class="pcard">
              <div class="img-wrap" [routerLink]="['/product',p.slug]">
                <img [src]="p.primary_image||'https://placehold.co/400x400/eeeeee/999999?text=No+Image'" [alt]="p.title" />
                <div class="discount-badge" *ngIf="p.discount_percentage > 0">-{{p.discount_percentage}}%</div>
              </div>
              <mat-card-content class="card-content" [routerLink]="['/product',p.slug]">
                <h3>{{p.title}}</h3>
                <div class="price-row">
                  <span class="price">\${{p.price|number:'1.2-2'}}</span>
                  <span class="original" *ngIf="p.compare_at_price">\${{p.compare_at_price|number:'1.2-2'}}</span>
                </div>
              </mat-card-content>
              <mat-card-actions class="card-actions">
                <button mat-flat-button color="primary" class="add-btn" (click)="addToCart(p)">
                  <mat-icon>add_shopping_cart</mat-icon> Add to Cart
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
          
          <div class="empty-state" *ngIf="products.length === 0 && !loading">
            <mat-icon>inventory_2</mat-icon>
            <h3>No products found</h3>
            <p>This seller hasn't listed any products yet.</p>
          </div>
        </div>
      </div>
      
      <div class="error-state animate-fade-in" *ngIf="!seller && !loading">
        <mat-icon color="warn">error_outline</mat-icon>
        <h2>Store not found</h2>
        <p>The seller you are looking for does not exist or has been removed.</p>
        <a mat-flat-button color="primary" routerLink="/sellers">Back to Sellers</a>
      </div>
    </div>
  `,
  styles: [`
    .banner-wrapper { position: relative; height: 280px; background-color: #f3f4f6; }
    .banner-img { width: 100%; height: 100%; object-fit: cover; }
    .overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.6), transparent); }
    
    .store-info-section { display: flex; gap: 32px; padding: 0 40px; max-width: 1200px; margin: -60px auto 0; position: relative; z-index: 10; align-items: flex-start; }
    @media (max-width: 768px) {
      .store-info-section { flex-direction: column; align-items: center; text-align: center; gap: 16px; margin-top: -80px; }
      .title-row { flex-direction: column; justify-content: center !important; gap: 16px; }
      .meta { justify-content: center; flex-wrap: wrap; }
    }
    
    .logo { width: 140px; height: 140px; border-radius: 50%; background: #ffffff; border: 4px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2); overflow: hidden; flex-shrink: 0; }
    .logo img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .logo mat-icon { font-size: 64px; color: #9ca3af; width: 64px; height: 64px; }
    
    .info { flex: 1; margin-top: 70px; width: 100%; }
    .title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .actions { display: flex; gap: 12px; }
    
    h1 { font-size: 32px; font-weight: 800; margin: 0; color: #111827; display: flex; align-items: center; gap: 8px; }
    .verified-icon { color: #3b82f6; font-size: 28px; width: 28px; height: 28px; }
    
    .desc { color: #4b5563; font-size: 16px; margin: 0 0 16px; max-width: 800px; line-height: 1.6; }
    
    .meta { display: flex; gap: 16px; align-items: center; font-size: 14px; color: #6b7280; font-weight: 500; }
    .meta span { display: flex; align-items: center; gap: 6px; }
    .meta mat-icon { color: #9ca3af; font-size: 18px; width: 18px; height: 18px; }
    .meta mat-icon.star { color: #fbbf24; }
    .dot { color: #d1d5db; }
    
    .section-title { font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 24px; padding-bottom: 12px; border-bottom: 2px solid #f3f4f6; }
    
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; }
    .pcard { overflow: hidden; transition: all 0.3s ease; border-radius: 12px !important; border: 1px solid #e5e7eb; display: flex; flex-direction: column; }
    .pcard:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -8px rgba(0,0,0,0.15); }
    
    .img-wrap { aspect-ratio: 1; overflow: hidden; position: relative; cursor: pointer; background: #f9fafb; }
    .img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    .pcard:hover .img-wrap img { transform: scale(1.05); }
    .discount-badge { position: absolute; top: 12px; right: 12px; background: #ef4444; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; z-index: 2; }
    
    .card-content { padding: 16px; cursor: pointer; flex: 1; }
    .card-content h3 { font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    
    .price-row { display: flex; align-items: baseline; gap: 8px; margin-top: auto; }
    .price { font-size: 18px; font-weight: 700; color: #2563eb; }
    .original { font-size: 14px; text-decoration: line-through; color: #9ca3af; }
    
    .card-actions { padding: 16px; padding-top: 0; }
    .add-btn { width: 100%; border-radius: 8px !important; height: 44px; }
    
    .empty-state { text-align: center; padding: 64px 24px; background: #f9fafb; border-radius: 16px; border: 2px dashed #e5e7eb; }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; color: #9ca3af; margin-bottom: 16px; }
    .empty-state h3 { font-size: 20px; font-weight: 600; color: #111827; margin: 0 0 8px; }
    .empty-state p { color: #6b7280; margin: 0; }
    
    .error-state { text-align: center; padding: 120px 24px; }
    .error-state mat-icon { font-size: 80px; width: 80px; height: 80px; margin-bottom: 24px; }
    .error-state h2 { font-size: 28px; font-weight: 700; color: #111827; margin: 0 0 12px; }
    .error-state p { font-size: 16px; color: #6b7280; margin: 0 0 32px; }
  `],
})
export class SellerStoreComponent implements OnInit {
  seller: Seller | null = null;
  products: Product[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute, 
    private sellerService: SellerService, 
    private productService: ProductService,
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.sellerService.getSellerBySlug(slug).subscribe({
      next: (s) => {
        if (s) {
          this.seller = s;
          this.loadProducts();
        } else {
          this.loadDummySeller(slug);
        }
      },
      error: () => { 
        this.loadDummySeller(slug);
      },
    });
  }

  loadDummySeller(slug: string): void {
    const dummies: any[] = [
      {
        id: 's1', user_id: 'u1', store_name: 'Tech Haven', store_slug: 'tech-haven',
        store_description: 'Discover the future of technology. From high-performance computing to premium audio experiences, Tech Haven curates only the finest gadgets for the modern professional.',
        address_city: 'San Francisco', address_country: 'USA', is_verified: true,
        total_products: 145, average_rating: 4.9, review_count: 1250,
        store_logo: 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?q=80&w=300&auto=format&fit=crop',
        store_banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop'
      },
      {
        id: 's2', user_id: 'u2', store_name: 'Urban Threads', store_slug: 'urban-threads',
        store_description: 'Elevated essentials for the urban explorer. Our collection blends sustainable materials with timeless design for a wardrobe that lasts provided by vetted artisans.',
        address_city: 'New York', address_country: 'USA', is_verified: true,
        total_products: 420, average_rating: 4.7, review_count: 890,
        store_logo: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=300&auto=format&fit=crop',
        store_banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop'
      },
      {
        id: 's3', user_id: 'u3', store_name: 'Home Sanctuary', store_slug: 'home-essentials',
        store_description: 'Transform your living space into a sanctuary of comfort and style. We offer curated home decor and furniture that tells a story of craftsmanship and elegance.',
        address_city: 'Austin', address_country: 'USA', is_verified: true,
        total_products: 210, average_rating: 4.6, review_count: 450,
        store_logo: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=300&auto=format&fit=crop',
        store_banner: 'https://images.unsplash.com/photo-1616489953149-8e7c371059f3?q=80&w=1200&auto=format&fit=crop'
      },
      {
        id: 's4', user_id: 'u4', store_name: 'Verdant Gardens', store_slug: 'green-thumb',
        store_description: 'Bringing the beauty of nature to your doorstep. Specializing in exotic indoor plants and artisanal gardening tools for the sophisticated green thumb.',
        address_city: 'Portland', address_country: 'USA', is_verified: true,
        total_products: 85, average_rating: 4.8, review_count: 310,
        store_logo: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=300&auto=format&fit=crop',
        store_banner: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=1200&auto=format&fit=crop'
      }
    ];

    const match = dummies.find(d => d.store_slug === slug);
    if (match) {
      this.seller = match;
      this.loadProducts();
    } else {
      // If it doesn't match a dummy store, leave it null to show error state
      this.seller = null;
      this.loading = false;
    }
  }

  loadProducts(): void {
    // Filter products specifically for this store
    this.productService.getFeaturedProducts(100).subscribe({ 
      next: (p) => { 
        this.products = p.filter(prod => prod.seller_id === this.seller?.id); 
        this.loading = false; 
      },
      error: () => { this.products = []; this.loading = false; }
    });
  }

  addToCart(product: Product): void {
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

  dummyAction(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }
}
