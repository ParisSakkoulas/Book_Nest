import { Component, OnInit } from '@angular/core';
import { Order } from 'src/app/models/Order.Model';
import { PaginatedOrdersResponse } from 'src/app/models/PaginatedOrderItems.Model';
import { CheckoutService } from '../checkout.service';
import { SpinnerComponent } from 'src/app/spinner/spinner.component';
import { SpinnerService } from 'src/app/spinner/spinner.service';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.css']
})
export class MyOrdersComponent implements OnInit {

  orders: Order[] = [];
  pagination = {
    currentPage: 1,
    totalPages: 0,
    totalOrders: 0
  };
  loading = false;

  constructor(private orderService: CheckoutService, private spinnerService: SpinnerService) { }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders(page: number = 1) {
    this.loading = true;
    this.spinnerService.show();
    this.orderService.getMyOrders(page).subscribe({
      next: (response: PaginatedOrdersResponse) => {
        this.orders = response.orders;
        this.pagination = response.pagination;
        this.loading = false;
        console.log(response)
        this.spinnerService.hide();
      },
      error: (error) => {
        console.error('Error fetching orders:', error);
        this.loading = false;
        this.spinnerService.hide();

        // Handle error (show toast, notification, etc.)
      }
    });
  }

  getExpectedDeliveryDate(createdDate: string): Date {
    const date = new Date(createdDate);
    date.setDate(date.getDate() + 5); // Add 5 days
    return date;
  }

}
