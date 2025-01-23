import { Injectable } from '@angular/core';
import { AuthData } from '../models/LoginData';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SpinnerService } from '../spinner/spinner.service';
import { MessageDialogService } from '../message.dialog/message-dialog.service';
import { BehaviorSubject } from 'rxjs';
import { RegisterModel } from '../models/Register.Model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //BehaviorSubject remembers the current value and emits it to new subscribers
  private isAuthenticated = new BehaviorSubject<boolean>(false);

  // Timer to handle auto-logout
  private tokenExpirationTimer: any;

  // Keys for localStorage
  private tokenKey = 'token';
  private expirationKey = 'expiration';


  //To get the current user
  private currentUser = new BehaviorSubject<any>(null);


  constructor(private router: Router, private spinnerService: SpinnerService, private http: HttpClient, private messageService: MessageDialogService) { }


  ngOnInit() {

    this.autoLogin();
  }

  login(email: string, password: string) {

    this.spinnerService.show();
    this.http.post<{ message: string, token: string, expiresIn: number, user: { user_id: string, firstName?: string, lastName?: string, email: string, role: string } }>('http://localhost:3000/api/auth/login', { email, password })
      .subscribe({
        next: (response) => {
          if (response.token) {


            console.log(response)

            // Calculate expiration date
            const expirationDate = new Date(
              new Date().getTime() + response.expiresIn * 1000
            );


            // Save user data along with token
            localStorage.setItem('userData', JSON.stringify(response.user));

            //Inform subscribers
            this.currentUser.next(response.user);


            // Save auth data
            this.saveAuthData(response.token, expirationDate);

            // Set authentication state
            this.isAuthenticated.next(true);

            // Set auto logout timer
            this.autoLogout(response.expiresIn * 1000);

            // Navigate to home/dashboard
            this.router.navigate(['/']);

            // Show success message
            this.messageService.showSuccess('Login successful!');
            this.spinnerService.hide();

          }
        },
        error: (error) => {
          this.messageService.showError(error.error.message || 'Login failed');
          this.spinnerService.hide();

        }
      });
  }

  registerNewUser(newUserData: RegisterModel) {


    this.spinnerService.show();
    this.http.post<{ message: string }>("http://localhost:3000/api/auth/register", newUserData).subscribe({
      next: (registerResponse) => {

        console.log(registerResponse)

        this.spinnerService.hide();
        this.messageService.showSuccess(registerResponse.message);


      },
      error: (registrationError) => {

        this.messageService.showError(registrationError.error.message || 'Register failed');
        this.spinnerService.hide();


      }
    })


  }


  verifyUser(verificationCode: any) {

    this.http.get<{ message: string, type: string }>("http://localhost:3000/api/auth/verify/" + verificationCode).subscribe({
      next: (response) => {
        console.log(response);
        this.messageService.showSuccess(response.message);

      }
    })

  }


  private saveAuthData(token: string, expirationDate: Date) {

    // Store the JWT token in localStorage
    localStorage.setItem(this.tokenKey, token);

    // Store the expiration date as an ISO string
    localStorage.setItem(this.expirationKey, expirationDate.toISOString());
  }

  private getAuthData() {
    const token = localStorage.getItem(this.tokenKey);
    const expirationDate = localStorage.getItem(this.expirationKey);

    if (!token || !expirationDate) {
      return null;
    }

    return {
      token: token,
      expirationDate: expirationDate
    };
  }

  private autoLogout(duration: number) {

    // Clear any existing timer to prevent multiple timers
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
      this.messageService.showInfo('Session Expired. Please login again.');
    }, duration);
  }

  // Handle auto-login on page refresh
  autoLogin() {


    const authData = this.getAuthData();
    const userData = this.getUserData();
    if (!authData) {
      return;
    }

    const expirationDate = new Date(authData.expirationDate);
    const now = new Date();

    // Calculate remaining time
    const expiresIn = expirationDate.getTime() - now.getTime();

    // If token hasn't expired yet
    if (expiresIn > 0) {
      this.isAuthenticated.next(true);
      this.autoLogout(expiresIn);
      this.currentUser.next(userData);

    } else {
      this.logout();
    }
  }

  private clearAuthData() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.expirationKey);
    localStorage.removeItem('userData');
    this.currentUser.next(null);
  }

  getToken(): string | null {
    const authData = this.getAuthData();
    return authData ? authData.token : null;
  }


  getCurrentUser() {
    return this.currentUser.asObservable();
  }

  getUserData() {
    return JSON.parse(localStorage.getItem('userData') || 'null');
  }

  isAdmin(): boolean {
    const userData = this.getUserData();
    return userData?.role === 'ADMIN';
  }



  isAuthenticated$() {
    return this.isAuthenticated.asObservable();
  }

  logout() {
    // Clear auth data
    this.clearAuthData();

    // Update authentication state
    this.isAuthenticated.next(false);

    // Clear logout timer
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;

    // Navigate to login
    this.router.navigate(['/auth/login']);
  }
}
