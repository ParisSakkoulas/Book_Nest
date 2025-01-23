import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { CostumersComponent } from './customers/customers.component';
import { HomeComponent } from './home/home.component';
import { ViewCustomerComponent } from './customers/view-customer/view-customer.component';
import { AuthGuard } from './auth/auth.guard';
import { IsAdminGuard } from './auth/is-admin.guard';
import { AdminDashboardComponent } from './dashboads/admin-dashboard/admin-dashboard.component';
import { AdminDashboardOrverviewComponent } from './dashboads/admin-dashboard-orverview/admin-dashboard-orverview.component';
import { UserDashboardComponent } from './dashboads/user-dashboard/user-dashboard.component';
import { UserProfileComponent } from './profiles/user-profile/user-profile.component';
import { BooksComponent } from './books/books/books.component';
import { BookComponent } from './books/book/book.component';


const routes: Routes = [



  //DashBoard Routes
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: AdminDashboardOrverviewComponent },
      //{ path: 'products', component: ProductsComponent },
      { path: 'customers', component: CostumersComponent },
      // Add other routes
    ],
    canActivate: [AuthGuard, IsAdminGuard]
  },




  //DashBoard Routes
  {
    path: 'user',
    children: [
      { path: 'dashboard', component: UserDashboardComponent },
      { path: 'profile', component: UserProfileComponent },


    ],
    canActivate: [AuthGuard]
  },


  //DashBoard Routes
  {
    path: 'books',
    children: [
      { path: '', component: BooksComponent },
      { path: ':bookId', component: BookComponent },


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
