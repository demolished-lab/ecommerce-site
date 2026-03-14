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
  selector: 'app-admin-sellers',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressBarModule],
  template: `
    <div class="page" style="padding:80px 24px 24px;max-width:1100px;margin:auto;">
      <h1>Seller Management</h1>
      <div class="tabs"><button *ngFor="let t of tabs" [class.active]="activeTab===t.v" (click)="activeTab=t.v;load()">{{t.l}}</button></div>
      <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>
      <div class="table">
        <div class="thead"><span>Store</span><span>Business</span><span>Status</span><span>Revenue</span><span>Actions</span></div>
        <div class="trow" *ngFor="let s of sellers">
          <span class="store">{{s.store_name}}</span>
          <span class="biz">{{s.business_name}}</span>
          <mat-chip [class]="'s-'+s.status">{{s.status}}</mat-chip>
          <span>\${{s.total_revenue|number:'1.0-0'}}</span>
          <div class="acts">
            <button mat-button color="primary" *ngIf="s.status==='pending'" (click)="review(s,'approve')">Approve</button>
            <button mat-button color="warn" *ngIf="s.status==='pending'" (click)="review(s,'reject')">Reject</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    h1{font-size:28px;font-weight:700;margin:0 0 16px}
    .tabs{display:flex;gap:4px;margin-bottom:24px}.tabs button.active{background:#667eea;color:#fff}
    .table{border:1px solid #e0e0e0;border-radius:8px;overflow:hidden}
    .thead{display:grid;grid-template-columns:2fr 1.5fr 1fr 1fr 1.5fr;padding:12px 16px;background:#f5f5f5;font-weight:600;font-size:13px;color:#666;text-transform:uppercase}
    .trow{display:grid;grid-template-columns:2fr 1.5fr 1fr 1fr 1.5fr;padding:12px 16px;border-top:1px solid #f0f0f0;align-items:center}
    .store{font-weight:600}.biz{color:#888;font-size:14px}
    .s-pending{background:#fff3e0!important;color:#e65100!important}
    .s-active{background:#e8f5e9!important;color:#2e7d32!important}
    .s-rejected{background:#ffebee!important;color:#c62828!important}
  `],
})
export class AdminSellersComponent implements OnInit {
  sellers: any[] = [];
  loading = true;
  activeTab = '';
  tabs = [{ l: 'All', v: '' }, { l: 'Pending', v: 'pending' }, { l: 'Active', v: 'active' }, { l: 'Rejected', v: 'rejected' }];
  constructor(private http: HttpClient) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true;
    const p: any = {};
    if (this.activeTab) p.seller_status = this.activeTab;
    this.http.get<any>(`${environment.apiUrl}/admin/sellers`, { params: p }).subscribe({
      next: (r) => { this.sellers = r.data?.sellers || []; this.loading = false; },
      error: () => { this.sellers = []; this.loading = false; },
    });
  }
  review(s: any, action: string): void {
    this.http.post(`${environment.apiUrl}/admin/sellers/${s.id}/review`, { action }).subscribe({ next: () => this.load() });
  }
}
