import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { UserAddress } from '../../../models/user.model';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatFormFieldModule, MatInputModule, MatDialogModule, FormsModule],
  template: `
    <div class="page" style="padding: 80px 24px 24px; max-width: 800px; margin: auto;">
      <div class="page-header">
        <h1>My Addresses</h1>
        <button mat-flat-button color="primary" (click)="showForm = true; editAddress = null; resetForm()">
          <mat-icon>add</mat-icon> Add Address
        </button>
      </div>

      <div *ngIf="showForm" class="address-form-card">
        <mat-card class="form-card">
          <h3>{{ editAddress ? 'Edit Address' : 'New Address' }}</h3>
          <div class="form-grid">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Street Address</mat-label>
              <input matInput [(ngModel)]="formData.street_address" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Apartment/Suite</mat-label>
              <input matInput [(ngModel)]="formData.apartment" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>City</mat-label>
              <input matInput [(ngModel)]="formData.city" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>State</mat-label>
              <input matInput [(ngModel)]="formData.state" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Postal Code</mat-label>
              <input matInput [(ngModel)]="formData.postal_code" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Country</mat-label>
              <input matInput [(ngModel)]="formData.country" />
            </mat-form-field>
          </div>
          <div class="form-actions">
            <button mat-flat-button color="primary" (click)="saveAddress()">{{ editAddress ? 'Update' : 'Save' }}</button>
            <button mat-button (click)="showForm = false">Cancel</button>
          </div>
        </mat-card>
      </div>

      <div *ngIf="addresses.length === 0 && !showForm" class="empty">
        <mat-icon>location_off</mat-icon>
        <h3>No addresses saved</h3>
        <p>Add a shipping address to speed up checkout</p>
      </div>

      <div class="address-grid">
        <mat-card *ngFor="let addr of addresses; let i = index" class="address-card">
          <mat-card-content>
            <div class="address-header">
              <mat-chip *ngIf="addr.is_default" color="primary" selected>Default</mat-chip>
              <mat-chip>{{ addr.address_type | titlecase }}</mat-chip>
            </div>
            <p class="address-text">
              {{ addr.street_address }}<span *ngIf="addr.apartment">, {{ addr.apartment }}</span><br>
              {{ addr.city }}, {{ addr.state }} {{ addr.postal_code }}<br>
              {{ addr.country }}
            </p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" (click)="edit(addr)"><mat-icon>edit</mat-icon> Edit</button>
            <button mat-button color="warn" (click)="remove(i)"><mat-icon>delete</mat-icon> Delete</button>
            <button mat-button *ngIf="!addr.is_default" (click)="setDefault(i)">Set Default</button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { font-size: 28px; font-weight: 700; margin: 0; }
    .form-card { padding: 24px; margin-bottom: 24px; }
    .form-card h3 { margin: 0 0 16px; font-size: 18px; font-weight: 600; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .full-width { grid-column: 1 / -1; }
    .form-actions { display: flex; gap: 12px; margin-top: 8px; }
    .address-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
    .address-card { transition: box-shadow .2s; }
    .address-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
    .address-header { display: flex; gap: 8px; margin-bottom: 12px; }
    .address-text { color: #444; line-height: 1.6; margin: 0; }
    .empty { text-align: center; padding: 64px 24px; }
    .empty mat-icon { font-size: 64px; width: 64px; height: 64px; color: #ccc; }
    .empty h3 { margin: 16px 0 8px; }
    .empty p { color: #888; }
  `],
})
export class AddressesComponent {
  addresses: UserAddress[] = [
    { id: '1', user_id: '1', address_type: 'home', is_default: true, street_address: '123 Main St', city: 'New York', state: 'NY', postal_code: '10001', country: 'USA' },
  ];
  showForm = false;
  editAddress: UserAddress | null = null;
  formData: any = {};

  resetForm(): void {
    this.formData = { street_address: '', apartment: '', city: '', state: '', postal_code: '', country: 'USA' };
  }

  edit(addr: UserAddress): void {
    this.editAddress = addr;
    this.formData = { ...addr };
    this.showForm = true;
  }

  saveAddress(): void {
    if (this.editAddress) {
      const i = this.addresses.findIndex(a => a.id === this.editAddress!.id);
      if (i >= 0) this.addresses[i] = { ...this.addresses[i], ...this.formData };
    } else {
      this.addresses.push({ id: Date.now().toString(), user_id: '1', address_type: 'home', is_default: false, ...this.formData });
    }
    this.showForm = false;
  }

  remove(i: number): void { if (confirm('Delete this address?')) this.addresses.splice(i, 1); }

  setDefault(i: number): void {
    this.addresses.forEach((a, idx) => a.is_default = idx === i);
  }
}
