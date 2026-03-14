import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'app-seller-orders',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatSelectModule, MatProgressBarModule, FormsModule],
  template: `
    <div class="page" style="padding: 80px 24px 24px; max-width: 1100px; margin: auto;">
      <h1>Store Orders</h1>
      <div class="filter-bar">
        <button mat-button *ngFor="let s of statuses" [class.active]="activeStatus === s.value"
          (click)="filterByStatus(s.value)">{{ s.label }}</button>
      </div>
      <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>
      <div *ngIf="!loading && orders.length === 0" class="empty">
        <mat-icon>local_shipping</mat-icon><h3>No orders yet</h3>
      </div>
      <div class="orders-table" *ngIf="orders.length > 0">
        <div class="table-header"><span>Order</span><span>Date</span><span>Total</span><span>Status</span><span>Actions</span></div>
        <div class="table-row" *ngFor="let o of orders">
          <span class="order-num">#{{ o.order_number }}</span>
          <span>{{ o.created_at | date:'shortDate' }}</span>
          <span class="total">\${{ o.total_amount | number:'1.2-2' }}</span>
          <mat-chip [class]="'status-' + o.status">{{ o.status | titlecase }}</mat-chip>
          <div class="actions">
            <mat-select [(ngModel)]="o.status" class="status-select" (selectionChange)="updateStatus(o)">
              <mat-option value="confirmed">Confirm</mat-option>
              <mat-option value="processing">Processing</mat-option>
              <mat-option value="shipped">Shipped</mat-option>
              <mat-option value="delivered">Delivered</mat-option>
            </mat-select>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    h1 { font-size: 28px; font-weight: 700; margin: 0 0 16px; }
    .filter-bar { display: flex; gap: 4px; margin-bottom: 24px; flex-wrap: wrap; }
    .filter-bar button.active { background: #667eea; color: white; }
    .orders-table { border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
    .table-header { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1.5fr; padding: 12px 16px; background: #f5f5f5; font-weight: 600; font-size: 13px; color: #666; text-transform: uppercase; }
    .table-row { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1.5fr; padding: 12px 16px; border-top: 1px solid #f0f0f0; align-items: center; }
    .order-num { font-weight: 600; }
    .total { font-weight: 600; color: #1976d2; }
    .status-select { max-width: 130px; }
    .empty { text-align: center; padding: 64px; }
    .empty mat-icon { font-size: 64px; width: 64px; height: 64px; color: #ccc; }
    .status-pending { background: #fff3e0 !important; color: #e65100 !important; }
    .status-confirmed, .status-processing { background: #e3f2fd !important; color: #1565c0 !important; }
    .status-shipped { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .status-delivered { background: #e8f5e9 !important; color: #1b5e20 !important; }
  `],
})
export class SellerOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  activeStatus = '';
  statuses = [
    { label: 'All', value: '' }, { label: 'Pending', value: 'pending' },
    { label: 'Processing', value: 'processing' }, { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
  ];

  constructor(private orderService: OrderService) {}

  ngOnInit(): void { this.loadOrders(); }

  filterByStatus(s: string): void { this.activeStatus = s; this.loadOrders(); }

  private loadOrders(): void {
    this.loading = true;
    this.orderService.getSellerOrders(1, 50, this.activeStatus || undefined).subscribe({
      next: (res) => { this.orders = res.data; this.loading = false; },
      error: () => { this.orders = []; this.loading = false; },
    });
  }

  updateStatus(o: Order): void {
    this.orderService.updateOrderStatus(o.id, o.status).subscribe();
  }
}
