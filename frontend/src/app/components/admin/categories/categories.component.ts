import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatProgressBarModule, FormsModule],
  template: `
    <div class="page" style="padding:80px 24px 24px;max-width:800px;margin:auto;">
      <div class="hdr"><h1>Categories</h1><button mat-flat-button color="primary" (click)="showForm=true;editCat=null;formName='';formDesc=''"><mat-icon>add</mat-icon> Add</button></div>
      <mat-progress-bar mode="indeterminate" *ngIf="loading"></mat-progress-bar>
      <mat-card *ngIf="showForm" class="form-card">
        <h3>{{editCat?'Edit':'New'}} Category</h3>
        <mat-form-field appearance="outline" class="fw"><mat-label>Name</mat-label><input matInput [(ngModel)]="formName" /></mat-form-field>
        <mat-form-field appearance="outline" class="fw"><mat-label>Description</mat-label><input matInput [(ngModel)]="formDesc" /></mat-form-field>
        <div class="acts"><button mat-flat-button color="primary" (click)="saveCat()" [disabled]="!formName">Save</button><button mat-button (click)="showForm=false">Cancel</button></div>
      </mat-card>
      <div class="list">
        <mat-card *ngFor="let c of categories" class="cat-card">
          <div class="cat-info"><mat-icon>{{c.icon||'folder'}}</mat-icon><div><strong>{{c.name}}</strong><p>{{c.description||'No description'}}</p></div></div>
          <div class="cat-acts">
            <button mat-icon-button (click)="editCat=c;formName=c.name;formDesc=c.description||'';showForm=true"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button color="warn" (click)="deleteCat(c)"><mat-icon>delete</mat-icon></button>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}
    h1{font-size:28px;font-weight:700;margin:0}
    .form-card{padding:24px;margin-bottom:24px}h3{margin:0 0 16px;font-size:18px;font-weight:600}
    .fw{width:100%}.acts{display:flex;gap:12px;margin-top:8px}
    .list{display:flex;flex-direction:column;gap:8px}
    .cat-card{display:flex;justify-content:space-between;align-items:center;padding:16px}
    .cat-info{display:flex;align-items:center;gap:12px}
    .cat-info mat-icon{color:#667eea;font-size:28px;width:28px;height:28px}
    .cat-info strong{display:block;font-size:15px}
    .cat-info p{margin:2px 0 0;color:#888;font-size:13px}
    .cat-acts{display:flex;gap:4px}
  `],
})
export class AdminCategoriesComponent implements OnInit {
  categories: any[] = [];
  loading = true;
  showForm = false;
  editCat: any = null;
  formName = '';
  formDesc = '';
  constructor(private http: HttpClient) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/admin/categories`).subscribe({
      next: (r) => { this.categories = r.data || []; this.loading = false; },
      error: () => { this.categories = []; this.loading = false; },
    });
  }
  saveCat(): void {
    if (this.editCat) {
      this.http.put(`${environment.apiUrl}/admin/categories/${this.editCat.id}`, { name: this.formName, description: this.formDesc }).subscribe({ next: () => { this.showForm = false; this.load(); } });
    } else {
      this.http.post(`${environment.apiUrl}/admin/categories`, { name: this.formName, description: this.formDesc, slug: this.formName.toLowerCase().replace(/\s+/g, '-') }).subscribe({ next: () => { this.showForm = false; this.load(); } });
    }
  }
  deleteCat(c: any): void {
    if (!confirm('Delete "' + c.name + '"?')) return;
    this.http.delete(`${environment.apiUrl}/admin/categories/${c.id}`).subscribe({ next: () => this.load() });
  }
}
