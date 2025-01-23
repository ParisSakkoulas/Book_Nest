import { Component, Inject, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Customer } from '../models/Customer.Model';
import { CustomersService } from './customer.service';
import { HttpClient } from '@angular/common/http';
import { PageEvent } from '@angular/material/paginator';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { CreateCustomerComponent } from './create-customer/create-customer.component';
import { MessageDialogService } from '../message.dialog/message-dialog.service';

@Component({
  selector: 'app-costumers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CostumersComponent implements OnInit {

  customers: Customer[] = [];
  pagination = {
    total: 0,
    page: 1,
    limit: 10,
  };
  searchQuery = '';
  filters = {
    customerStatus: '',
    isActive: '',
  };

  constructor(private customerService: CustomersService, private dialog: MatDialog, private messageService: MessageDialogService) { }

  ngOnInit(): void {
    this.loadCustomers();

  }

  loadCustomers(): void {
    const { page, limit } = this.pagination;
    const params = {
      page: page,
      limit: limit,
      search: this.searchQuery,
      customerStatus: this.filters.customerStatus,
      isActive: this.filters.isActive,
    };

    this.customerService.getCustomers(params);
    this.customerService.getCurrentCustomers().subscribe(customers => {
      this.customers = customers;
    });

    this.customerService.getPagination().subscribe(pagination => {
      this.pagination = pagination;
    });
  }

  onPageChange(event: PageEvent): void {
    this.pagination.page = event.pageIndex + 1;
    this.pagination.limit = event.pageSize;
    this.loadCustomers();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    this.pagination.page = 1; // Reset to the first page
    this.loadCustomers();
  }

  applyFilters(): void {
    this.pagination.page = 1; // Reset to the first page
    this.loadCustomers();
  }

  onCreateNewCustomer() {
    const dialogRef = this.dialog.open(CreateCustomerComponent, {
      width: '500px',
      disableClose: true,
    });

  }


  viewCustomer(customer: Customer) {

  }

  editCustomer(customer: Customer) {
    const dialogRef = this.dialog.open(CreateCustomerComponent, {
      width: '500px',
      disableClose: true,
      data: { customer } // Add any data you want to pass to the dialog
    });
  }

  deleteCustomer(customer: Customer) {

    this.customerService.deleteSingleCustomer(String(customer._id));

  }

  toggleActive(customer: Customer) {

  }
}
