import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Cart, CartItem, CartAddItem, CartUpdateItem, CouponResponse } from '../models/cart.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private cartSubject: BehaviorSubject<Cart | null> = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCart();
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

  loadCart(): void {
    this.http.get<{ success: boolean; data: Cart }>(this.apiUrl).subscribe({
      next: (response) => {
        this.cartSubject.next(response.data);
      },
      error: () => {
        this.cartSubject.next(null);
      }
    });
  }

  getCart(): Observable<Cart> {
    return this.http.get<{ success: boolean; data: Cart }>(this.apiUrl).pipe(
      map(response => response.data),
      tap(cart => this.cartSubject.next(cart))
    );
  }

  addItem(item: CartAddItem): Observable<Cart> {
    return this.http.post<{ success: boolean; data: Cart }>(`${this.apiUrl}/add`, item).pipe(
      map(response => response.data),
      tap(cart => this.cartSubject.next(cart))
    );
  }

  updateItem(itemId: string, quantity: number): Observable<Cart> {
    return this.http.put<{ success: boolean; data: Cart }>(
      `${this.apiUrl}/update`,
      { item_id: itemId, quantity }
    ).pipe(
      map(response => response.data),
      tap(cart => this.cartSubject.next(cart))
    );
  }

  removeItem(itemId: string): Observable<Cart> {
    return this.http.delete<{ success: boolean; data: Cart }>(
      `${this.apiUrl}/remove`,
      { body: { item_id: itemId } }
    ).pipe(
      map(response => response.data),
      tap(cart => this.cartSubject.next(cart))
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete(`${this.apiUrl}/clear`).pipe(
      tap(() => this.cartSubject.next(null)),
      map(() => void 0)
    );
  }

  applyCoupon(couponCode: string): Observable<CouponResponse> {
    return this.http.post<{ success: boolean; data: CouponResponse }>(
      `${this.apiUrl}/coupon`,
      { coupon_code: couponCode }
    ).pipe(
      map(response => response.data),
      tap(() => this.loadCart())
    );
  }

  removeCoupon(): Observable<void> {
    return this.http.delete(`${this.apiUrl}/coupon`).pipe(
      tap(() => this.loadCart()),
      map(() => void 0)
    );
  }

  updateShippingEstimate(country: string, postalCode?: string): Observable<Cart> {
    return this.http.post<{ success: boolean; data: Cart }>(
      `${this.apiUrl}/shipping-estimate`,
      { country, postal_code: postalCode }
    ).pipe(
      map(response => response.data),
      tap(cart => this.cartSubject.next(cart))
    );
  }

  validateCart(): Observable<{ is_valid: boolean; errors: any[] }> {
    return this.http.get<{ success: boolean; data: { is_valid: boolean; errors: any[] } }>(
      `${this.apiUrl}/validate`
    ).pipe(map(response => response.data));
  }

  // Guest cart handling
  mergeGuestCart(sessionId: string): Observable<Cart> {
    return this.http.post<{ success: boolean; data: Cart }>(
      `${this.apiUrl}/merge`,
      { session_id: sessionId }
    ).pipe(
      map(response => response.data),
      tap(cart => {
        this.cartSubject.next(cart);
        localStorage.removeItem('guest_cart_session');
      })
    );
  }
}
