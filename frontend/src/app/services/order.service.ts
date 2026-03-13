import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Order, OrderCreate, ShippingRate, ShippingAddress } from '../models/order.model';
import { PaginatedResponse } from '../models/common.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  createOrder(orderData: OrderCreate): Observable<Order> {
    return this.http.post<{ success: boolean; data: Order }>(
      this.apiUrl,
      orderData
    ).pipe(map(response => response.data));
  }

  getMyOrders(
    page: number = 1,
    pageSize: number = 10,
    status?: string
  ): Observable<PaginatedResponse<Order>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    if (status) params = params.set('status', status);

    return this.http.get<{ success: boolean; data: PaginatedResponse<Order> }>(
      this.apiUrl,
      { params }
    ).pipe(map(response => response.data));
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<{ success: boolean; data: Order }>(
      `${this.apiUrl}/${id}`
    ).pipe(map(response => response.data));
  }

  getOrderByNumber(orderNumber: string): Observable<Order> {
    return this.http.get<{ success: boolean; data: Order }>(
      `${this.apiUrl}/number/${orderNumber}`
    ).pipe(map(response => response.data));
  }

  cancelOrder(id: string, reason: string): Observable<Order> {
    return this.http.post<{ success: boolean; data: Order }>(
      `${this.apiUrl}/${id}/cancel`,
      { reason }
    ).pipe(map(response => response.data));
  }

  // Shipping
  getShippingRates(address: ShippingAddress): Observable<ShippingRate[]> {
    return this.http.post<{ success: boolean; data: ShippingRate[] }>(
      `${this.apiUrl}/shipping-rates`,
      address
    ).pipe(map(response => response.data));
  }

  // Payment
  createPaymentIntent(orderId: string, paymentMethod: string): Observable<{ client_secret: string }> {
    return this.http.post<{ success: boolean; data: { client_secret: string } }>(
      `${this.apiUrl}/${orderId}/payment-intent`,
      { payment_method: paymentMethod }
    ).pipe(map(response => response.data));
  }

  confirmPayment(orderId: string, paymentIntentId: string): Observable<Order> {
    return this.http.post<{ success: boolean; data: Order }>(
      `${this.apiUrl}/${orderId}/confirm-payment`,
      { payment_intent_id: paymentIntentId }
    ).pipe(map(response => response.data));
  }

  // Seller Orders
  getSellerOrders(
    page: number = 1,
    pageSize: number = 10,
    status?: string
  ): Observable<PaginatedResponse<Order>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    if (status) params = params.set('status', status);

    return this.http.get<{ success: boolean; data: PaginatedResponse<Order> }>(
      `${this.apiUrl}/seller`,
      { params }
    ).pipe(map(response => response.data));
  }

  updateOrderStatus(
    orderId: string,
    newStatus: string,
    reason?: string,
    trackingNumber?: string
  ): Observable<Order> {
    return this.http.put<{ success: boolean; data: Order }>(
      `${this.apiUrl}/${orderId}/status`,
      { status: newStatus, reason, tracking_number: trackingNumber }
    ).pipe(map(response => response.data));
  }

  addTracking(orderId: string, carrier: string, trackingNumber: string): Observable<Order> {
    return this.http.post<{ success: boolean; data: Order }>(
      `${this.apiUrl}/${orderId}/tracking`,
      { carrier, tracking_number: trackingNumber }
    ).pipe(map(response => response.data));
  }

  // Statistics
  getOrderStatistics(): Observable<{
    total_orders: number;
    total_revenue: number;
    status_counts: { [key: string]: number };
  }> {
    return this.http.get<{ success: boolean; data: any }>(
      `${this.apiUrl}/statistics`
    ).pipe(map(response => response.data));
  }
}
