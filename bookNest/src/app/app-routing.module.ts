import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { CostumersComponent } from './customers/customers.component';
import { HomeComponent } from './home/home.component';
import { ViewCustomerComponent } from './customers/view-customer/view-customer.component';
import { AuthGuard } from './auth/auth.guard';
import { IsAdminGuard } from './auth/is-admin.guard';
import { UserProfileComponent } from './profiles/user-profile/user-profile.component';
import { BooksComponent } from './books/books/books.component';
import { BookComponent } from './books/book/book.component';
import { CreateBookComponent } from './books/create-book/create-book.component';
import { CheckoutComponent } from './orders/checkout/checkout.component';
import { MyOrdersComponent } from './orders/my-orders/my-orders.component';
import { SingleOrderComponent } from './orders/single-order/single-order.component';
import { AllOrdersComponent } from './orders/all-orders/all-orders.component';


const routes: Routes = [





  //DashBoard Routes
  {
    path: 'user',
    children: [
      { path: 'profile', component: UserProfileComponent },

    ],
    canActivate: [AuthGuard]
  },


  //DashBoard Routes
  {
    path: 'books',
    children: [
      { path: '', component: BooksComponent },
      { path: 'create', component: CreateBookComponent, canActivate: [AuthGuard, IsAdminGuard] },
      { path: 'create/:bookId', component: CreateBookComponent, canActivate: [AuthGuard, IsAdminGuard] },
      { path: ':bookId', component: BookComponent }
    ]
  },


  //Customer Routes
  {
    path: 'customers',
    children: [

      { path: 'list', component: CostumersComponent },
      { path: 'view/:customerId', component: ViewCustomerComponent },

    ],
    canActivate: [AuthGuard, IsAdminGuard]
  },


  //Customer Routes
  {
    path: 'public',
    children: [

      { path: 'home', component: HomeComponent },
    ]
  },


  {
    path: 'orders',
    children: [

      { path: 'checkout', component: CheckoutComponent },
      { path: 'order/:orderId', component: SingleOrderComponent },
      { path: 'myOrders', component: MyOrdersComponent, canActivate: [AuthGuard] },
      { path: 'all', component: AllOrdersComponent, canActivate: [AuthGuard, IsAdminGuard] },


    ]
  },

  //Auth Routes
  {
    path: 'auth',
    children: [

      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'login/verify/:token', component: LoginComponent },

    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {







}
