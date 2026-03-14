import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatCheckboxModule, MatCardModule],
  template: `
    <div class="page" style="padding: 80px 24px 24px; max-width: 800px; margin: auto;">
      <h1>{{ isEdit ? 'Edit Product' : 'Add New Product' }}</h1>
      <mat-card class="form-card">
        <form [formGroup]="productForm" (ngSubmit)="save()">
          <mat-form-field appearance="outline" class="full-width"><mat-label>Product Title</mat-label><input matInput formControlName="title" /></mat-form-field>
          <mat-form-field appearance="outline" class="full-width"><mat-label>Description</mat-label><textarea matInput formControlName="description" rows="4"></textarea></mat-form-field>
          <mat-form-field appearance="outline" class="full-width"><mat-label>Short Description</mat-label><input matInput formControlName="short_description" /></mat-form-field>
          <div class="form-row">
            <mat-form-field appearance="outline"><mat-label>Price</mat-label><input matInput formControlName="price" type="number" /><span matPrefix>$&nbsp;</span></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Compare Price</mat-label><input matInput formControlName="compare_at_price" type="number" /><span matPrefix>$&nbsp;</span></mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline"><mat-label>SKU</mat-label><input matInput formControlName="sku" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Stock Quantity</mat-label><input matInput formControlName="stock_quantity" type="number" /></mat-form-field>
          </div>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Condition</mat-label>
              <mat-select formControlName="condition">
                <mat-option value="new">New</mat-option>
                <mat-option value="used">Used</mat-option>
                <mat-option value="refurbished">Refurbished</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Weight (kg)</mat-label><input matInput formControlName="weight" type="number" /></mat-form-field>
          </div>
          <mat-checkbox formControlName="is_digital" color="primary" style="margin-bottom: 16px;">Digital Product</mat-checkbox>
          <mat-checkbox formControlName="requires_shipping" color="primary" style="margin-bottom: 16px; margin-left: 16px;">Requires Shipping</mat-checkbox>

          <div class="upload-area">
            <mat-icon>cloud_upload</mat-icon>
            <p>Drag & drop images here or click to browse</p>
            <input type="file" multiple accept="image/*" style="display:none" />
          </div>

          <div class="form-actions">
            <button mat-button type="button" (click)="cancel()">Cancel</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="productForm.invalid || saving">
              {{ saving ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product') }}
            </button>
          </div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    h1 { font-size: 28px; font-weight: 700; margin: 0 0 24px; }
    .form-card { padding: 32px; }
    .full-width { width: 100%; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .upload-area { border: 2px dashed #ccc; border-radius: 12px; padding: 40px; text-align: center; margin: 16px 0 24px; cursor: pointer; transition: border-color .2s; }
    .upload-area:hover { border-color: #667eea; }
    .upload-area mat-icon { font-size: 48px; width: 48px; height: 48px; color: #ccc; }
    .upload-area p { color: #888; margin: 8px 0 0; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; }
  `],
})
export class ProductFormComponent implements OnInit {
  isEdit = false;
  saving = false;
  productForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    short_description: [''],
    price: [0, [Validators.required, Validators.min(0.01)]],
    compare_at_price: [null as number | null],
    sku: [''],
    stock_quantity: [0, [Validators.required, Validators.min(0)]],
    condition: ['new'],
    weight: [null as number | null],
    is_digital: [false],
    requires_shipping: [true],
  });

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.isEdit = true;
  }

  save(): void {
    this.saving = true;
    setTimeout(() => { this.saving = false; this.router.navigate(['/seller/products']); }, 800);
  }

  cancel(): void { this.router.navigate(['/seller/products']); }
}
