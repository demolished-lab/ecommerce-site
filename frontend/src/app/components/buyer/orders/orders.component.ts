import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressBarModule],
  template: `
    <div class="page" style="padding: 80px 24px 24px; max-width: 900px; margin: auto;">
      <h1>My Orders</h1>
      <div class="filter-tabs">
        <button mat-button *ngFor="let s of statuses" [class.active]="activeStatus === s.value"
          (click)="filterByStatus(s.value)">{{ s.label }}</button>
      </div>
      <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>
      <div *ngIf="!loading && orders.length === 0" class="empty">
        <mat-icon>receipt_long</mat-icon>
        <h3>No orders found</h3>
        <p>Start shopping to see your orders here</p>
        <a mat-flat-button color="primary" routerLink="/products">Browse Products</a>
      </div>
      <mat-card *ngFor="let order of orders" class="order-card" [routerLink]="['/order', order.id]">
        <mat-card-content>
          <div class="order-header">
            <div>
              <span class="order-number">#{{ order.order_number }}</span>
              <span class="order-date">{{ order.created_at | date:'mediumDate' }}</span>
            </div>
            <mat-chip [class]="'status-' + order.status">{{ order.status | titlecase }}</mat-chip>
          </div>
          <div class="order-summary">
            <span>{{ order.item_count || 0 }} item{{ (order.item_count || 0) !== 1 ? 's' : '' }}</span>
            <span class="order-total">\${{ order.total_amount | number:'1.2-2' }}</span>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    h1 { font-size: 28px; font-weight: 700; margin: 0 0 16px; }
    .filter-tabs { display: flex; gap: 4px; margin-bottom: 24px; flex-wrap: wrap; }
    .filter-tabs button.active { background: #667eea; color: white; }
    .order-card { cursor: pointer; margin-bottom: 12px; transition: transform .2s, box-shadow .2s; }
    .order-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,.08); }
    .order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .order-number { font-weight: 600; font-size: 16px; margin-right: 12px; }
    .order-date { color: #888; font-size: 14px; }
    .order-summary { display: flex; justify-content: space-between; color: #666; }
    .order-total { font-weight: 700; color: #1976d2; font-size: 18px; }
    .empty { text-align: center; padding: 64px 24px; }
    .empty mat-icon { font-size: 64px; width: 64px; height: 64px; color: #ccc; }
    .empty h3 { margin: 16px 0 8px; }
    .empty p { color: #888; margin: 0 0 24px; }
    .status-pending { background: #fff3e0 !important; color: #e65100 !important; }
    .status-confirmed, .status-processing { background: #e3f2fd !important; color: #1565c0 !important; }
    .status-shipped { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .status-delivered { background: #e8f5e9 !important; color: #1b5e20 !important; }
    .status-cancelled { background: #ffebee !important; color: #c62828 !important; }
  `],
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  activeStatus = '';
  statuses = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void { this.loadOrders(); }

  filterByStatus(s: string): void { this.activeStatus = s; this.loadOrders(); }

  private loadOrders(): void {
    this.loading = true;
    this.orderService.getMyOrders(1, 50, this.activeStatus || undefined).subscribe({
      next: (res) => { this.orders = res.data; this.loading = false; },
      error: () => { this.orders = []; this.loading = false; },
    });
  }
}
