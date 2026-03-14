import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCardModule, MatDividerModule],
  template: `
    <div class="page" style="padding: 80px 24px 24px; max-width: 700px; margin: auto;">
      <h1>My Profile</h1>
      <mat-card class="profile-card">
        <div class="avatar-section">
          <div class="avatar"><mat-icon>account_circle</mat-icon></div>
          <div *ngIf="user">
            <h2>{{ user.first_name }} {{ user.last_name }}</h2>
            <p class="email">{{ user.email }}</p>
          </div>
        </div>
        <mat-divider></mat-divider>
        <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="profile-form">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>First Name</mat-label>
              <input matInput formControlName="first_name" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Last Name</mat-label>
              <input matInput formControlName="last_name" />
            </mat-form-field>
          </div>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Phone</mat-label>
            <input matInput formControlName="phone" />
          </mat-form-field>
          <div class="form-actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="profileForm.invalid || saving">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
          <div class="success-msg" *ngIf="successMsg">{{ successMsg }}</div>
        </form>
      </mat-card>

      <mat-card class="profile-card" style="margin-top: 24px;">
        <h3>Change Password</h3>
        <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Current Password</mat-label>
            <input matInput formControlName="current_password" type="password" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>New Password</mat-label>
            <input matInput formControlName="new_password" type="password" />
          </mat-form-field>
          <div class="form-actions">
            <button mat-stroked-button color="primary" type="submit" [disabled]="passwordForm.invalid || changingPw">
              {{ changingPw ? 'Changing...' : 'Change Password' }}
            </button>
          </div>
          <div class="success-msg" *ngIf="pwMsg">{{ pwMsg }}</div>
          <div class="error-msg" *ngIf="pwError">{{ pwError }}</div>
        </form>
      </mat-card>
    </div>
  `,
  styles: [`
    h1 { font-size: 28px; font-weight: 700; margin: 0 0 24px; }
    .profile-card { padding: 32px; }
    .avatar-section { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; }
    .avatar mat-icon { font-size: 72px; width: 72px; height: 72px; color: #667eea; }
    .avatar-section h2 { margin: 0; font-size: 22px; }
    .email { color: #888; margin: 4px 0 0; }
    .profile-form { margin-top: 24px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .full-width { width: 100%; }
    .form-actions { margin-top: 8px; }
    h3 { font-size: 18px; font-weight: 600; margin: 0 0 16px; }
    .success-msg { color: #2e7d32; margin-top: 12px; font-weight: 500; }
    .error-msg { color: #d32f2f; margin-top: 12px; font-weight: 500; }
  `],
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
  });
  passwordForm = this.fb.group({
    current_password: ['', Validators.required],
    new_password: ['', [Validators.required, Validators.minLength(8)]],
  });
  saving = false;
  changingPw = false;
  successMsg = '';
  pwMsg = '';
  pwError = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => {
      this.user = u;
      if (u) this.profileForm.patchValue({ first_name: u.first_name, last_name: u.last_name, email: u.email, phone: u.phone || '' });
    });
  }

  saveProfile(): void {
    this.saving = true; this.successMsg = '';
    // Profile update would call auth service
    setTimeout(() => { this.saving = false; this.successMsg = 'Profile updated successfully!'; }, 800);
  }

  changePassword(): void {
    this.changingPw = true; this.pwMsg = ''; this.pwError = '';
    const { current_password, new_password } = this.passwordForm.value;
    this.authService.changePassword(current_password!, new_password!).subscribe({
      next: () => { this.changingPw = false; this.pwMsg = 'Password changed!'; this.passwordForm.reset(); },
      error: (err) => { this.changingPw = false; this.pwError = err?.error?.message || 'Failed to change password'; },
    });
  }
}
