import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CheckoutService } from '../checkout.service';
import { MessageDialogService } from 'src/app/message.dialog/message-dialog.service';
import { SpinnerService } from 'src/app/spinner/spinner.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

interface Order {
  _id: string;
  userId: string;
  items: any[];
  totalAmount: number;
  status: string;
  orderDate: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

@Component({
  selector: 'app-all-orders',
  templateUrl: './all-orders.component.html',
  styleUrls: ['./all-orders.component.css']
})
export class AllOrdersComponent implements OnInit {
  displayedColumns: string[] = ['orderId', 'date', 'status', 'customer', 'amount', 'action'];
  dataSource: MatTableDataSource<Order>;
  categories: string[] = [];

  searchTerm: string = '';
  statusFilter: string = '';
  categoryFilter: string = '';
  totalOrders: number = 0;

  emailFilter: string = '';
  phoneFilter: string = '';
  currentPage: number = 1;
  pageSize: number = 10;


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private searchSubject = new Subject<string>();

  validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  constructor(private orderService: CheckoutService, private spinnerService: SpinnerService, private messageService: MessageDialogService,) {
    this.dataSource = new MatTableDataSource<Order>([]);
  }

  ngOnInit(): void {
    this.loadOrders();
    this.extractCategories();

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getFullName(firstName?: string, lastName?: string): string {
    return `${firstName} ${lastName}`.trim();
  }

  loadOrders(): void {

    const params = {
      status: this.statusFilter,
      page: this.paginator?.pageIndex + 1 || 1,
      limit: this.paginator?.pageSize || 10
    };

    this.spinnerService.show();
    this.orderService.getOrders(params).subscribe({
      next: (response: any) => {
        this.dataSource.data = response.orders;
        console.log(response.orders)
        this.totalOrders = response.pagination.totalOrders;
        this.spinnerService.hide();

      },
      error: (error) => {
        this.spinnerService.hide();
        console.error('Error loading orders:', error);
      }
    });
  }

  extractCategories(): void {
    const allCategories = new Set<string>();
    this.dataSource.data.forEach(order => {
      order.items.forEach(item => {
        if (item.productId.category) {
          allCategories.add(item.productId.category);
        }
      });
    });
    this.categories = Array.from(allCategories);
  }

  applyFilter(): void {
    if (!this.searchTerm.trim()) {
      this.loadOrders();
      return;
    }

    console.log(this.statusFilter)

    const params = {
      searchTerm: this.searchTerm.trim(),
      status: this.statusFilter,
      page: this.paginator?.pageIndex + 1 || 1,
      limit: this.paginator?.pageSize || 10
    };

    this.spinnerService.show();
    this.orderService.getOrders(params).subscribe({
      next: (response: any) => {
        this.dataSource.data = response.orders;
        this.totalOrders = response.pagination.totalOrders;
        this.spinnerService.hide();
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.messageService.showError('Error loading orders');
        this.spinnerService.hide();
      }
    });
  }

  updateOrderStatus(orderId: string, newStatus: string): void {
    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: (response) => {
        // Update the order in the data source
        const index = this.dataSource.data.findIndex(order => order._id === orderId);
        if (index !== -1) {
          this.dataSource.data[index].status = newStatus;
          this.dataSource._updateChangeSubscription(); // Trigger update
        }

        this.messageService.showSuccess('Order status updated successfully');
      },
      error: (error) => {
        this.messageService.showError(error);
        console.error('Error updating order status:', error);
      }
    });
  }

  cancelOrder(orderId: any) {

  }

  onSearchEnter(event: KeyboardEvent) {
    this.applyFilter();
    console.log(this.statusFilter)
  }


}
