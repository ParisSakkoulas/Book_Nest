import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CheckoutService } from '../checkout.service';
import { CartService } from 'src/app/cart.service';
import { AuthService } from 'src/app/auth/auth.service';
import { CustomersService } from 'src/app/customers/customer.service';
import { CurrentUserData } from 'src/app/models/CurrentUser.Data';
import { response } from 'express';
import { SpinnerService } from 'src/app/spinner/spinner.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {


  // Cart data
  cart: any = null;

  // Form groups for shipping addresses
  shippingForm: FormGroup;// For authenticated users
  shippingVisitorForm: FormGroup; // For visitors

  // State flags
  loading = false;
  error = '';
  orderComplete = false;
  orderId: string | null = null;

  // Current user information
  isAuthenticated = false;
  currentUserData !: CurrentUserData;


  constructor(
    private checkoutService: CheckoutService,
    private cartService: CartService,
    private authService: AuthService,
    private customerService: CustomersService,
    private spinnerService: SpinnerService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.shippingForm = this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['', Validators.required]
    });


    this.shippingVisitorForm = this.fb.group({
      email: ['', Validators.required],
      firstName: [''],
      lastName: [''],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['', Validators.required]
    });


  }

  // Initialize component and check authentication
  ngOnInit(): void {
    this.fetchCart();


    this.authService.isAuthenticated$().subscribe(
      isAuth => this.isAuthenticated = isAuth
    );


  }

  // Load cart data and pre-fill address if authenticated
  fetchCart(): void {
    this.cartService.getCart().subscribe({
      next: (data) => {
        console.log(data)
        this.cart = data;

        if (this.isAuthenticated) {

          this.customerService.getCustomerFromUser(this.cart.userId).subscribe({
            next: (response) => {

              this.shippingForm.patchValue({
                street: response.customerInfo.street,
                city: response.customerInfo.city,
                state: response.customerInfo.state,
                zipCode: response.customerInfo.zipCode,
                country: response.customerInfo.country,
              })
              console.log(response)

            },
            error: (err) => {
              console.log(err)
            }
          })
        }
      },
      error: () => { }
    });
  }

  // Submit order with appropriate form data
  onSubmit(): void {
    if (this.isAuthenticated) {
      if (this.shippingForm.valid) {
        this.loading = true;
        this.error = '';

        this.spinnerService.show();

        this.checkoutService.createOrder({
          shippingAddress: this.shippingForm.value
        }).subscribe({
          next: (order) => {
            this.orderId = order._id;
            this.orderComplete = true;
            this.cartService.clearCart().subscribe({
              next: (response) => { },
              error: (error) => { console.log(error) }
            })

            this.spinnerService.hide();


          },
          error: (err) => {
            this.error = err.error?.error || 'Failed to create order';
          },
          complete: () => this.loading = false
        });
      }
    } else {
      // Handle visitor checkout
      if (this.shippingVisitorForm.valid) {
        this.loading = true;
        this.error = '';

        const formValue = this.shippingVisitorForm.value;

        // Separate shipping address and visitor info
        const orderData = {
          shippingAddress: {
            street: formValue.street,
            city: formValue.city,
            state: formValue.state,
            zipCode: formValue.zipCode,
            country: formValue.country
          },
          visitorInfo: {
            email: formValue.email,
            firstName: formValue.firstName,
            lastName: formValue.lastName
          }
        };

        this.checkoutService.createOrder(orderData).subscribe({
          next: (order) => {
            this.orderId = order._id;
            this.orderComplete = true;

            // Clear visitor session after successful order
            this.cartService.clearVisitorSession();
          },
          error: (err) => {
            this.error = err.error?.error || 'Failed to create order';
            console.log(err)
          },
          complete: () => this.loading = false
        });
      }
    }
  }

}
