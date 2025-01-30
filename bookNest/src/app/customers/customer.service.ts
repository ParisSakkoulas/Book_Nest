import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SpinnerService } from '../spinner/spinner.service';
import { Customer } from '../models/Customer.Model';
import { MessageDialogService } from '../message.dialog/message-dialog.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {


  private customers: Customer[] = [];
  private customersSubject = new BehaviorSubject<Customer[]>([]);
  private paginationSubject = new BehaviorSubject<{ limit: number, page: number, pages: number, total: number }>({ limit: 10, page: 1, pages: 1, total: 0 });


  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, private spinnerService: SpinnerService, private messageService: MessageDialogService
  ) { }

  getCustomers(params: { page: number; limit: number; search?: string; customerStatus?: string; isActive?: string; }) {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('limit', params.limit.toString());

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.customerStatus) {
      httpParams = httpParams.set('customerStatus', params.customerStatus);
    }
    if (params.isActive !== undefined && params.isActive !== '') {
      httpParams = httpParams.set('isActive', params.isActive);
    }

    this.spinnerService.show();
    this.http.get<{
      success: boolean,
      data: {
        customers: Customer[],
        pagination: { limit: number, page: number, pages: number, total: number }
      }
    }>
      (`${this.baseUrl}/customers/all`, { params: httpParams }).subscribe({

        next: (response) => {
          this.spinnerService.hide();
          console.log(response.data.customers)


          this.customers = response.data.customers.map(customerItem => {
            return {
              _id: customerItem._id,
              firstName: customerItem.firstName,
              lastName: customerItem.lastName,
              email: customerItem.user?.email,
              phoneNumber: customerItem.phoneNumber,
              customerStatus: customerItem.customerStatus,
              isActive: customerItem.isActive,
              address: customerItem.address,
              createdAt: customerItem.createdAt,
              updatedAt: customerItem.updatedAt,
              user: customerItem.user,

            }
          })

          this.customersSubject.next(this.customers);
          this.paginationSubject.next(response.data.pagination);
        },
        error: (err) => {
          console.log(err)
          this.messageService.showError(err.error.message || 'Fetching customers failed. Please try again.');
          this.spinnerService.hide();
        }
      });
  }

  getCurrentCustomers(): Observable<Customer[]> {
    return this.customersSubject.asObservable();
  }

  getPagination(): Observable<{ limit: number, page: number, pages: number, total: number }> {
    return this.paginationSubject.asObservable();
  }

  createNewCustomer(createCustomerData: { firstName: string, lastName: string, email?: string, phoneNumber?: string, address?: { street: string, state: string, zipCode: string, country: string } }) {


    this.spinnerService.show();

    this.http.post<{
      message: string,
      success: boolean,
      data: {
        customer: {
          _id: string,
          firstName: string,
          lastName: string,
          phoneNumber: string,
          address: {
            street: string,
            city: string,
            state: string,
            zipCode: string,
            country: string
          },
          customerStatus: string,
          isActive: boolean
        }
      }
    }>(`${this.baseUrl}/customers/create`, createCustomerData).subscribe({
      next: (response) => {

        console.log(response)

        if (response.success) {


          this.customers.push({
            _id: response.data.customer._id,
            firstName: response.data.customer.firstName,
            lastName: response.data.customer.lastName,
            phoneNumber: response.data.customer.phoneNumber,
            address: {
              street: response.data.customer.address.street,
              city: response.data.customer.address.city,
              state: response.data.customer.address.state,
              zipCode: response.data.customer.address.zipCode,
              country: response.data.customer.address.country
            },
            customerStatus: response.data.customer.customerStatus,
            isActive: response.data.customer.isActive
          });

          this.customersSubject.next(this.customers);
          this.messageService.showSuccess(response.message || 'Customer created successfully');
          this.spinnerService.hide();
        }




      },
      error: (error) => {
        this.spinnerService.hide();

        const errorMessage = error.error?.message || error.message || 'Failed to add customer';
        this.messageService.showError(errorMessage);
      }
    })



  }


  getSingleCustomer(customerId: string) {
    return this.http.get<{
      success: boolean,
      Customer:
      {
        _id: string,
        firstName: string,
        lastName: string,
        phoneNumber: string,
        address?: { street: string, city: string, state: string, zipCode: string, country: string },
        user?: {
          email: string;
          status: string,
        },
        customerStatus: string,
        isActive: boolean,
        createdAt: string,
        updatedAt: string,

      }
    }>(
      `${this.baseUrl}/customers/${customerId}`);
  }


  deleteSingleCustomer(customerId: string) {





    this.spinnerService.show();
    this.http.delete<{ success: boolean, Customer: { _id: any }, message: string }>(`${this.baseUrl}/customers/${customerId}`).subscribe({
      next: (response) => {



        // Update customers array
        this.customers = this.customers.filter(customer => customer._id !== customerId);


        // update total in pagination
        const currentPagination = this.paginationSubject.value;
        this.paginationSubject.next({
          ...currentPagination,
          total: currentPagination.total - 1
        });

        //Inform subscribers
        this.customersSubject.next(this.customers);
        this.spinnerService.hide();
        this.messageService.showSuccess(response.message);



      },

      error: (error) => {
        console.log(error)
        this.spinnerService.hide();
        const errorMessage = error.error?.message || error.message || 'Failed to delete customer';
        this.messageService.showError(errorMessage);
      }
    })

  }

  updateSingleCustomer(customerId: string, customer: any) {


    console.log(customer)
    this.spinnerService.show();
    this.http.put<{ message: string, status: boolean, data: { customer: Customer } }>(`${this.baseUrl}/customers/${customerId}`, customer).subscribe({

      next: (response) => {

        console.log(response)

        //update customer array
        this.customers = this.customers.map(customerItem =>
          customerItem._id === customerId ? response.data.customer : customerItem
        );

        console.log(this.customers)

        //inform subscribers
        this.customersSubject.next(this.customers);

        this.messageService.showSuccess(response.message || 'Customer updated successfully');
        this.spinnerService.hide();

      },

      error: (error) => {
        this.spinnerService.hide();
        const errorMessage = error.error?.message || error.message || 'Failed to add customer';
        this.messageService.showError(errorMessage);
      }
    })

  }


  updateUserAccountStatus(customerId: string, newStatus: any) {

    console.log(customerId);
    console.log(newStatus);


    return this.http.patch<{ message: string, status: any }>('http://localhost:3000/api/auth/verify/' + customerId, { newStatus: newStatus });
  }

  resentVerificationCode(customerId: any) {
    return this.http.get<{ message: string }>(`${this.baseUrl}/auth/sentLink/${customerId}`);
  }


  getCustomerFromUser(userId: any) {
    return this.http.get<{ message: string, customerInfo: { _id?: any, phoneNumber?: string, street: string, city: string, state: string, zipCode: string, country: string } }>(`${this.baseUrl}/customers/customerFromUser/${userId}`);
  }


  updateAddressInfoCustomer(customerId: string, customerAddressInfo: any) {

  }

}
