import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <mat-icon class="auth-logo">lock_reset</mat-icon>
          <h1>Forgot Password?</h1>
          <p>Enter your email and we'll send you a reset link</p>
        </div>
        <mat-progress-bar mode="indeterminate" *ngIf="isLoading" class="auth-loader"></mat-progress-bar>
        <form *ngIf="!emailSent" [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email Address</mat-label>
            <input matInput formControlName="email" type="email" />
            <mat-icon matPrefix>email</mat-icon>
            <mat-error *ngIf="form.get('email')?.hasError('required')">Email is required</mat-error>
            <mat-error *ngIf="form.get('email')?.hasError('email')">Enter a valid email</mat-error>
          </mat-form-field>
          <div class="error-message" *ngIf="errorMessage"><mat-icon>error</mat-icon> {{ errorMessage }}</div>
          <button mat-flat-button color="primary" type="submit" class="submit-btn" [disabled]="form.invalid || isLoading">
            {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
          </button>
        </form>
        <div *ngIf="emailSent" class="success-state">
          <mat-icon class="success-icon">mark_email_read</mat-icon>
          <h3>Check Your Email</h3>
          <p>We've sent a password reset link to <strong>{{ form.value.email }}</strong></p>
          <button mat-stroked-button color="primary" (click)="emailSent = false">Try another email</button>
        </div>
        <div class="auth-footer"><p><a routerLink="/login">← Back to Sign In</a></p></div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 64px); padding: 80px 24px 24px; background: linear-gradient(135deg, #667eea22 0%, #764ba222 100%); }
    .auth-card { background: white; border-radius: 16px; padding: 48px 40px; max-width: 440px; width: 100%; box-shadow: 0 8px 32px rgba(0,0,0,.08); }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .auth-logo { font-size: 48px; width: 48px; height: 48px; color: #667eea; margin-bottom: 16px; }
    .auth-header h1 { font-size: 28px; font-weight: 700; margin: 0 0 8px; color: #1a1a2e; }
    .auth-header p { color: #666; margin: 0; }
    .auth-form { display: flex; flex-direction: column; gap: 4px; }
    .full-width { width: 100%; }
    .error-message { display: flex; align-items: center; gap: 8px; color: #d32f2f; font-size: 14px; background: #ffebee; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; }
    .submit-btn { height: 48px; font-size: 16px; border-radius: 8px; }
    .success-state { text-align: center; padding: 24px 0; }
    .success-icon { font-size: 64px; width: 64px; height: 64px; color: #4caf50; margin-bottom: 16px; }
    .success-state h3 { font-size: 22px; margin: 0 0 8px; }
    .success-state p { color: #666; margin: 0 0 24px; }
    .auth-footer { text-align: center; margin-top: 24px; }
    .auth-footer a { color: #667eea; font-weight: 600; text-decoration: none; }
    .auth-loader { position: absolute; top: 0; left: 0; right: 0; }
  `],
})
export class ForgotPasswordComponent {
  form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  isLoading = false;
  emailSent = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.authService.forgotPassword(this.form.value.email!).subscribe({
      next: () => { this.isLoading = false; this.emailSent = true; },
      error: () => { this.isLoading = false; this.emailSent = true; }, // Always show success to prevent email enumeration
    });
  }
}
