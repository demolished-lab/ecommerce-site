import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { SellerService } from '../../../services/seller.service';

@Component({
  selector: 'app-seller-analytics',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatSelectModule, FormsModule],
  template: `
    <div class="page" style="padding: 80px 24px 24px; max-width: 1100px; margin: auto;">
      <div class="page-header">
        <h1>Sales Analytics</h1>
        <mat-select [(ngModel)]="period" (selectionChange)="loadReport()" class="period-select">
          <mat-option value="week">This Week</mat-option>
          <mat-option value="month">This Month</mat-option>
          <mat-option value="year">This Year</mat-option>
        </mat-select>
      </div>
      <div class="stats-grid">
        <mat-card class="stat-card"><div class="stat-value">\${{ report?.total_sales || 0 | number:'1.0-0' }}</div><div class="stat-label">Total Sales</div></mat-card>
        <mat-card class="stat-card"><div class="stat-value">{{ report?.total_orders || 0 }}</div><div class="stat-label">Orders</div></mat-card>
        <mat-card class="stat-card"><div class="stat-value">{{ report?.total_items || 0 }}</div><div class="stat-label">Items Sold</div></mat-card>
        <mat-card class="stat-card"><div class="stat-value">\${{ report?.average_order_value || 0 | number:'1.2-2' }}</div><div class="stat-label">Avg Order Value</div></mat-card>
      </div>
      <div class="detail-cards">
        <mat-card class="detail-card">
          <h3>Revenue Breakdown</h3>
          <div class="breakdown-row"><span>Gross Sales</span><span>\${{ report?.total_sales || 0 | number:'1.2-2' }}</span></div>
          <div class="breakdown-row"><span>Commission</span><span class="negative">-\${{ report?.commission_paid || 0 | number:'1.2-2' }}</span></div>
          <div class="breakdown-row total"><span>Net Revenue</span><span>\${{ report?.net_revenue || 0 | number:'1.2-2' }}</span></div>
        </mat-card>
        <mat-card class="detail-card">
          <h3>Performance Summary</h3>
          <p class="info-text">Select different time periods to see how your store is performing over time.</p>
          <div class="chart-placeholder"><mat-icon>bar_chart</mat-icon><span>Chart visualization coming soon</span></div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { font-size: 28px; font-weight: 700; margin: 0; }
    .period-select { width: 160px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { padding: 24px; text-align: center; }
    .stat-value { font-size: 32px; font-weight: 700; color: #1976d2; }
    .stat-label { font-size: 13px; color: #888; margin-top: 4px; }
    .detail-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .detail-card { padding: 24px; }
    .detail-card h3 { font-size: 18px; font-weight: 600; margin: 0 0 16px; }
    .breakdown-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
    .breakdown-row.total { border-bottom: none; font-weight: 700; font-size: 18px; color: #1976d2; border-top: 2px solid #e0e0e0; margin-top: 8px; padding-top: 16px; }
    .negative { color: #d32f2f; }
    .info-text { color: #888; margin: 0 0 16px; }
    .chart-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 40px; color: #ccc; }
    .chart-placeholder mat-icon { font-size: 48px; width: 48px; height: 48px; }
    @media (max-width: 768px) { .detail-cards { grid-template-columns: 1fr; } }
  `],
})
export class SellerAnalyticsComponent implements OnInit {
  period = 'month';
  report: any = null;

  constructor(private sellerService: SellerService) {}

  ngOnInit(): void { this.loadReport(); }

  loadReport(): void {
    this.sellerService.getSalesReport(this.period as any).subscribe({
      next: (r) => { this.report = r; },
      error: () => { this.report = { total_sales: 0, total_orders: 0, total_items: 0, average_order_value: 0, commission_paid: 0, net_revenue: 0 }; },
    });
  }
}
