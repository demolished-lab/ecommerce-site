import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="page" style="padding:80px 24px 24px;max-width:1100px;margin:auto;">
      <h1>Admin Dashboard</h1>
      <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>
      <div class="stats" *ngIf="data">
        <mat-card class="s users" routerLink="/admin/users"><mat-icon>people</mat-icon><div class="v">{{data.total_users}}</div><div class="l">Users</div></mat-card>
        <mat-card class="s sellers" routerLink="/admin/sellers"><mat-icon>storefront</mat-icon><div class="v">{{data.total_sellers}}</div><div class="l">Sellers</div></mat-card>
        <mat-card class="s products" routerLink="/admin/products"><mat-icon>inventory_2</mat-icon><div class="v">{{data.total_products}}</div><div class="l">Products</div></mat-card>
        <mat-card class="s orders" routerLink="/admin/orders"><mat-icon>shopping_bag</mat-icon><div class="v">{{data.total_orders}}</div><div class="l">Orders</div></mat-card>
        <mat-card class="s revenue"><mat-icon>attach_money</mat-icon><div class="v">\${{data.total_revenue|number:'1.0-0'}}</div><div class="l">Revenue</div></mat-card>
        <mat-card class="s pending" routerLink="/admin/sellers"><mat-icon>pending_actions</mat-icon><div class="v">{{data.pending_sellers}}</div><div class="l">Pending Sellers</div></mat-card>
      </div>
      <div class="links">
        <mat-card class="lnk" routerLink="/admin/categories"><mat-icon>category</mat-icon><span>Categories</span></mat-card>
        <mat-card class="lnk" routerLink="/admin/settings"><mat-icon>settings</mat-icon><span>Settings</span></mat-card>
      </div>
    </div>
  `,
  styles: [`
    h1{font-size:28px;font-weight:700;margin:0 0 24px}
    .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:32px}
    .s{padding:24px;text-align:center;cursor:pointer;transition:transform .2s;border-radius:12px}
    .s:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(0,0,0,.08)}
    .s mat-icon{font-size:32px;width:32px;height:32px;opacity:.8;margin-bottom:8px}
    .v{font-size:28px;font-weight:700}.l{font-size:13px;color:#888;margin-top:4px}
    .users{border-left:4px solid #2196f3}.users mat-icon{color:#2196f3}
    .sellers{border-left:4px solid #9c27b0}.sellers mat-icon{color:#9c27b0}
    .products{border-left:4px solid #ff9800}.products mat-icon{color:#ff9800}
    .orders{border-left:4px solid #4caf50}.orders mat-icon{color:#4caf50}
    .revenue{border-left:4px solid #f44336}.revenue mat-icon{color:#f44336}
    .pending{border-left:4px solid #ff5722}.pending mat-icon{color:#ff5722}
    .links{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
    .lnk{display:flex;align-items:center;gap:12px;padding:20px;cursor:pointer;transition:transform .2s}
    .lnk:hover{transform:translateY(-2px)}.lnk mat-icon{color:#667eea}
    .lnk span{font-weight:500}
  `],
})
export class AdminDashboardComponent implements OnInit {
  data: any = null;
  loading = true;
  constructor(private http: HttpClient) {}
  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/admin/dashboard`).subscribe({
      next: (r) => { this.data = r.data; this.loading = false; },
      error: () => { this.data = { total_users: 0, total_sellers: 0, total_products: 0, total_orders: 0, total_revenue: 0, pending_sellers: 0 }; this.loading = false; },
    });
  }
}
