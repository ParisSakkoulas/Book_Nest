import { Injectable } from '@angular/core';
import { AuthData } from '../models/LoginData';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SpinnerService } from '../spinner/spinner.service';
import { MessageDialogService } from '../message.dialog/message-dialog.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { RegisterModel } from '../models/Register.Model';
import { environment } from 'src/environments/environment';
import { CartService } from '../cart.service';

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


  //Base url
  private baseUrl = environment.baseUrl;

  //Local url
  //private localUrl = environment.localUrl;


  constructor(private router: Router, private spinnerService: SpinnerService, private http: HttpClient, private messageService: MessageDialogService) { }


  ngOnInit() {

    // Attempts auto-login on initialization
    this.autoLogin();

  }

  // Handles user login process
  login(email: string, password: string) {

    this.spinnerService.show();
    this.http.post<{
      message: string,
      token: string,
      expiresIn: number,
      user: {
        user_id: string, firstName?: string, lastName?: string, email: string, role: string
      }
    }>(`${this.baseUrl}/auth/login`, { email, password })
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
            this.router.navigate(['/books']);

            // Show success message
            this.messageService.showSuccess('Login successful!');
            this.spinnerService.hide();

            localStorage.removeItem('x-session-id');

            //Clear session in case of successful login
            //this.cartService.clearVisitorSession();


          }
        },
        error: (error) => {
          this.messageService.showError(error.error.message || 'Login failed');
          this.spinnerService.hide();

        }
      });
  }

  // Registers new user account
  registerNewUser(newUserData: RegisterModel) {


    this.spinnerService.show();
    this.http.post<{ message: string }>
      (`${this.baseUrl}/auth/register`, newUserData).subscribe({
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

  // Verifies user email
  verifyUser(verificationCode: any) {

    this.http.get<{ message: string, type: string }>(`${this.baseUrl}/auth/verify/${verificationCode}`).subscribe({
      next: (response) => {
        console.log(response);
        this.messageService.showSuccess(response.message);

      }
    })

  }

  // Stores authentication data in localStorage
  private saveAuthData(token: string, expirationDate: Date) {

    // Store the JWT token in localStorage
    localStorage.setItem(this.tokenKey, token);

    // Store the expiration date as an ISO string
    localStorage.setItem(this.expirationKey, expirationDate.toISOString());
  }

  // Retrieves stored auth data
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

  // Sets timer for automatic logout
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

  // Removes all auth data from storage
  private clearAuthData() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.expirationKey);
    localStorage.removeItem('userData');
    this.currentUser.next(null);
  }

  // Gets current authentication token
  getToken(): string | null {
    const authData = this.getAuthData();
    return authData ? authData.token : null;
  }


  // Returns current user as observable
  getCurrentUser() {
    return this.currentUser.asObservable();
  }

  // Gets stored user data
  getUserData() {
    return JSON.parse(localStorage.getItem('userData') || 'null');
  }

  // Checks if current user is admin
  isAdmin(): boolean {
    const userData = this.getUserData();
    return userData?.role === 'ADMIN';
  }


  //Returns authentication state as observable
  isAuthenticated$() {
    return this.isAuthenticated.asObservable();
  }

  // Validates email availability
  checkEmail(email: string, currentUserId?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/checkEmail`, {
      email,
      currentUserId
    });
  }

  // Updates user email address
  updateEmail(userId: string, newEmail: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/auth/updateEmail`, {
      userId,
      email: newEmail
    }).pipe(
      tap(response => {
        // Get current user data from localStorage
        const userData = this.getUserData();
        if (userData) {
          // Update only the email while keeping other data
          const updatedUserData = {
            ...userData,
            email: newEmail
          };

          // Update localStorage
          localStorage.setItem('userData', JSON.stringify(updatedUserData));

          // Update currentUser BehaviorSubject
          this.currentUser.next(updatedUserData);
        }
      })
    );
  }

  // Updates user password
  updatePassword(userId: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/auth/updatePassword`, { userId, password: newPassword });
  }

  // Handles user logout
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
