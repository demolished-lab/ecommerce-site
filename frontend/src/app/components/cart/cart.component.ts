import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="cart-container">
      <h2>Your Cart</h2>
      <div *ngIf="!items?.length">
        <p>Your cart is empty.</p>
        <a routerLink="/products" mat-flat-button color="primary">Shop Products</a>
      </div>
      <div *ngIf="items?.length">
        <div class="cart-item" *ngFor="let item of items">
          <div class="item-visual">
            <img [src]="item.product_image || 'https://placehold.co/100x100/eeeeee/999999?text=Product'" [alt]="item.product_name" class="item-img" />
          </div>
          <div class="item-info">
            <h3>{{ item.product_name }}</h3>
            <p>{{ item.variant_name || '' }}</p>
            <p class="price-calc">{{ item.quantity }} × {{ '$' + (item.unit_price | number:'1.2-2') }} = {{ '$' + (item.total_price | number:'1.2-2') }}</p>
          </div>
          <div class="item-actions">
            <button mat-icon-button color="warn" (click)="remove(item)">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </div>
        <div class="summary">
          <div>Subtotal: {{ '$' + (cart?.subtotal || 0) }}</div>
          <div>Tax: {{ '$' + (cart?.tax_amount || 0) }}</div>
          <div>Shipping: {{ '$' + (cart?.shipping_estimate || 0) }}</div>
          <div><strong>Total: {{ '$' + (cart?.total || 0) }}</strong></div>
        </div>
        <a routerLink="/checkout" mat-flat-button color="primary">Proceed to Checkout</a>
      </div>
    </div>
  `,
  styles: [
    `
      .cart-container { padding: 40px 24px; max-width: 900px; margin: 0 auto; background: #fcfcfc; min-height: 70vh; }
      h2 { font-size: 28px; font-weight: 700; color: #1e293b; margin-bottom: 32px; text-align: center; }
      .cart-item { display: grid; grid-template-columns: 100px 1fr auto; gap: 24px; align-items: center; padding: 24px; border-bottom: 1px solid #f1f5f9; background: white; border-radius: 16px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); transition: transform 0.2s ease; }
      .cart-item:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
      .item-visual { width: 100px; height: 100px; border-radius: 12px; overflow: hidden; background: #f8fafc; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; }
      .item-img { width: 100%; height: 100%; object-fit: contain; }
      .item-info h3 { margin: 0 0 4px; font-size: 18px; font-weight: 600; color: #0f172a; }
      .item-info p { margin: 0; color: #64748b; font-size: 14px; }
      .price-calc { font-family: 'Inter', sans-serif; font-weight: 600; color: #2563eb !important; margin-top: 8px !important; font-size: 15px !important; }
      .summary { margin-top: 40px; padding: 32px; background: white; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.04); }
      .summary div { display: flex; justify-content: space-between; margin-bottom: 12px; color: #475569; font-size: 15px; }
      .summary strong { font-size: 22px; color: #0f172a; border-top: 2px solid #f1f5f9; padding-top: 16px; margin-top: 16px; }
      a[mat-flat-button] { margin-top: 32px; width: 100%; height: 56px; font-size: 17px; font-weight: 600; border-radius: 12px; background: #1e293b; color: white; }
    `,
  ],
})
export class CartComponent implements OnInit {
  items: CartItem[] = [];
  cart: any;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe((cart) => {
      this.cart = cart;
      this.items = cart?.items || [];
    });
  }

  remove(item: CartItem): void {
    this.cartService.removeItem(item.id).subscribe();
  }
}
