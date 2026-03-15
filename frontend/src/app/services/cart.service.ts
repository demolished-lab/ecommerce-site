import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, of } from "rxjs";
import { map, tap } from "rxjs/operators";
import {
  Cart,
  CartItem,
  CartAddItem,
  CartUpdateItem,
  CouponResponse,
} from "../models/cart.model";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class CartService {
  private cartSubject: BehaviorSubject<Cart | null> = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();

  private mockCart: Cart = {
    id: 'guest-cart-1',
    user_id: undefined,
    session_id: 'sess-1',
    currency: 'USD',
    coupon_discount: 0,
    items: [],
    subtotal: 0,
    tax_amount: 0,
    shipping_estimate: 0,
    total: 0,
    item_count: 0,
    unique_item_count: 0
  };

  constructor() {
    this.cartSubject.next(this.mockCart);
  }

  get cart(): Cart | null {
    return this.cartSubject.value;
  }

  get itemCount(): number {
    return this.cart?.item_count || 0;
  }

  get total(): number {
    return this.cart?.total || 0;
  }

  private recalculateCart() {
    let subtotal = 0;
    let count = 0;
    
    this.mockCart.items.forEach(item => {
      subtotal += item.total_price;
      count += item.quantity;
    });

    this.mockCart.subtotal = subtotal;
    this.mockCart.tax_amount = subtotal * 0.08; // 8% mock tax
    this.mockCart.shipping_estimate = subtotal > 100 ? 0 : (subtotal > 0 ? 15.00 : 0); // Free shipping over $100
    this.mockCart.total = this.mockCart.subtotal + this.mockCart.tax_amount + this.mockCart.shipping_estimate;
    this.mockCart.item_count = count;
    this.mockCart.unique_item_count = this.mockCart.items.length;

    this.cartSubject.next({...this.mockCart});
  }

  loadCart(): void {
    this.cartSubject.next(this.mockCart);
  }

  getCart(): Observable<Cart> {
    return of(this.mockCart);
  }

  addItem(item: CartAddItem): Observable<Cart> {
    const existingItem = this.mockCart.items.find(i => i.product_id === item.product_id);
    
    if (existingItem) {
      existingItem.quantity += item.quantity;
      existingItem.total_price = existingItem.quantity * existingItem.unit_price;
    } else {
      const unitPrice = item.unit_price || 45.00;
      this.mockCart.items.push({
        id: Math.random().toString(36).substring(7),
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        max_quantity: 10,
        unit_price: unitPrice,
        total_price: unitPrice * item.quantity,
        product_name: item.product_name || "Unknown Product",
        product_image: item.product_image,
        is_gift: false,
        is_available: true
      });
    }

    this.recalculateCart();
    return of(this.mockCart);
  }

  updateItem(itemId: string, quantity: number): Observable<Cart> {
    const existingItem = this.mockCart.items.find(i => i.id === itemId);
    if (existingItem) {
      existingItem.quantity = quantity;
      existingItem.total_price = existingItem.quantity * existingItem.unit_price;
      this.recalculateCart();
    }
    return of(this.mockCart);
  }

  removeItem(itemId: string): Observable<Cart> {
    this.mockCart.items = this.mockCart.items.filter(i => i.id !== itemId);
    this.recalculateCart();
    return of(this.mockCart);
  }

  clearCart(): Observable<void> {
    this.mockCart.items = [];
    this.recalculateCart();
    return of(void 0);
  }

  applyCoupon(couponCode: string): Observable<CouponResponse> {
    // Mock coupon logic
    return of({ success: true, message: 'Coupon applied!', coupon_code: couponCode, discount_amount: 10, new_total: this.mockCart.total - 10 });
  }

  removeCoupon(): Observable<void> {
    return of(void 0);
  }

  updateShippingEstimate(country: string, postalCode?: string): Observable<Cart> {
    return of(this.mockCart);
  }

  validateCart(): Observable<{ is_valid: boolean; errors: any[] }> {
    return of({ is_valid: true, errors: [] });
  }

  mergeGuestCart(sessionId: string): Observable<Cart> {
    return of(this.mockCart);
  }
}
