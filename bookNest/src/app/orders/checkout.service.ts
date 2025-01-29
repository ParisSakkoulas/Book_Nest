import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { PaginatedOrdersResponse } from '../models/PaginatedOrderItems.Model';
import { Order } from '../models/Order.Model';
import { SingleOrderResponse } from '../models/SingleOrderResponse';




@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  private apiUrl = '/api';

  constructor(private http: HttpClient) { }


  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const sessionId = localStorage.getItem('x-session-id');
    if (sessionId) {
      headers = headers.set('x-session-id', sessionId);

    }

    console.log(headers)
    return headers;
  }



  createOrder(shippingAddress: any): Observable<any> {

    return this.http.post(`http://localhost:3000/api/orders/create`, { shippingAddress }, { headers: this.getHeaders() });
  }

  getOrder(orderId: any): Observable<any> {
    const sessionId = localStorage.getItem('sessionId');
    const headers = new HttpHeaders().set('x-session-id', sessionId || '');
    return this.http.get<SingleOrderResponse>(`http://localhost:3000/api/orders/${orderId}`, { headers });
  }

  getMyOrders(page: number = 1, limit: number = 10): Observable<PaginatedOrdersResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedOrdersResponse>(`http://localhost:3000/api/orders/myOrders`,);
  }

  cancelOrder(orderId: any) {
    const sessionId = localStorage.getItem('sessionId');
    const headers = new HttpHeaders().set('x-session-id', sessionId || '');
    return this.http.delete<{ order: SingleOrderResponse, message: string }>(`http://localhost:3000/api/orders/${orderId}`);
  }


  getOrders(page: number = 1, limit: number = 10): Observable<PaginatedOrdersResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedOrdersResponse>(`http://localhost:3000/api/orders/all`, { params: params });
  }

  updateOrderStatus(orderId: string, status: string): Observable<any> {
    return this.http.patch(`http://localhost:3000/api/orders/${orderId}/status`, { status });
  }

  getUserOrders(userId: string, page: number = 1, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<{ orders: Order[], paginator: PaginatedOrdersResponse }>(`http://localhost:3000/api/orders/user/${userId}`, { params });
  }

}
