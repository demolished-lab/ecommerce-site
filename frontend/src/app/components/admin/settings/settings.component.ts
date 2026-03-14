import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatProgressBarModule, MatDividerModule, FormsModule],
  template: `
    <div class="page" style="padding:80px 24px 24px;max-width:800px;margin:auto;">
      <h1>Platform Settings</h1>
      <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>
      <mat-card *ngFor="let group of settingGroups" class="group-card">
        <h3>{{ group.category | titlecase }}</h3>
        <div class="setting-row" *ngFor="let s of group.items">
          <div class="setting-info">
            <strong>{{ s.key }}</strong>
            <p>{{ s.description || '' }}</p>
          </div>
          <div class="setting-value" *ngIf="s.is_editable">
            <mat-form-field appearance="outline" class="val-field">
              <input matInput [(ngModel)]="s.value" />
            </mat-form-field>
            <button mat-icon-button color="primary" (click)="saveSetting(s)"><mat-icon>save</mat-icon></button>
          </div>
          <span *ngIf="!s.is_editable" class="locked"><mat-icon>lock</mat-icon> {{ s.value }}</span>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    h1{font-size:28px;font-weight:700;margin:0 0 24px}
    .group-card{padding:24px;margin-bottom:16px}
    h3{font-size:18px;font-weight:600;margin:0 0 16px;color:#667eea}
    .setting-row{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #f0f0f0}
    .setting-row:last-child{border-bottom:none}
    .setting-info strong{font-size:14px;display:block}
    .setting-info p{font-size:12px;color:#888;margin:2px 0 0}
    .setting-value{display:flex;align-items:center;gap:4px}
    .val-field{width:200px}
    .locked{display:flex;align-items:center;gap:4px;color:#999;font-size:14px}
    .locked mat-icon{font-size:16px;width:16px;height:16px}
  `],
})
export class AdminSettingsComponent implements OnInit {
  settings: any[] = [];
  settingGroups: { category: string; items: any[] }[] = [];
  loading = true;
  constructor(private http: HttpClient) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/admin/settings`).subscribe({
      next: (r) => {
        this.settings = r.data || [];
        const map = new Map<string, any[]>();
        this.settings.forEach(s => {
          const c = s.category || 'general';
          if (!map.has(c)) map.set(c, []);
          map.get(c)!.push(s);
        });
        this.settingGroups = Array.from(map.entries()).map(([category, items]) => ({ category, items }));
        this.loading = false;
      },
      error: () => { this.settingGroups = []; this.loading = false; },
    });
  }
  saveSetting(s: any): void {
    this.http.put(`${environment.apiUrl}/admin/settings/${s.id}`, { value: s.value }).subscribe();
  }
}
