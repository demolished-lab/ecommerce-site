import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  get token(): string | null {
    return localStorage.getItem('access_token');
  }

  get userRole(): string | null {
    return this.currentUser?.role || null;
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<{ success: boolean; data: AuthResponse }>(
      `${this.apiUrl}/login`,
      credentials
    ).pipe(
      map(response => response.data),
      tap(data => this.setSession(data))
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<{ success: boolean; data: AuthResponse }>(
      `${this.apiUrl}/register`,
      userData
    ).pipe(
      map(response => response.data),
      tap(data => this.setSession(data))
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => this.clearSession()),
      catchError(() => {
        this.clearSession();
        return of(null);
      })
    );
  }

  logoutClient(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<{ access_token: string }> {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.http.post<{ success: boolean; data: { access_token: string } }>(
      `${this.apiUrl}/refresh`,
      {},
      { headers: { Authorization: `Bearer ${refreshToken}` } }
    ).pipe(
      map(response => response.data),
      tap(data => {
        localStorage.setItem('access_token', data.access_token);
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, {
      token,
      new_password: newPassword
    });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, {
      current_password: currentPassword,
      new_password: newPassword
    });
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-email`, { token });
  }

  resendVerification(): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-verification`, {});
  }

  isSeller(): boolean {
    return this.currentUser?.role === 'seller';
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem('access_token', authResult.access_token);
    localStorage.setItem('refresh_token', authResult.refresh_token);
    localStorage.setItem('currentUser', JSON.stringify(authResult.user));
    this.currentUserSubject.next(authResult.user);
  }

  private clearSession(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
