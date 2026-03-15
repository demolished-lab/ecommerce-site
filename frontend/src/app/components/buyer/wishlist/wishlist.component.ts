import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { CartService } from '../../../services/cart.service';
import { WishlistService, WishlistItem } from '../../../services/wishlist.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page" style="padding: 80px 24px 24px; max-width: 1000px; margin: auto;">
      <h1>My Wishlist</h1>
      <div *ngIf="(items$ | async)?.length === 0" class="empty">
        <mat-icon>favorite_border</mat-icon>
        <h3>Your wishlist is empty</h3>
        <p>Save items you love for later</p>
        <a mat-flat-button color="primary" routerLink="/products">Browse Products</a>
      </div>
      <div class="wishlist-grid" *ngIf="(items$ | async) as items">
        <mat-card *ngFor="let item of items" class="wishlist-card">
          <div class="image-wrap">
            <img [src]="item.image || 'https://placehold.co/150x150/eeeeee/999999?text=No+Image'" [alt]="item.name" />
            <button mat-icon-button class="remove-btn" (click)="remove(item.id)"><mat-icon>close</mat-icon></button>
          </div>
          <mat-card-content>
            <h3 class="item-name">{{ item.name }}</h3>
            <div class="item-price">\${{ item.price | number:'1.2-2' }}</div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-flat-button color="primary" (click)="addToCart(item)">
              <mat-icon>shopping_cart</mat-icon> Add to Cart
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    h1 { font-size: 28px; font-weight: 700; margin: 0 0 24px; }
    .empty { text-align: center; padding: 64px 24px; }
    .empty mat-icon { font-size: 64px; width: 64px; height: 64px; color: #e91e63; opacity: .4; }
    .empty h3 { margin: 16px 0 8px; }
    .empty p { color: #888; margin: 0 0 24px; }
    .wishlist-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
    .wishlist-card { position: relative; transition: transform .2s, box-shadow .2s; }
    .wishlist-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,.1); }
    .image-wrap { position: relative; aspect-ratio: 1; overflow: hidden; }
    .image-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .remove-btn { position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,.9); z-index: 2; }
    .item-name { font-size: 15px; font-weight: 500; margin: 8px 0 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .item-price { font-size: 18px; font-weight: 700; color: #1976d2; }
  `],
})
export class WishlistComponent {
  items$: Observable<WishlistItem[]>;

  constructor(
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {
    this.items$ = this.wishlistService.wishlist$;
  }

  remove(id: string): void { 
    this.wishlistService.removeFromWishlist(id);
  }

  addToCart(item: WishlistItem): void {
    this.cartService.addItem({ 
      product_id: item.id, 
      quantity: 1,
      product_name: item.name,
      product_image: item.image,
      unit_price: item.price
    }).subscribe();
  }
}

