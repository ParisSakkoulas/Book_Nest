import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpInterceptor } from '@angular/common/http';

import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {


  constructor(private authService: AuthService) { }

  // Intercepts HTTP requests to add auth token
  intercept(req: HttpRequest<any>, next: HttpHandler) {

    // Get auth token
    const token = this.authService.getToken();

    if (token) {

      // Clone request and add Authorization header with token
      const authRequest = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(authRequest);
    }

    // Pass  original request if no token
    return next.handle(req);
  }
}
