import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SellerService } from '../../../services/seller.service';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="page" style="padding: 80px 24px 24px; max-width: 1100px; margin: auto;">
      <div class="dash-header">
        <h1>Seller Dashboard</h1>
        <a mat-flat-button color="primary" routerLink="/seller/products/new"><mat-icon>add</mat-icon> Add Product</a>
      </div>
      <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>

      <div class="stats-grid" *ngIf="stats">
        <mat-card class="stat-card revenue"><mat-icon>attach_money</mat-icon><div class="stat-info"><span class="stat-value">\${{ stats.total_revenue | number:'1.0-0' }}</span><span class="stat-label">Total Revenue</span></div></mat-card>
        <mat-card class="stat-card orders"><mat-icon>shopping_bag</mat-icon><div class="stat-info"><span class="stat-value">{{ stats.total_orders }}</span><span class="stat-label">Total Orders</span></div></mat-card>
        <mat-card class="stat-card products"><mat-icon>inventory_2</mat-icon><div class="stat-info"><span class="stat-value">{{ stats.total_products }}</span><span class="stat-label">Products</span></div></mat-card>
        <mat-card class="stat-card rating"><mat-icon>star</mat-icon><div class="stat-info"><span class="stat-value">{{ stats.average_rating | number:'1.1-1' }}</span><span class="stat-label">Rating ({{ stats.review_count }} reviews)</span></div></mat-card>
      </div>

      <div class="quick-links">
        <mat-card class="link-card" routerLink="/seller/products"><mat-icon>inventory_2</mat-icon><span>Manage Products</span></mat-card>
        <mat-card class="link-card" routerLink="/seller/orders"><mat-icon>local_shipping</mat-icon><span>View Orders</span></mat-card>
        <mat-card class="link-card" routerLink="/seller/analytics"><mat-icon>analytics</mat-icon><span>Analytics</span></mat-card>
        <mat-card class="link-card" routerLink="/seller/settings"><mat-icon>settings</mat-icon><span>Store Settings</span></mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { font-size: 28px; font-weight: 700; margin: 0; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .stat-card { display: flex; align-items: center; gap: 16px; padding: 24px; border-radius: 12px; }
    .stat-card mat-icon { font-size: 40px; width: 40px; height: 40px; opacity: .8; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 28px; font-weight: 700; }
    .stat-label { font-size: 13px; color: #888; }
    .revenue { border-left: 4px solid #4caf50; }
    .revenue mat-icon { color: #4caf50; }
    .orders { border-left: 4px solid #2196f3; }
    .orders mat-icon { color: #2196f3; }
    .products { border-left: 4px solid #ff9800; }
    .products mat-icon { color: #ff9800; }
    .rating { border-left: 4px solid #ffc107; }
    .rating mat-icon { color: #ffc107; }
    .quick-links { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .link-card { display: flex; align-items: center; gap: 12px; padding: 20px; cursor: pointer; transition: transform .2s, box-shadow .2s; }
    .link-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,.08); }
    .link-card mat-icon { color: #667eea; font-size: 28px; width: 28px; height: 28px; }
    .link-card span { font-weight: 500; font-size: 15px; }
  `],
})
export class SellerDashboardComponent implements OnInit {
  stats: any = null;
  loading = true;

  constructor(private sellerService: SellerService) {}

  ngOnInit(): void {
    this.sellerService.getDashboardStats().subscribe({
      next: (s) => { this.stats = s; this.loading = false; },
      error: () => {
        this.stats = { total_revenue: 0, total_orders: 0, total_products: 0, average_rating: 0, review_count: 0 };
        this.loading = false;
      },
    });
  }
}
