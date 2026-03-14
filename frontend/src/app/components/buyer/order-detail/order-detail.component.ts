import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatDividerModule, MatProgressBarModule],
  template: `
    <div class="page" style="padding: 80px 24px 24px; max-width: 800px; margin: auto;">
      <a mat-button routerLink="/orders" class="back-link"><mat-icon>arrow_back</mat-icon> Back to Orders</a>
      <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>
      <div *ngIf="order" class="order-detail">
        <div class="order-header-row">
          <div>
            <h1>Order #{{ order.order_number }}</h1>
            <p class="date">Placed on {{ order.created_at | date:'fullDate' }}</p>
          </div>
          <mat-chip [class]="'status-' + order.status">{{ order.status | titlecase }}</mat-chip>
        </div>

        <mat-card class="section-card">
          <h3>Items</h3>
          <div class="item-row" *ngFor="let item of order.items">
            <div class="item-info">
              <strong>{{ item.product_name }}</strong>
              <span class="item-variant" *ngIf="item.variant_name">{{ item.variant_name }}</span>
              <span class="item-qty">Qty: {{ item.quantity }}</span>
            </div>
            <span class="item-price">\${{ item.total_price | number:'1.2-2' }}</span>
          </div>
          <mat-divider></mat-divider>
          <div class="totals">
            <div class="total-row"><span>Subtotal</span><span>\${{ order.subtotal | number:'1.2-2' }}</span></div>
            <div class="total-row"><span>Tax</span><span>\${{ order.tax_amount | number:'1.2-2' }}</span></div>
            <div class="total-row"><span>Shipping</span><span>\${{ order.shipping_cost | number:'1.2-2' }}</span></div>
            <div class="total-row total-final"><span>Total</span><span>\${{ order.total_amount | number:'1.2-2' }}</span></div>
          </div>
        </mat-card>

        <mat-card class="section-card" *ngIf="order.shipping_address">
          <h3>Shipping Address</h3>
          <p>{{ order.shipping_address.street }}<br>
          {{ order.shipping_address.city }}, {{ order.shipping_address.state }} {{ order.shipping_address.postal_code }}<br>
          {{ order.shipping_address.country }}</p>
        </mat-card>

        <mat-card class="section-card" *ngIf="order.tracking_number">
          <h3>Tracking</h3>
          <p><strong>{{ order.shipping_carrier }}</strong>: {{ order.tracking_number }}</p>
        </mat-card>

        <div class="actions" *ngIf="order.status === 'pending' || order.status === 'confirmed'">
          <button mat-stroked-button color="warn" (click)="cancelOrder()">
            <mat-icon>cancel</mat-icon> Cancel Order
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .back-link { margin-bottom: 16px; }
    h1 { font-size: 24px; font-weight: 700; margin: 0; }
    .date { color: #888; margin: 4px 0 0; }
    .order-header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .section-card { margin-bottom: 16px; padding: 24px; }
    .section-card h3 { font-size: 18px; font-weight: 600; margin: 0 0 16px; }
    .item-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
    .item-row:last-of-type { border-bottom: none; }
    .item-info { display: flex; flex-direction: column; gap: 4px; }
    .item-variant { color: #888; font-size: 13px; }
    .item-qty { color: #666; font-size: 13px; }
    .item-price { font-weight: 600; font-size: 16px; }
    .totals { margin-top: 16px; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; }
    .total-final { font-weight: 700; font-size: 18px; color: #1976d2; border-top: 2px solid #e0e0e0; padding-top: 12px; margin-top: 8px; }
    .actions { margin-top: 24px; }
    .status-pending { background: #fff3e0 !important; color: #e65100 !important; }
    .status-confirmed, .status-processing { background: #e3f2fd !important; color: #1565c0 !important; }
    .status-shipped { background: #e8f5e9 !important; color: #2e7d32 !important; }
    .status-delivered { background: #e8f5e9 !important; color: #1b5e20 !important; }
    .status-cancelled { background: #ffebee !important; color: #c62828 !important; }
  `],
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = true;

  constructor(private route: ActivatedRoute, private orderService: OrderService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.orderService.getOrderById(id).subscribe({
      next: (o) => { this.order = o; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  cancelOrder(): void {
    if (!this.order || !confirm('Are you sure you want to cancel this order?')) return;
    this.orderService.cancelOrder(this.order.id, 'Customer requested cancellation').subscribe({
      next: (o) => { this.order = o; },
    });
  }
}
