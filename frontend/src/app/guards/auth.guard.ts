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

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.checkAuth(route, state);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.checkAuth(route, state);
  }

  private checkAuth(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    const isLoggedIn = this.authService.isLoggedIn;
    const requireGuest = route.data?.['requireGuest'];

    // Route requires guest (login/register pages)
    if (requireGuest) {
      if (isLoggedIn) {
        // Already logged in, redirect to home
        return of(this.router.createUrlTree(['/']));
      }
      return of(true);
    }

    // Route requires authentication
    if (!isLoggedIn) {
      // Not logged in, redirect to login
      const returnUrl = state.url;
      return of(this.router.createUrlTree(['/login'], {
        queryParams: { returnUrl }
      }));
    }

    return of(true);
  }
}
