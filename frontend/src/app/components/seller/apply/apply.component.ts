import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { SellerService } from '../../../services/seller.service';

@Component({
  selector: 'app-seller-apply',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSelectModule, MatStepperModule, MatCardModule],
  template: `
    <div class="page" style="padding: 80px 24px 24px; max-width: 800px; margin: auto;">
      <h1>Become a Seller</h1>
      <p class="subtitle">Fill out the application below to start selling on our marketplace</p>
      <mat-card class="apply-card">
        <mat-stepper [linear]="true" #stepper>
          <mat-step [stepControl]="businessForm" label="Business Info">
            <form [formGroup]="businessForm" class="step-form">
              <mat-form-field appearance="outline" class="full-width"><mat-label>Store Name</mat-label><input matInput formControlName="store_name" /></mat-form-field>
              <mat-form-field appearance="outline" class="full-width"><mat-label>Store Description</mat-label><textarea matInput formControlName="store_description" rows="3"></textarea></mat-form-field>
              <mat-form-field appearance="outline" class="full-width"><mat-label>Business Name</mat-label><input matInput formControlName="business_name" /></mat-form-field>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Business Type</mat-label>
                <mat-select formControlName="business_type">
                  <mat-option value="Sole Proprietorship">Sole Proprietorship</mat-option>
                  <mat-option value="LLC">LLC</mat-option>
                  <mat-option value="Corporation">Corporation</mat-option>
                  <mat-option value="Partnership">Partnership</mat-option>
                  <mat-option value="Other">Other</mat-option>
                </mat-select>
              </mat-form-field>
              <div class="step-actions"><button mat-flat-button color="primary" matStepperNext [disabled]="businessForm.invalid">Next</button></div>
            </form>
          </mat-step>
          <mat-step [stepControl]="contactForm" label="Contact & Address">
            <form [formGroup]="contactForm" class="step-form">
              <div class="form-row">
                <mat-form-field appearance="outline"><mat-label>Business Email</mat-label><input matInput formControlName="business_email" type="email" /></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Business Phone</mat-label><input matInput formControlName="business_phone" /></mat-form-field>
              </div>
              <mat-form-field appearance="outline" class="full-width"><mat-label>Street Address</mat-label><input matInput formControlName="address_street" /></mat-form-field>
              <div class="form-row">
                <mat-form-field appearance="outline"><mat-label>City</mat-label><input matInput formControlName="address_city" /></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>State</mat-label><input matInput formControlName="address_state" /></mat-form-field>
              </div>
              <div class="form-row">
                <mat-form-field appearance="outline"><mat-label>Postal Code</mat-label><input matInput formControlName="address_postal" /></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Country</mat-label><input matInput formControlName="address_country" /></mat-form-field>
              </div>
              <div class="step-actions">
                <button mat-button matStepperPrevious>Back</button>
                <button mat-flat-button color="primary" matStepperNext [disabled]="contactForm.invalid">Next</button>
              </div>
            </form>
          </mat-step>
          <mat-step label="Review & Submit">
            <div class="review-section">
              <h3>Review Your Application</h3>
              <p><strong>Store:</strong> {{ businessForm.value.store_name }}</p>
              <p><strong>Business:</strong> {{ businessForm.value.business_name }} ({{ businessForm.value.business_type }})</p>
              <p><strong>Contact:</strong> {{ contactForm.value.business_email }}, {{ contactForm.value.business_phone }}</p>
              <p><strong>Address:</strong> {{ contactForm.value.address_street }}, {{ contactForm.value.address_city }}, {{ contactForm.value.address_state }}</p>
              <div class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</div>
              <div class="step-actions">
                <button mat-button matStepperPrevious>Back</button>
                <button mat-flat-button color="primary" (click)="submit()" [disabled]="submitting">
                  {{ submitting ? 'Submitting...' : 'Submit Application' }}
                </button>
              </div>
            </div>
          </mat-step>
        </mat-stepper>
      </mat-card>
    </div>
  `,
  styles: [`
    h1 { font-size: 28px; font-weight: 700; margin: 0 0 8px; }
    .subtitle { color: #666; margin: 0 0 24px; }
    .apply-card { padding: 32px; }
    .step-form { display: flex; flex-direction: column; gap: 4px; margin-top: 16px; }
    .full-width { width: 100%; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .step-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }
    .review-section { padding: 16px 0; }
    .review-section p { margin: 8px 0; color: #444; }
    .error-msg { color: #d32f2f; margin-top: 12px; }
  `],
})
export class SellerApplyComponent {
  businessForm = this.fb.group({
    store_name: ['', [Validators.required, Validators.minLength(3)]],
    store_description: [''],
    business_name: ['', Validators.required],
    business_type: ['', Validators.required],
  });
  contactForm = this.fb.group({
    business_email: ['', [Validators.required, Validators.email]],
    business_phone: ['', Validators.required],
    address_street: ['', Validators.required],
    address_city: ['', Validators.required],
    address_state: ['', Validators.required],
    address_postal: ['', Validators.required],
    address_country: ['USA', Validators.required],
  });
  submitting = false;
  errorMsg = '';

  constructor(private fb: FormBuilder, private sellerService: SellerService, private router: Router) {}

  submit(): void {
    this.submitting = true;
    this.errorMsg = '';
    const data = { ...this.businessForm.value, ...this.contactForm.value } as any;
    this.sellerService.applyAsSeller(data).subscribe({
      next: () => { this.submitting = false; this.router.navigate(['/seller/dashboard']); },
      error: (err) => { this.submitting = false; this.errorMsg = err?.error?.message || 'Application failed'; },
    });
  }
}
