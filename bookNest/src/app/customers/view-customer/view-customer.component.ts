import { Component, OnInit } from '@angular/core';
import { Customer } from 'src/app/models/Customer.Model';
import { CustomersService } from '../customer.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { catchError, filter, map, of, Subscription, switchMap, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { SpinnerService } from 'src/app/spinner/spinner.service';
import { MessageDialogService } from 'src/app/message.dialog/message-dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateCustomerComponent } from '../create-customer/create-customer.component';
import { error } from 'console';

@Component({
  selector: 'app-view-customer',
  templateUrl: './view-customer.component.html',
  styleUrls: ['./view-customer.component.css']
})
export class ViewCustomerComponent implements OnInit {


  customer !: { _id: string, firstName: string, user?: { email: string; status: string }, lastName: string, phoneNumber: string, address?: { street: string, city: string, state: string, zipCode: string, country: string }, customerStatus: string, isActive: boolean, createdAt: string, updatedAt: string };
  private paramMapSubscription!: Subscription;

  activeTab: 'info' | 'orders' = 'info';

  //For the status
  userStatuses: string[] = [
    'Active',
    'Inactive',
    'Email Verification Pending',
    'New Customer Account (Unverified)',
    'New Customer Account (Verified)'
  ];
  selectedStatus !: string | undefined;

  constructor(private dialog: MatDialog, private messageService: MessageDialogService, private customerService: CustomersService, public route: ActivatedRoute, private spinnerService: SpinnerService) { }



  ngOnInit(): void {




    this.spinnerService.show();
    this.paramMapSubscription = this.route.paramMap.pipe(
      map(paramMap => paramMap.get('customerId')),
      filter((customerId): customerId is string => customerId !== null),
      switchMap(customerId =>

        this.customerService.getSingleCustomer(customerId).pipe(
          catchError((error: HttpErrorResponse) => {
            // Check if the error response contains success data
            if (error.error?.success && error.error?.Customer) {
              // If it does, return the error.error as the successful response
              return of(error.error);
            }
            // If not, propagate the error
            return throwError(() => error);
          })
        )
      )
    ).subscribe({
      next: (response) => {
        if (response.Customer) {
          this.customer = response.Customer;
          this.spinnerService.hide();

          this.selectedStatus = this.customer.user?.status;

          console.log(this.customer.user)
        }
      },
      error: (error) => {
        console.error('Error fetching customer:', error);
        // Handle actual errors here
      }
    });



  }


  getStatusColor(): string {
    return this.customer.customerStatus === 'REGISTERED' ? '#4CAF50' : '#FF9800';
  }


  resendVerification() {

    this.spinnerService.show();
    this.customerService.resentVerificationCode(this.customer._id).subscribe({
      next: (response) => {
        this.messageService.showInfo(response.message || 'Link sent to user. Inform the user!')
        this.spinnerService.hide();

      }
    })

  }


  updateUserStatus() {

    console.log(this.selectedStatus)

    this.spinnerService.show();
    this.customerService.updateUserAccountStatus(this.customer._id, this.selectedStatus).subscribe({
      next: (response) => {

        this.messageService.showSuccess(response.message);
        this.spinnerService.hide();


      },
      error: (error) => {
        this.spinnerService.hide();
        console.log(error)
        const errorMessage = error.error?.message || error.message || 'Failed to chage user status';
        this.messageService.showError(errorMessage);
      }
    })

  }

  toggleAccountStatus() {

  }
  convertToRegistered() {

  }

  editCustomer() {

    const customer = this.customer
    const dialogRef = this.dialog.open(CreateCustomerComponent, {
      width: '500px',
      disableClose: true,
      data: { customer }// Add any data you want to pass to the dialog
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.customerService.getSingleCustomer(this.customer._id).subscribe({
          next: (response) => {
            if (response.Customer) {
              this.customer = response.Customer;
            }
          }
        });

      }
    })

  }



  deleteCustomer() {

    this.customerService.deleteSingleCustomer(String(this.customer._id));

  }



}
