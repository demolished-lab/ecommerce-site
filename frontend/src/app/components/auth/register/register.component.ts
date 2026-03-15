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
            <mat-form-field appearance="outline" class="fade-in-field" style="--delay: 1">
              <mat-label>First Name</mat-label>
              <input matInput formControlName="first_name" placeholder="John" />
              <mat-error *ngIf="registerForm.get('first_name')?.hasError('required')">Required</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="fade-in-field" style="--delay: 2">
              <mat-label>Last Name</mat-label>
              <input matInput formControlName="last_name" placeholder="Doe" />
              <mat-error *ngIf="registerForm.get('last_name')?.hasError('required')">Required</mat-error>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width fade-in-field" style="--delay: 3">
            <mat-label>Email Address</mat-label>
            <input matInput formControlName="email" type="email" autocomplete="email" placeholder="john@example.com" />
            <mat-icon matPrefix>email</mat-icon>
            <mat-error *ngIf="registerForm.get('email')?.hasError('required')">Email is required</mat-error>
            <mat-error *ngIf="registerForm.get('email')?.hasError('email')">Please enter a valid email</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width fade-in-field" style="--delay: 4">
            <mat-label>Password</mat-label>
            <input matInput formControlName="password" [type]="hidePassword ? 'password' : 'text'" (input)="checkPasswordStrength()" />
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button" tabindex="-1">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="registerForm.get('password')?.hasError('required')">Password is required</mat-error>
            <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">Minimum 8 characters</mat-error>
          </mat-form-field>

          <!-- Interactive Password Requirements -->
          <div class="password-requirements" *ngIf="registerForm.get('password')?.value">
            <div class="requirement" [class.met]="passRequirements.length">
              <mat-icon>{{ passRequirements.length ? 'check_circle' : 'circle' }}</mat-icon>
              <span>At least 8 characters</span>
            </div>
            <div class="requirement" [class.met]="passRequirements.upper">
              <mat-icon>{{ passRequirements.upper ? 'check_circle' : 'circle' }}</mat-icon>
              <span>One uppercase letter</span>
            </div>
            <div class="requirement" [class.met]="passRequirements.lower">
              <mat-icon>{{ passRequirements.lower ? 'check_circle' : 'circle' }}</mat-icon>
              <span>One lowercase letter</span>
            </div>
            <div class="requirement" [class.met]="passRequirements.digit">
              <mat-icon>{{ passRequirements.digit ? 'check_circle' : 'circle' }}</mat-icon>
              <span>One number</span>
            </div>
            <div class="requirement" [class.met]="passRequirements.special">
              <mat-icon>{{ passRequirements.special ? 'check_circle' : 'circle' }}</mat-icon>
              <span>One special character (!&#64;#$...)</span>
            </div>
          </div>

          <mat-form-field appearance="outline" class="full-width fade-in-field" style="--delay: 5">
            <mat-label>Confirm Password</mat-label>
            <input matInput formControlName="confirmPassword" [type]="hidePassword ? 'password' : 'text'" />
            <mat-icon matPrefix>lock_outline</mat-icon>
            <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">Please confirm</mat-error>
            <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch')">Passwords don't match</mat-error>
          </mat-form-field>

          <div class="form-options fade-in-field" style="--delay: 6">
            <mat-checkbox formControlName="agreeTerms" color="primary" class="terms-check">
              I agree to the <a href="#" (click)="$event.preventDefault()">Terms of Service</a>
            </mat-checkbox>
          </div>

          <div class="error-message shake-animation" *ngIf="errorMessage">
            <mat-icon>error_outline</mat-icon>
            <span>{{ errorMessage }}</span>
          </div>

          <button mat-flat-button color="primary" type="submit" class="submit-btn fade-in-field" style="--delay: 7"
            [disabled]="registerForm.invalid || isLoading || !registerForm.get('agreeTerms')?.value || !isPasswordStrong()">
            <span *ngIf="!isLoading">Create Account</span>
            <div class="loader-dots" *ngIf="isLoading">
              <span></span><span></span><span></span>
            </div>
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
      padding: 80px 24px 40px; background: radial-gradient(circle at top right, #667eea15, transparent), radial-gradient(circle at bottom left, #764ba215, transparent); }
    .auth-card { background: white; border-radius: 24px; padding: 48px 40px; max-width: 520px; width: 100%;
      box-shadow: 0 20px 50px rgba(0,0,0,.05); animation: cardEntrance 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); border: 1px solid rgba(0,0,0,0.03); }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .auth-logo { font-size: 56px; width: 56px; height: 56px; color: #3f51b5; margin-bottom: 20px; 
      filter: drop-shadow(0 4px 8px rgba(63, 81, 181, 0.2)); animation: bounce 2s infinite ease-in-out; }
    .auth-header h1 { font-size: 32px; font-weight: 800; margin: 0 0 10px; color: #1a1a2e; letter-spacing: -0.5px; }
    .auth-header p { color: #666; margin: 0; font-size: 16px; opacity: 0.8; }
    .auth-form { display: flex; flex-direction: column; gap: 8px; }
    .full-width { width: 100%; }
    .name-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    
    .password-requirements { background: #f8f9fa; border-radius: 12px; padding: 16px; margin: 8px 0 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; border: 1px solid #eee; animation: slideDown 0.3s ease; }
    .requirement { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #999; transition: all 0.3s ease; }
    .requirement mat-icon { font-size: 16px; width: 16px; height: 16px; margin: 0; }
    .requirement.met { color: #2e7d32; font-weight: 600; }
    .requirement.met mat-icon { color: #2e7d32; animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    
    .terms-check { font-size: 14px; }
    .terms-check a { color: #3f51b5; font-weight: 600; text-decoration: none; }
    
    .error-message { display: flex; align-items: center; gap: 10px; color: #c62828; font-size: 14px;
      background: #ffebee; padding: 14px 18px; border-radius: 12px; margin: 16px 0; border: 1px solid #ffcdd2; }
    .shake-animation { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
    
    .submit-btn { height: 54px; font-size: 16px; font-weight: 700; border-radius: 12px; margin-top: 12px;
      background: linear-gradient(135deg, #3f51b5 0%, #303f9f 100%) !important; letter-spacing: 0.5px; transition: all 0.3s ease !important; }
    .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(63, 81, 181, 0.3) !important; }
    .submit-btn:disabled { opacity: 0.6; }

    .loader-dots { display: flex; gap: 4px; justify-content: center; }
    .loader-dots span { width: 8px; height: 8px; background: white; border-radius: 50%; display: inline-block; animation: dotPulse 1.4s infinite ease-in-out; }
    .loader-dots span:nth-child(2) { animation-delay: 0.2s; }
    .loader-dots span:nth-child(3) { animation-delay: 0.4s; }

    .fade-in-field { opacity: 0; transform: translateY(10px); animation: fadeIn 0.4s ease forwards; animation-delay: calc(var(--delay) * 0.1s + 0.3s); }

    @keyframes cardEntrance { from { opacity: 0; transform: translateY(30px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes fadeIn { to { opacity: 1; transform: translateY(0); } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pop { 0% { transform: scale(0.5); } 80% { transform: scale(1.2); } 100% { transform: scale(1); } }
    @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
    @keyframes dotPulse { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
    @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

    .auth-footer { text-align: center; margin-top: 32px; color: #666; font-size: 15px; }
    .auth-footer a { color: #3f51b5; font-weight: 700; text-decoration: none; position: relative; }
    .auth-footer a::after { content: ''; position: absolute; width: 0; height: 2px; bottom: -2px; left: 0; background: #3f51b5; transition: width 0.3s ease; }
    .auth-footer a:hover::after { width: 100%; }

    ::ng-deep .mat-mdc-form-field-focus-indicator { transition: all 0.3s ease; }
  `],
})
export class RegisterComponent {
  registerForm = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]], // minLength(8) is checked by isPasswordStrong
    confirmPassword: ['', [Validators.required, this.passwordMatchValidator.bind(this)]],
    agreeTerms: [false, Validators.requiredTrue],
  });

  hidePassword = true;
  isLoading = false;
  errorMessage = '';

  passRequirements = {
    length: false,
    upper: false,
    lower: false,
    digit: false,
    special: false
  };

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm.get('password')?.valueChanges.subscribe(() => {
      this.checkPasswordStrength();
      this.registerForm.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  checkPasswordStrength(): void {
    const pass = this.registerForm.get('password')?.value || '';
    this.passRequirements = {
      length: pass.length >= 8,
      upper: /[A-Z]/.test(pass),
      lower: /[a-z]/.test(pass),
      digit: /[0-9]/.test(pass),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pass)
    };
  }

  isPasswordStrong(): boolean {
    return Object.values(this.passRequirements).every(req => req);
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = this.registerForm?.get('password')?.value;
    return control.value !== password ? { passwordMismatch: true } : null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid || !this.isPasswordStrong()) return;
    this.isLoading = true;
    this.errorMessage = '';

    const val = this.registerForm.value;
    this.authService.register({
      email: val.email!, 
      password: val.password!, 
      first_name: val.first_name!, 
      last_name: val.last_name!,
    }).subscribe({
      next: () => { 
        this.isLoading = false; 
        this.router.navigate(['/']); 
      },
      error: (err) => { 
        this.isLoading = false; 
        console.error('Registration error:', err);
        
        // Handle FastAPI validation errors (detail: [{loc, msg, type}])
        if (err?.error?.errors && Array.isArray(err.error.errors)) {
          this.errorMessage = err.error.errors[0]?.message || 'Invalid input. Please check your details.';
        } else if (err?.error?.detail) {
          if (typeof err.error.detail === 'string') {
            this.errorMessage = err.error.detail;
          } else if (Array.isArray(err.error.detail)) {
            this.errorMessage = err.error.detail[0]?.msg || 'Validation failed.';
          }
        } else {
          this.errorMessage = err?.error?.message || 'Registration failed. Please try again.';
        }
      },
    });
  }
}
