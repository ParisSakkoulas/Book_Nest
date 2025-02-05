import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { PaginatedOrdersResponse } from '../models/PaginatedOrderItems.Model';
import { Order } from '../models/Order.Model';
import { SingleOrderResponse } from '../models/SingleOrderResponse';
import { environment } from 'src/environments/environment';




@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  //Base url from enviroment
  private baseUrl = environment.baseUrl;



  constructor(private http: HttpClient) { }

  // Get headers with session ID if available
  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const sessionId = localStorage.getItem('x-session-id');
    if (sessionId) {
      headers = headers.set('x-session-id', sessionId);

    }

    console.log(headers)
    return headers;
  }


  // Create new order with shipping address
  createOrder(shippingAddress: any): Observable<any> {

    return this.http.post(`${this.baseUrl}/orders/create`, { shippingAddress }, { headers: this.getHeaders() });
  }

  // Get single order by ID
  getOrder(orderId: any): Observable<any> {
    const sessionId = localStorage.getItem('sessionId');
    const headers = new HttpHeaders().set('x-session-id', sessionId || '');
    return this.http.get<SingleOrderResponse>(`${this.baseUrl}/orders/${orderId}`, { headers });
  }

  // Get orders for current user with pagination
  getMyOrders(page: number = 1, limit: number = 10): Observable<PaginatedOrdersResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedOrdersResponse>(`${this.baseUrl}/orders/myOrders`,);
  }

  // Cancel order by ID
  cancelOrder(orderId: any) {
    const sessionId = localStorage.getItem('sessionId');
    const headers = new HttpHeaders().set('x-session-id', sessionId || '');
    return this.http.delete<{ order: SingleOrderResponse, message: string }>(`${this.baseUrl}/orders/${orderId}`);
  }


  // Get all orders
  getOrders(params?: { searchTerm?: string; page?: number; limit?: number }): Observable<PaginatedOrdersResponse> {

    let queryParams = new HttpParams();

    if (params?.searchTerm) {
      if (params.searchTerm.includes('@')) {
        queryParams = queryParams.append('email', params.searchTerm);
      } else {
        queryParams = queryParams.append('phone', params.searchTerm);
      }
    }
    if (params?.page) {
      queryParams = queryParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      queryParams = queryParams.append('limit', params.limit.toString());
    }

    console.log(queryParams)

    return this.http.get<PaginatedOrdersResponse>(`${this.baseUrl}/orders/all`, { params: queryParams });
  }

  // Update order status
  updateOrderStatus(orderId: string, status: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/orders/${orderId}/status`, { status });
  }

  // Get orders for specific user
  getUserOrders(userId: string, page: number = 1, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<{ orders: Order[], paginator: PaginatedOrdersResponse }>(`h${this.baseUrl}/orders/user/${userId}`, { params });
  }

}
