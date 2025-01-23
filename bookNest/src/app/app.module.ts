import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { MessageDialogComponent } from './message.dialog/message.dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { SpinnerComponent } from './spinner/spinner.component';
import { MatMenuModule } from '@angular/material/menu';
import { AuthInterceptor } from './auth/auth.interceptor';
import { CostumersComponent } from './customers/customers.component';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { HomeComponent } from './home/home.component';
import { CreateCustomerComponent } from './customers/create-customer/create-customer.component';
import { MatSelectModule } from '@angular/material/select';
import { ViewCustomerComponent } from './customers/view-customer/view-customer.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { BooksComponent } from './books/books/books.component';
import { CreateBookComponent } from './books/create-book/create-book.component';
import { AdminDashboardComponent } from './dashboads/admin-dashboard/admin-dashboard.component';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { AdminDashboardOrverviewComponent } from './dashboads/admin-dashboard-orverview/admin-dashboard-orverview.component';
import { UserDashboardComponent } from './dashboads/user-dashboard/user-dashboard.component';
import { UserProfileComponent } from './profiles/user-profile/user-profile.component';
import { BookComponent } from './books/book/book.component';



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    MessageDialogComponent,
    SpinnerComponent,
    CostumersComponent,
    HomeComponent,
    CreateCustomerComponent,
    ViewCustomerComponent,
    BooksComponent,
    CreateBookComponent,
    AdminDashboardComponent,
    AdminDashboardOrverviewComponent,
    UserDashboardComponent,
    UserProfileComponent,
    BookComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatFormFieldModule,
    MatDialogModule,
    FormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatInputModule,
    MatMenuModule,
    MatListModule,
    MatPaginatorModule,
    MatSelectModule,
    MatChipsModule,
    MatExpansionModule,
    MatDividerModule,
    MatBadgeModule,
    MatSidenavModule,
    MatTableModule,
    MatTabsModule



  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
