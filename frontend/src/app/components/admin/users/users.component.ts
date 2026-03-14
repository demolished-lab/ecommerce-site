import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressBarModule, MatFormFieldModule, MatInputModule, FormsModule],
  template: `
    <div class="page" style="padding:80px 24px 24px;max-width:1100px;margin:auto;">
      <h1>User Management</h1>
      <mat-form-field appearance="outline" class="search"><mat-label>Search users</mat-label><input matInput [(ngModel)]="search" (keyup.enter)="load()" /><mat-icon matSuffix>search</mat-icon></mat-form-field>
      <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>
      <div class="table">
        <div class="thead"><span>Name</span><span>Email</span><span>Role</span><span>Status</span><span>Actions</span></div>
        <div class="trow" *ngFor="let u of users">
          <span>{{u.first_name}} {{u.last_name}}</span>
          <span class="email">{{u.email}}</span>
          <mat-chip>{{u.role}}</mat-chip>
          <mat-chip [class]="'s-'+u.status">{{u.status}}</mat-chip>
          <div class="acts">
            <button mat-icon-button (click)="toggleStatus(u)"><mat-icon>{{u.status==='active'?'block':'check_circle'}}</mat-icon></button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    h1{font-size:28px;font-weight:700;margin:0 0 16px}
    .search{width:100%;max-width:400px;margin-bottom:16px}
    .table{border:1px solid #e0e0e0;border-radius:8px;overflow:hidden}
    .thead{display:grid;grid-template-columns:1.5fr 2fr 1fr 1fr 1fr;padding:12px 16px;background:#f5f5f5;font-weight:600;font-size:13px;color:#666;text-transform:uppercase}
    .trow{display:grid;grid-template-columns:1.5fr 2fr 1fr 1fr 1fr;padding:12px 16px;border-top:1px solid #f0f0f0;align-items:center}
    .trow:hover{background:#fafafa}.email{color:#888;font-size:14px}
    .s-active{background:#e8f5e9!important;color:#2e7d32!important}
    .s-suspended{background:#ffebee!important;color:#c62828!important}
  `],
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  loading = true;
  search = '';
  constructor(private http: HttpClient) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/admin/users`, { params: { search: this.search } }).subscribe({
      next: (r) => { this.users = r.data?.users || []; this.loading = false; },
      error: () => { this.users = []; this.loading = false; },
    });
  }
  toggleStatus(u: any): void {
    const newStatus = u.status === 'active' ? 'suspended' : 'active';
    this.http.put(`${environment.apiUrl}/admin/users/${u.id}/status`, { status: newStatus }).subscribe({
      next: () => { u.status = newStatus; },
    });
  }
}
