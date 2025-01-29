import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CheckoutService } from '../checkout.service';

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

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private orderService: CheckoutService) {
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

  loadOrders(): void {
    this.orderService.getOrders().subscribe({
      next: (response: any) => {
        this.dataSource.data = response.orders;
        this.totalOrders = response.pagination.totalOrders;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
      }
    });
  }

  extractCategories(): void {
    // Extract unique categories from orders
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
    const filterValue = this.searchTerm.trim().toLowerCase();
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
