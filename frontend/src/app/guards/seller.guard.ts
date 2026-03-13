import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { SellerService } from '../services/seller.service';

@Injectable({
  providedIn: 'root'
})
export class SellerGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthService,
    private sellerService: SellerService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.checkSellerStatus();
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.checkSellerStatus();
  }

  private checkSellerStatus(): Observable<boolean | UrlTree> {
    const user = this.authService.currentUser;

    if (!user) {
      return of(this.router.createUrlTree(['/login']));
    }

    // Admins can access seller routes
    if (this.authService.isAdmin()) {
      return of(true);
    }

    // Check if user is a seller
    if (user.role !== 'seller') {
      // User is not a seller, redirect to seller application
      return of(this.router.createUrlTree(['/become-seller']));
    }

    // User is a seller, allow access
    return of(true);
  }
}
