
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})


export class AuthGuard implements CanActivate {


  constructor(private authService: AuthService, private router: Router) { }


  //Returns true if user can access route, false otherwise
  canActivate(): boolean {

    //if user has a valid authentication token
    if (this.authService.getToken()) {
      return true;
    }

    // If no valid token, redirect to login page
    this.router.navigate(['/auth/login']);

    // Return false to protected route
    return false;
  }

}
