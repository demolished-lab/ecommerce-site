import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <mat-icon class="auth-logo">vpn_key</mat-icon>
          <h1>Reset Password</h1>
          <p>Enter your new password below</p>
        </div>
        <mat-progress-bar mode="indeterminate" *ngIf="isLoading" class="auth-loader"></mat-progress-bar>
        <form *ngIf="!resetDone" [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>New Password</mat-label>
            <input matInput formControlName="password" [type]="hide ? 'password' : 'text'" />
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix (click)="hide = !hide" type="button"><mat-icon>{{ hide ? 'visibility_off' : 'visibility' }}</mat-icon></button>
            <mat-error *ngIf="form.get('password')?.hasError('required')">Password is required</mat-error>
            <mat-error *ngIf="form.get('password')?.hasError('minlength')">Minimum 8 characters</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Confirm Password</mat-label>
            <input matInput formControlName="confirmPassword" [type]="hide ? 'password' : 'text'" />
            <mat-icon matPrefix>lock_outline</mat-icon>
            <mat-error *ngIf="form.get('confirmPassword')?.hasError('passwordMismatch')">Passwords don't match</mat-error>
          </mat-form-field>
          <div class="error-message" *ngIf="errorMessage"><mat-icon>error</mat-icon> {{ errorMessage }}</div>
          <button mat-flat-button color="primary" type="submit" class="submit-btn" [disabled]="form.invalid || isLoading">
            {{ isLoading ? 'Resetting...' : 'Reset Password' }}
          </button>
        </form>
        <div *ngIf="resetDone" class="success-state">
          <mat-icon class="success-icon">check_circle</mat-icon>
          <h3>Password Reset!</h3>
          <p>Your password has been successfully changed.</p>
          <a mat-flat-button color="primary" routerLink="/login">Sign In</a>
        </div>
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
    .auth-loader { position: absolute; top: 0; left: 0; right: 0; }
  `],
})
export class ResetPasswordComponent implements OnInit {
  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });
  token = '';
  hide = true;
  isLoading = false;
  resetDone = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private route: ActivatedRoute, private router: Router) {
    this.form.get('password')?.valueChanges.subscribe(() => this.form.get('confirmPassword')?.updateValueAndValidity());
    this.form.get('confirmPassword')?.addValidators((control: AbstractControl): ValidationErrors | null => {
      return control.value !== this.form.get('password')?.value ? { passwordMismatch: true } : null;
    });
  }

  ngOnInit(): void { this.token = this.route.snapshot.paramMap.get('token') || ''; }

  onSubmit(): void {
    if (this.form.invalid || !this.token) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.authService.resetPassword(this.token, this.form.value.password!).subscribe({
      next: () => { this.isLoading = false; this.resetDone = true; },
      error: (err) => { this.isLoading = false; this.errorMessage = err?.error?.message || 'Reset failed. The link may have expired.'; },
    });
  }
}
