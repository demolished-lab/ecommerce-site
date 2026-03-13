import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Seller, SellerApplication, SellerDashboardStats } from '../models/seller.model';
import { PaginatedResponse } from '../models/common.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  private apiUrl = `${environment.apiUrl}/sellers`;

  constructor(private http: HttpClient) {}

  // Public methods
  getSellers(
    page: number = 1,
    pageSize: number = 20,
    search?: string,
    tier?: string
  ): Observable<PaginatedResponse<Seller>> {
    let params: any = { page, page_size: pageSize };
    if (search) params.search = search;
    if (tier) params.tier = tier;

    return this.http.get<{ success: boolean; data: PaginatedResponse<Seller> }>(
      this.apiUrl,
      { params }
    ).pipe(map(response => response.data));
  }

  getSellerBySlug(slug: string): Observable<Seller> {
    return this.http.get<{ success: boolean; data: Seller }>(
      `${this.apiUrl}/${slug}`
    ).pipe(map(response => response.data));
  }

  // Seller methods
  getMySellerProfile(): Observable<Seller> {
    return this.http.get<{ success: boolean; data: Seller }>(
      `${this.apiUrl}/me`
    ).pipe(map(response => response.data));
  }

  applyAsSeller(application: SellerApplication): Observable<Seller> {
    return this.http.post<{ success: boolean; data: Seller }>(
      `${this.apiUrl}/apply`,
      application
    ).pipe(map(response => response.data));
  }

  updateSellerProfile(sellerId: string, data: Partial<Seller>): Observable<Seller> {
    return this.http.put<{ success: boolean; data: Seller }>(
      `${this.apiUrl}/${sellerId}`,
      data
    ).pipe(map(response => response.data));
  }

  getDashboardStats(): Observable<SellerDashboardStats> {
    return this.http.get<{ success: boolean; data: SellerDashboardStats }>(
      `${this.apiUrl}/dashboard/stats`
    ).pipe(map(response => response.data));
  }

  getSalesReport(period: 'week' | 'month' | 'year' = 'month'): Observable<any> {
    return this.http.get<{ success: boolean; data: any }>(
      `${this.apiUrl}/dashboard/sales-report`,
      { params: { period } }
    ).pipe(map(response => response.data));
  }

  uploadDocument(
    sellerId: string,
    documentType: string,
    file: File
  ): Observable<{ id: string; file_url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    return this.http.post<{ success: boolean; data: { id: string; file_url: string } }>(
      `${this.apiUrl}/${sellerId}/documents`,
      formData
    ).pipe(map(response => response.data));
  }

  // Admin methods
  getPendingApplications(): Observable<Seller[]> {
    return this.http.get<{ success: boolean; data: Seller[] }>(
      `${this.apiUrl}/admin/pending`
    ).pipe(map(response => response.data));
  }

  reviewApplication(
    sellerId: string,
    action: 'approve' | 'reject' | 'request_info',
    reason?: string,
    notes?: string
  ): Observable<Seller> {
    return this.http.post<{ success: boolean; data: Seller }>(
      `${this.apiUrl}/${sellerId}/review`,
      { action, reason, notes }
    ).pipe(map(response => response.data));
  }

  updateSellerSettings(
    sellerId: string,
    settings: {
      tier?: string;
      commission_rate?: number;
      status?: string;
      is_verified?: boolean;
    }
  ): Observable<Seller> {
    return this.http.put<{ success: boolean; data: Seller }>(
      `${this.apiUrl}/${sellerId}/settings`,
      settings
    ).pipe(map(response => response.data));
  }
}
