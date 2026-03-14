import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressBarModule],
  template: `
    <div class="page" style="padding:80px 24px 24px;max-width:1100px;margin:auto;">
      <h1>Order Management</h1>
      <div class="tabs"><button *ngFor="let t of tabs" [class.active]="activeTab===t.v" (click)="activeTab=t.v;load()">{{t.l}}</button></div>
      <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>
      <div class="table">
        <div class="thead"><span>Order #</span><span>Date</span><span>Total</span><span>Status</span></div>
        <div class="trow" *ngFor="let o of orders">
          <span class="num">#{{o.order_number}}</span>
          <span>{{o.created_at|date:'shortDate'}}</span>
          <span class="tot">\${{o.total_amount|number:'1.2-2'}}</span>
          <mat-chip [class]="'s-'+o.status">{{o.status}}</mat-chip>
        </div>
      </div>
      <div class="empty" *ngIf="!loading&&orders.length===0"><mat-icon>inbox</mat-icon><p>No orders found</p></div>
    </div>
  `,
  styles: [`
    h1{font-size:28px;font-weight:700;margin:0 0 16px}
    .tabs{display:flex;gap:4px;margin-bottom:24px;flex-wrap:wrap}.tabs button.active{background:#667eea;color:#fff}
    .table{border:1px solid #e0e0e0;border-radius:8px;overflow:hidden}
    .thead{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;padding:12px 16px;background:#f5f5f5;font-weight:600;font-size:13px;color:#666;text-transform:uppercase}
    .trow{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;padding:12px 16px;border-top:1px solid #f0f0f0;align-items:center}
    .num{font-weight:600}.tot{font-weight:600;color:#1976d2}
    .s-pending{background:#fff3e0!important;color:#e65100!important}
    .s-confirmed,.s-processing{background:#e3f2fd!important;color:#1565c0!important}
    .s-shipped{background:#e8f5e9!important;color:#2e7d32!important}
    .s-delivered{background:#e8f5e9!important;color:#1b5e20!important}
    .s-cancelled{background:#ffebee!important;color:#c62828!important}
    .empty{text-align:center;padding:48px;color:#888}.empty mat-icon{font-size:48px;width:48px;height:48px;color:#ccc}
  `],
})
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];
  loading = true;
  activeTab = '';
  tabs = [{ l: 'All', v: '' },{ l: 'Pending', v: 'pending' },{ l: 'Processing', v: 'processing' },{ l: 'Shipped', v: 'shipped' },{ l: 'Delivered', v: 'delivered' }];
  constructor(private http: HttpClient) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true;
    const p: any = {};
    if (this.activeTab) p.order_status = this.activeTab;
    this.http.get<any>(`${environment.apiUrl}/admin/orders`, { params: p }).subscribe({
      next: (r) => { this.orders = r.data?.orders || []; this.loading = false; },
      error: () => { this.orders = []; this.loading = false; },
    });
  }
}
