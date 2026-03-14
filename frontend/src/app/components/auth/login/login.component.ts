import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressBarModule,
  ],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <mat-icon class="auth-logo">storefront</mat-icon>
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        <mat-progress-bar mode="indeterminate" *ngIf="isLoading" class="auth-loader"></mat-progress-bar>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email Address</mat-label>
            <input matInput formControlName="email" type="email" autocomplete="email" />
            <mat-icon matPrefix>email</mat-icon>
            <mat-error *ngIf="loginForm.get('email')?.hasError('required')">Email is required</mat-error>
            <mat-error *ngIf="loginForm.get('email')?.hasError('email')">Please enter a valid email</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'" autocomplete="current-password" />
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="loginForm.get('password')?.hasError('required')">Password is required</mat-error>
          </mat-form-field>

          <div class="form-options">
            <mat-checkbox formControlName="remember_me" color="primary">Remember me</mat-checkbox>
            <a routerLink="/forgot-password" class="forgot-link">Forgot password?</a>
          </div>

          <div class="error-message" *ngIf="errorMessage">
            <mat-icon>error</mat-icon>
            {{ errorMessage }}
          </div>

          <button mat-flat-button color="primary" type="submit" class="submit-btn"
            [disabled]="loginForm.invalid || isLoading">
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/register">Create one</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 64px);
      padding: 80px 24px 24px; background: linear-gradient(135deg, #667eea22 0%, #764ba222 100%); }
    .auth-card { background: white; border-radius: 16px; padding: 48px 40px; max-width: 440px; width: 100%;
      box-shadow: 0 8px 32px rgba(0,0,0,.08); }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .auth-logo { font-size: 48px; width: 48px; height: 48px; color: #667eea; margin-bottom: 16px; }
    .auth-header h1 { font-size: 28px; font-weight: 700; margin: 0 0 8px; color: #1a1a2e; }
    .auth-header p { color: #666; margin: 0; }
    .auth-form { display: flex; flex-direction: column; gap: 4px; }
    .full-width { width: 100%; }
    .form-options { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .forgot-link { color: #667eea; text-decoration: none; font-size: 14px; }
    .forgot-link:hover { text-decoration: underline; }
    .error-message { display: flex; align-items: center; gap: 8px; color: #d32f2f; font-size: 14px;
      background: #ffebee; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; }
    .submit-btn { height: 48px; font-size: 16px; border-radius: 8px; }
    .auth-footer { text-align: center; margin-top: 24px; color: #666; }
    .auth-footer a { color: #667eea; font-weight: 600; text-decoration: none; }
    .auth-loader { position: absolute; top: 0; left: 0; right: 0; border-radius: 16px 16px 0 0; }
    @media (max-width: 480px) { .auth-card { padding: 32px 24px; } }
  `],
})
export class LoginComponent {
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    remember_me: [false],
  });
  hidePassword = true;
  isLoading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';
    const { email, password } = this.loginForm.value;
    this.authService.login({ email: email!, password: password! }).subscribe({
      next: () => { this.isLoading = false; this.router.navigate(['/']); },
      error: (err) => { this.isLoading = false; this.errorMessage = err?.error?.message || 'Invalid email or password'; },
    });
  }
}
