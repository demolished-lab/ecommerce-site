import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SellerService } from '../../../services/seller.service';
import { Seller } from '../../../models/seller.model';

@Component({
  selector: 'app-seller-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressBarModule],
  template: `
    <div class="page" style="padding:40px 24px 80px;max-width:1200px;margin:auto;">
      <div class="header animate-fade-in">
        <h1>Marketplace Sellers</h1>
        <p>Discover unique products from top-rated sellers around the world.</p>
      </div>

      <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>
      
      <div class="grid animate-slide-up animate-delay-1" *ngIf="!loading">
        <mat-card *ngFor="let s of sellers" class="card" [routerLink]="['/seller', s.store_slug]">
          <div class="banner-wrapper">
            <img class="banner-img" [src]="s.store_banner || 'https://placehold.co/800x300/667eea/ffffff?text=Store+Banner'" [alt]="s.store_name" />
            <div class="overlay"></div>
          </div>
          <mat-card-content class="card-content">
            <div class="logo">
              <img *ngIf="s.store_logo" [src]="s.store_logo" [alt]="s.store_name" />
              <mat-icon *ngIf="!s.store_logo">store</mat-icon>
            </div>
            
            <div class="store-info">
              <h3>
                {{s.store_name}}
                <mat-icon class="verified-icon" *ngIf="s.is_verified" matTooltip="Verified Seller">verified</mat-icon>
              </h3>
              <p class="desc">{{s.store_description || 'No description provided by the seller.'}}</p>
            </div>

            <div class="stats-container">
              <div class="stat">
                <mat-icon>inventory_2</mat-icon>
                <div class="stat-text">
                  <span class="value">{{s.total_products}}</span>
                  <span class="label">Products</span>
                </div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat">
                <mat-icon class="star">star</mat-icon>
                <div class="stat-text">
                  <span class="value">{{s.average_rating | number:'1.1-1'}}</span>
                  <span class="label">{{s.review_count}} Reviews</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page { min-height: calc(100vh - 200px); }
    .header { margin-bottom: 40px; text-align: center; }
    .header h1 { font-size: 36px; font-weight: 700; color: #1f2937; margin: 0 0 12px; }
    .header p { font-size: 18px; color: #6b7280; margin: 0; }
    
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 32px; }
    .card { cursor: pointer; border-radius: 16px !important; overflow: hidden; transition: all 0.3s ease; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .card:hover { transform: translateY(-6px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
    
    .banner-wrapper { position: relative; height: 140px; background-color: #f3f4f6; }
    .banner-img { width: 100%; height: 100%; object-fit: cover; }
    .overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.4), transparent); }
    
    .card-content { padding: 0 24px 24px; position: relative; display: flex; flex-direction: column; align-items: center; }
    
    .logo { width: 80px; height: 80px; border-radius: 50%; background: #ffffff; border: 4px solid #ffffff; display: flex; align-items: center; justify-content: center; margin-top: -40px; position: relative; z-index: 10; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden; }
    .logo img { width: 100%; height: 100%; object-fit: cover; }
    .logo mat-icon { font-size: 40px; color: #9ca3af; width: 40px; height: 40px; }
    
    .store-info { text-align: center; margin-top: 16px; width: 100%; }
    .store-info h3 { font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 8px; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .verified-icon { color: #3b82f6; font-size: 20px; width: 20px; height: 20px; }
    .desc { color: #6b7280; font-size: 14px; margin: 0 0 24px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.5; min-height: 42px; }
    
    .stats-container { display: flex; align-items: center; justify-content: space-around; width: 100%; padding-top: 16px; border-top: 1px solid #f3f4f6; }
    .stat { display: flex; align-items: center; gap: 12px; }
    .stat mat-icon { color: #6b7280; }
    .stat mat-icon.star { color: #fbbf24; }
    .stat-text { display: flex; flex-direction: column; align-items: flex-start; }
    .stat-text .value { font-size: 16px; font-weight: 700; color: #111827; }
    .stat-text .label { font-size: 12px; color: #6b7280; }
    .stat-divider { width: 1px; height: 32px; background-color: #e5e7eb; }
  `]
})
export class SellerListComponent implements OnInit {
  sellers: Seller[] = [];
  loading = true;

  constructor(private sellerService: SellerService) {}

  ngOnInit(): void {
    this.sellerService.getSellers(1, 20).subscribe({
      next: (r) => { 
        if (r && r.data && r.data.length > 0) {
          this.sellers = r.data; 
        } else {
          this.loadDummyData();
        }
        this.loading = false; 
      },
      error: () => { 
        this.loadDummyData();
        this.loading = false; 
      },
    });
  }

  private loadDummyData(): void {
    this.sellers = [
      {
        id: 's1', user_id: 'u1', store_name: 'Tech Haven', store_slug: 'tech-haven',
        store_description: 'Discover the future of technology. From high-performance computing to premium audio gear, Tech Haven curates the finest gadgets.',
        business_name: 'Tech Haven LLC', business_type: 'retail', business_email: 'contact@techhaven.com',
        business_phone: '555-0100', address_city: 'San Francisco', address_state: 'CA', address_country: 'USA',
        status: 'active', tier: 'platinum', commission_rate: 10, is_verified: true,
        total_products: 145, total_orders: 8900, total_revenue: 150000,
        average_rating: 4.9, review_count: 1250, created_at: new Date().toISOString(),
        store_logo: 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?q=80&w=300&auto=format&fit=crop',
        store_banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop'
      },
      {
        id: 's2', user_id: 'u2', store_name: 'Urban Threads', store_slug: 'urban-threads',
        store_description: 'Elevated essentials for the urban explorer. Our collection blends sustainable materials with timeless design.',
        business_name: 'Urban Threads Inc', business_type: 'apparel', business_email: 'hello@urbanthreads.com',
        business_phone: '555-0200', address_city: 'New York', address_state: 'NY', address_country: 'USA',
        status: 'active', tier: 'gold', commission_rate: 12, is_verified: true,
        total_products: 420, total_orders: 5600, total_revenue: 85000,
        average_rating: 4.7, review_count: 890, created_at: new Date().toISOString(),
        store_logo: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=300&auto=format&fit=crop',
        store_banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop'
      },
      {
        id: 's3', user_id: 'u3', store_name: 'Home Sanctuary', store_slug: 'home-essentials',
        store_description: 'Transform your space into a sanctuary. We offer curated home decor and furniture that tells a story of craftsmanship.',
        business_name: 'Home Goods Corp', business_type: 'home', business_email: 'support@homeessentials.com',
        business_phone: '555-0300', address_city: 'Austin', address_state: 'TX', address_country: 'USA',
        status: 'active', tier: 'silver', commission_rate: 15, is_verified: true,
        total_products: 210, total_orders: 3400, total_revenue: 62000,
        average_rating: 4.6, review_count: 450, created_at: new Date().toISOString(),
        store_logo: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=300&auto=format&fit=crop',
        store_banner: 'https://images.unsplash.com/photo-1616489953149-8e7c371059f3?q=80&w=800&auto=format&fit=crop'
      },
      {
        id: 's4', user_id: 'u4', store_name: 'Verdant Gardens', store_slug: 'green-thumb',
        store_description: 'Bringing the beauty of nature to your doorstep. Specializing in exotic indoor plants and artisanal gardening tools.',
        business_name: 'Green Thumb LLC', business_type: 'garden', business_email: 'plants@greenthumb.com',
        business_phone: '555-0400', address_city: 'Portland', address_state: 'OR', address_country: 'USA',
        status: 'active', tier: 'bronze', commission_rate: 15, is_verified: true,
        total_products: 85, total_orders: 1200, total_revenue: 28000,
        average_rating: 4.8, review_count: 310, created_at: new Date().toISOString(),
        store_logo: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=300&auto=format&fit=crop',
        store_banner: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=800&auto=format&fit=crop'
      }
    ];
  }
}
