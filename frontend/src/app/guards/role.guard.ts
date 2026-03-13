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
export class RoleGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.checkRole(route);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.checkRole(route);
  }

  private checkRole(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const requiredRole = route.data?.['role'] as string;
    const allowedRoles = route.data?.['roles'] as string[];

    if (!requiredRole && (!allowedRoles || allowedRoles.length === 0)) {
      return of(true);
    }

    const userRole = this.authService.userRole;

    if (!userRole) {
      return of(this.router.createUrlTree(['/login']));
    }

    if (requiredRole && userRole !== requiredRole) {
      return of(this.router.createUrlTree(['/']));
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      return of(this.router.createUrlTree(['/']));
    }

    return of(true);
  }
}
