import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { SellerService } from '../../../services/seller.service';

@Component({
  selector: 'app-seller-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCardModule, MatDividerModule],
  template: `
    <div class="page" style="padding: 80px 24px 24px; max-width: 800px; margin: auto;">
      <h1>Store Settings</h1>
      <mat-card class="settings-card">
        <h3>Store Information</h3>
        <form [formGroup]="storeForm" (ngSubmit)="save()">
          <mat-form-field appearance="outline" class="full-width"><mat-label>Store Description</mat-label><textarea matInput formControlName="store_description" rows="3"></textarea></mat-form-field>
          <mat-form-field appearance="outline" class="full-width"><mat-label>Store Logo URL</mat-label><input matInput formControlName="store_logo" /></mat-form-field>
          <mat-form-field appearance="outline" class="full-width"><mat-label>Store Banner URL</mat-label><input matInput formControlName="store_banner" /></mat-form-field>
          <mat-divider style="margin: 16px 0;"></mat-divider>
          <h3>Contact</h3>
          <div class="form-row">
            <mat-form-field appearance="outline"><mat-label>Business Email</mat-label><input matInput formControlName="business_email" type="email" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Business Phone</mat-label><input matInput formControlName="business_phone" /></mat-form-field>
          </div>
          <mat-form-field appearance="outline" class="full-width"><mat-label>Support Email</mat-label><input matInput formControlName="support_email" type="email" /></mat-form-field>
          <mat-divider style="margin: 16px 0;"></mat-divider>
          <h3>Policies</h3>
          <mat-form-field appearance="outline" class="full-width"><mat-label>Return Policy</mat-label><textarea matInput formControlName="return_policy" rows="3"></textarea></mat-form-field>
          <mat-form-field appearance="outline" class="full-width"><mat-label>Shipping Policy</mat-label><textarea matInput formControlName="shipping_policy" rows="3"></textarea></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Processing Time (days)</mat-label><input matInput formControlName="processing_time_days" type="number" /></mat-form-field>
          <div class="form-actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="storeForm.invalid || saving">
              {{ saving ? 'Saving...' : 'Save Settings' }}
            </button>
          </div>
          <div class="success-msg" *ngIf="successMsg">{{ successMsg }}</div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    h1 { font-size: 28px; font-weight: 700; margin: 0 0 24px; }
    .settings-card { padding: 32px; }
    h3 { font-size: 18px; font-weight: 600; margin: 0 0 16px; }
    .full-width { width: 100%; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-actions { margin-top: 16px; }
    .success-msg { color: #2e7d32; margin-top: 12px; font-weight: 500; }
  `],
})
export class SellerSettingsComponent implements OnInit {
  storeForm = this.fb.group({
    store_description: [''], store_logo: [''], store_banner: [''],
    business_email: ['', Validators.email], business_phone: [''],
    support_email: ['', Validators.email],
    return_policy: [''], shipping_policy: [''], processing_time_days: [1],
  });
  saving = false;
  successMsg = '';

  constructor(private fb: FormBuilder, private sellerService: SellerService) {}

  ngOnInit(): void {
    this.sellerService.getMySellerProfile().subscribe({
      next: (s: any) => {
        this.storeForm.patchValue({
          store_description: s.store_description, store_logo: s.store_logo, store_banner: s.store_banner,
          business_email: s.business_email, business_phone: s.business_phone,
          return_policy: s.return_policy, shipping_policy: s.shipping_policy,
          processing_time_days: s.processing_time_days,
        });
      },
    });
  }

  save(): void {
    this.saving = true; this.successMsg = '';
    this.sellerService.updateSellerProfile('me', this.storeForm.value as any).subscribe({
      next: () => { this.saving = false; this.successMsg = 'Settings saved!'; },
      error: () => { this.saving = false; },
    });
  }
}
