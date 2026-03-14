import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressBarModule,
  ],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <mat-icon class="auth-logo">person_add</mat-icon>
          <h1>Create Account</h1>
          <p>Join the marketplace and start shopping today</p>
        </div>

        <mat-progress-bar mode="indeterminate" *ngIf="isLoading" class="auth-loader"></mat-progress-bar>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="name-row">
            <mat-form-field appearance="outline">
              <mat-label>First Name</mat-label>
              <input matInput formControlName="first_name" />
              <mat-error *ngIf="registerForm.get('first_name')?.hasError('required')">Required</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Last Name</mat-label>
              <input matInput formControlName="last_name" />
              <mat-error *ngIf="registerForm.get('last_name')?.hasError('required')">Required</mat-error>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email Address</mat-label>
            <input matInput formControlName="email" type="email" autocomplete="email" />
            <mat-icon matPrefix>email</mat-icon>
            <mat-error *ngIf="registerForm.get('email')?.hasError('required')">Email is required</mat-error>
            <mat-error *ngIf="registerForm.get('email')?.hasError('email')">Please enter a valid email</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'" />
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="registerForm.get('password')?.hasError('required')">Password is required</mat-error>
            <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">Minimum 8 characters</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Confirm Password</mat-label>
            <input matInput formControlName="confirmPassword" [type]="hidePassword ? 'password' : 'text'" />
            <mat-icon matPrefix>lock_outline</mat-icon>
            <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">Please confirm</mat-error>
            <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch')">Passwords don't match</mat-error>
          </mat-form-field>

          <mat-checkbox formControlName="agreeTerms" color="primary" class="terms-check">
            I agree to the <a href="#" (click)="$event.preventDefault()">Terms of Service</a> and <a href="#" (click)="$event.preventDefault()">Privacy Policy</a>
          </mat-checkbox>

          <div class="error-message" *ngIf="errorMessage">
            <mat-icon>error</mat-icon>
            {{ errorMessage }}
          </div>

          <button mat-flat-button color="primary" type="submit" class="submit-btn"
            [disabled]="registerForm.invalid || isLoading || !registerForm.get('agreeTerms')?.value">
            {{ isLoading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/login">Sign in</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 64px);
      padding: 80px 24px 24px; background: linear-gradient(135deg, #667eea22 0%, #764ba222 100%); }
    .auth-card { background: white; border-radius: 16px; padding: 48px 40px; max-width: 480px; width: 100%;
      box-shadow: 0 8px 32px rgba(0,0,0,.08); }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .auth-logo { font-size: 48px; width: 48px; height: 48px; color: #667eea; margin-bottom: 16px; }
    .auth-header h1 { font-size: 28px; font-weight: 700; margin: 0 0 8px; color: #1a1a2e; }
    .auth-header p { color: #666; margin: 0; }
    .auth-form { display: flex; flex-direction: column; gap: 4px; }
    .full-width { width: 100%; }
    .name-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .terms-check { margin-bottom: 16px; font-size: 14px; }
    .terms-check a { color: #667eea; }
    .error-message { display: flex; align-items: center; gap: 8px; color: #d32f2f; font-size: 14px;
      background: #ffebee; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; }
    .submit-btn { height: 48px; font-size: 16px; border-radius: 8px; }
    .auth-footer { text-align: center; margin-top: 24px; color: #666; }
    .auth-footer a { color: #667eea; font-weight: 600; text-decoration: none; }
    .auth-loader { position: absolute; top: 0; left: 0; right: 0; border-radius: 16px 16px 0 0; }
    @media (max-width: 480px) { .auth-card { padding: 32px 24px; } .name-row { grid-template-columns: 1fr; } }
  `],
})
export class RegisterComponent {
  registerForm = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, this.passwordMatchValidator.bind(this)]],
    agreeTerms: [false],
  });
  hidePassword = true;
  isLoading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm.get('password')?.valueChanges.subscribe(() => {
      this.registerForm.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = this.registerForm?.get('password')?.value;
    return control.value !== password ? { passwordMismatch: true } : null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';
    const val = this.registerForm.value;
    this.authService.register({
      email: val.email!, password: val.password!, first_name: val.first_name!, last_name: val.last_name!,
    }).subscribe({
      next: () => { this.isLoading = false; this.router.navigate(['/']); },
      error: (err) => { this.isLoading = false; this.errorMessage = err?.error?.message || 'Registration failed. Please try again.'; },
    });
  }
}
