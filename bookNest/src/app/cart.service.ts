import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private cartItemsSubject = new BehaviorSubject<any[]>([]);
  private baseUrl = `http://localhost:3000/api/cart/items`;
  private cartSubject = new BehaviorSubject<any>(null);
  cart$ = this.cartSubject.asObservable();

  private sessionId: string | null = null;
  private isAuthenticated = false



  constructor(private http: HttpClient, private authService: AuthService) {

    // Initialize session ID for visitors if not authenticated
    this.authService.isAuthenticated$().subscribe(isAuth => {
      if (!isAuth) {
        this.sessionId = this.getOrCreateSessionId();
        console.log(this.sessionId)
      }
      this.updateCartState();
    });


  }

  ///Method to get or create session for visitors only
  private getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem('x-session-id');
    if (!sessionId) {
      sessionId = 'visitor_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('x-session-id', sessionId);
    }
    return sessionId;
  }

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();

    const token = this.authService.getToken();
    if (token) {
      // For authenticated users

      this.clearVisitorSession();
    } else if (this.sessionId) {
      // For visitors
      console.log(this.sessionId)
      headers = headers.set('x-session-id', this.sessionId);
    }

    return headers;
  }



  addToCart(items: any[]): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`http://localhost:3000/api/cart/items`, { items }, { headers });
  }

  removeFromCart(bookId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.baseUrl}/${bookId}`, { headers });
  }

  updateQuantity(bookId: string, quantity: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.patch(`${this.baseUrl}/${bookId}`, { quantity }, { headers });
  }

  getCart(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get('http://localhost:3000/api/cart', { headers });
  }


  clearVisitorSession() {
    localStorage.removeItem('x-session-id');
    this.sessionId = null;
    console.log(this.sessionId);
    console.log(localStorage.getItem('x-session-id'));

  }

  updateCartState() {
    this.getCart().subscribe(cart => {
      this.cartSubject.next(cart);
    });
  }
}
