import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule
  ],
  template: `
    <mat-toolbar class="header-toolbar" color="primary">
      <!-- Logo -->
      <a routerLink="/" class="logo-link">
        <span class="logo-text">🛒 Marketplace</span>
      </a>

      <!-- Search Bar -->
      <div class="search-container">
        <mat-form-field appearance="outline" class="search-field">
          <input matInput
                 type="text"
                 [(ngModel)]="searchQuery"
                 (keyup.enter)="onSearch()"
                 placeholder="Search products...">
          <button mat-icon-button matSuffix (click)="onSearch()">
            <mat-icon>search</mat-icon>
          </button>
        </mat-form-field>
      </div>

      <span class="spacer"></span>

      <!-- Navigation Links -->
      <nav class="nav-links">
        <a mat-button routerLink="/products">Products</a>
        <a mat-button routerLink="/sellers">Sellers</a>
        <a mat-button routerLink="/categories">Categories</a>
      </nav>

      <!-- Cart Button -->
      <a mat-icon-button routerLink="/cart" [matBadge]="cartCount" matBadgeColor="accent">
        <mat-icon>shopping_cart</mat-icon>
      </a>

      <!-- User Menu -->
      <ng-container *ngIf="currentUser$ | async as user; else loginButtons">
        <button mat-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
          <span class="user-name">{{ user.first_name }}</span>
          <mat-icon>arrow_drop_down</mat-icon>
        </button>

        <mat-menu #userMenu="matMenu">
          <!-- Buyer Menu Items -->
          <a mat-menu-item routerLink="/orders">
            <mat-icon>receipt</mat-icon>
            <span>My Orders</span>
          </a>
          <a mat-menu-item routerLink="/profile">
            <mat-icon>person</mat-icon>
            <span>Profile</span>
          </a>
          <a mat-menu-item routerLink="/addresses">
            <mat-icon>location_on</mat-icon>
            <span>Addresses</span>
          </a>
          <a mat-menu-item routerLink="/wishlist">
            <mat-icon>favorite</mat-icon>
            <span>Wishlist</span>
          </a>

          <mat-divider></mat-divider>

          <!-- Seller Menu Items -->
          <ng-container *ngIf="isSeller">
            <a mat-menu-item routerLink="/seller/dashboard">
              <mat-icon>store</mat-icon>
              <span>Seller Dashboard</span>
            </a>
            <a mat-menu-item routerLink="/seller/products">
              <mat-icon>inventory_2</mat-icon>
              <span>My Products</span>
            </a>
            <a mat-menu-item routerLink="/seller/orders">
              <mat-icon>local_shipping</mat-icon>
              <span>Store Orders</span>
            </a>
            <mat-divider></mat-divider>
          </ng-container>

          <!-- Admin Menu Items -->
          <ng-container *ngIf="isAdmin">
            <a mat-menu-item routerLink="/admin/dashboard">
              <mat-icon>admin_panel_settings</mat-icon>
              <span>Admin Panel</span>
            </a>
            <mat-divider></mat-divider>
          </ng-container>

          <!-- Become Seller -->
          <ng-container *ngIf="!isSeller && !isAdmin">
            <a mat-menu-item routerLink="/become-seller">
              <mat-icon>add_business</mat-icon>
              <span>Become a Seller</span>
            </a>
            <mat-divider></mat-divider>
          </ng-container>

          <!-- Logout -->
          <button mat-menu-item (click)="logout()">
            <mat-icon>exit_to_app</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </ng-container>

      <ng-template #loginButtons>
        <a mat-button routerLink="/login">Login</a>
        <a mat-raised-button routerLink="/register" color="accent">Register</a>
      </ng-template>
    </mat-toolbar>
  `,
  styles: [`
    .header-toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      height: 64px;
      display: flex;
      align-items: center;
      padding: 0 24px;
    }

    .logo-link {
      text-decoration: none;
      color: inherit;
    }

    .logo-text {
      font-size: 24px;
      font-weight: bold;
    }

    .search-container {
      flex: 1;
      max-width: 600px;
      margin: 0 24px;
    }

    .search-field {
      width: 100%;
    }

    ::ng-deep .search-field .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    .spacer {
      flex: 1;
    }

    .nav-links {
      display: flex;
      gap: 8px;
      margin-right: 16px;
    }

    .user-name {
      margin-left: 8px;
    }

    ::ng-deep .mat-mdc-menu-item-text {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  `]
})
export class HeaderComponent {
  searchQuery = '';
  currentUser$: Observable<User | null>;
  cartCount = 0;

  constructor(
    private authService: AuthService,
    private cartService: CartService
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.cartService.cart$.subscribe(cart => {
      this.cartCount = cart?.item_count || 0;
    });
  }

  get isSeller(): boolean {
    return this.authService.isSeller();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      // Navigate to search with query
    }
  }

  logout(): void {
    this.authService.logoutClient();
  }
}
