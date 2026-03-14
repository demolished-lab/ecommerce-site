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
          <div>
            <h3>{{ item.product_name }}</h3>
            <p>{{ item.variant_name || '' }}</p>
            <p>{{ item.quantity }} × {{ '$' + item.unit_price }} = {{ '$' + item.total_price }}</p>
          </div>
          <div>
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
      .cart-container { padding: 24px; }
      .cart-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #e0e0e0; }
      .summary { margin-top: 16px; font-weight: 600; }
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
