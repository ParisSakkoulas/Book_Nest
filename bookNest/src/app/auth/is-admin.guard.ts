import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class IsAdminGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  // Check if user has admin permissions to access route
  canActivate(): boolean {

    // Verify user is authenticated and has admin role
    if (this.authService.getToken() && this.authService.isAdmin()) {
      return true;
    }

    // Redirect to home if not admin
    this.router.navigate(['/']);
    return false;
  }


}
