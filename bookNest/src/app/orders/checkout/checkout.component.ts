import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CheckoutService } from '../checkout.service';
import { CartService } from 'src/app/cart.service';
import { AuthService } from 'src/app/auth/auth.service';
import { CustomersService } from 'src/app/customers/customer.service';
import { CurrentUserData } from 'src/app/models/CurrentUser.Data';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  cart: any = null;
  shippingForm: FormGroup;
  loading = false;
  error = '';
  orderComplete = false;
  orderId: string | null = null;


  isAuthenticated = false;
  currentUserData !: CurrentUserData;


  constructor(
    private checkoutService: CheckoutService,
    private cartService: CartService,
    private authService: AuthService,
    private customerService: CustomersService,
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
  }

  ngOnInit(): void {
    this.fetchCart();


    this.authService.isAuthenticated$().subscribe(
      isAuth => this.isAuthenticated = isAuth
    );


  }

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

  onSubmit(): void {
    if (this.shippingForm.valid) {
      this.loading = true;
      this.error = '';

      this.checkoutService.createOrder(this.shippingForm.value).subscribe({
        next: (order) => {
          this.orderId = order._id;
          this.orderComplete = true;
          console.log(order)
        },
        error: (err) => {
          this.error = err.error?.error || 'Failed to create order';

        },
        complete: () => this.loading = false
      });
    }
  }

}
