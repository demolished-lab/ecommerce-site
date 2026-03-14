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
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressBarModule],
  template: `
    <div class="page" style="padding:80px 24px 24px;max-width:1100px;margin:auto;">
      <h1>Product Moderation</h1>
      <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>
      <div class="table">
        <div class="thead"><span>Title</span><span>Price</span><span>Stock</span><span>Status</span><span>Actions</span></div>
        <div class="trow" *ngFor="let p of products">
          <span class="title">{{p.title}}</span>
          <span>\${{p.price|number:'1.2-2'}}</span>
          <span>{{p.stock_quantity}}</span>
          <mat-chip [class]="'s-'+p.status">{{p.status}}</mat-chip>
          <div class="acts">
            <button mat-icon-button (click)="toggle(p,'is_featured')"><mat-icon [class.featured]="p.is_featured">star</mat-icon></button>
            <button mat-icon-button color="warn" *ngIf="p.status==='active'" (click)="updateStatus(p,'suspended')"><mat-icon>block</mat-icon></button>
            <button mat-icon-button color="primary" *ngIf="p.status!=='active'" (click)="updateStatus(p,'active')"><mat-icon>check_circle</mat-icon></button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    h1{font-size:28px;font-weight:700;margin:0 0 24px}
    .table{border:1px solid #e0e0e0;border-radius:8px;overflow:hidden}
    .thead{display:grid;grid-template-columns:2.5fr 1fr 1fr 1fr 1fr;padding:12px 16px;background:#f5f5f5;font-weight:600;font-size:13px;color:#666;text-transform:uppercase}
    .trow{display:grid;grid-template-columns:2.5fr 1fr 1fr 1fr 1fr;padding:12px 16px;border-top:1px solid #f0f0f0;align-items:center}
    .title{font-weight:500}.featured{color:#ffc107!important}
    .s-active{background:#e8f5e9!important;color:#2e7d32!important}
    .s-suspended{background:#ffebee!important;color:#c62828!important}
    .s-draft{background:#f5f5f5!important;color:#757575!important}
  `],
})
export class AdminProductsComponent implements OnInit {
  products: any[] = [];
  loading = true;
  constructor(private http: HttpClient) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/admin/products`).subscribe({
      next: (r) => { this.products = r.data?.products || []; this.loading = false; },
      error: () => { this.products = []; this.loading = false; },
    });
  }
  updateStatus(p: any, status: string): void {
    this.http.put(`${environment.apiUrl}/admin/products/${p.id}/status`, { status }).subscribe({ next: () => { p.status = status; } });
  }
  toggle(p: any, field: string): void {
    p[field] = !p[field];
    this.http.put(`${environment.apiUrl}/admin/products/${p.id}/status`, { [field]: p[field] }).subscribe();
  }
}
