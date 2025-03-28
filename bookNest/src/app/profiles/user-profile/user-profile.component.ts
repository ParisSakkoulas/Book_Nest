import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, Observable, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { CustomersService } from 'src/app/customers/customer.service';
import { MessageDialogService } from 'src/app/message.dialog/message-dialog.service';
import { CurrentUserData } from 'src/app/models/CurrentUser.Data';
import { SpinnerService } from 'src/app/spinner/spinner.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  // Track active profile section
  activeButton: string = 'Info';

  // Store current user data
  currentUserData !: CurrentUserData;

  // Form groups for different profile sections
  passwordForm !: FormGroup;
  customerInfoForm!: FormGroup;
  profileForm: FormGroup;
  hidePassword = true;
  customerId = '';

  // Password visibility flags
  public showPassword: boolean = false;


  constructor(private spinnerService: SpinnerService, private messageService: MessageDialogService, private fb: FormBuilder, private authService: AuthService, private customerService: CustomersService) {
    this.profileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      asyncValidators: [this.emailExistsValidator()],
      updateOn: 'blur'
    });

    this.passwordForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/),

      ]],
      confirm_password: ['', [Validators.required, this.passwordMatchValidator]]


    });

    this.passwordForm.addValidators(this.passwordMatchValidator());


    this.customerInfoForm = this.fb.group({
      // Always Required
      firstName: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],


      // Required for contact - at least one of email or phone must be provided
      phoneNumber: ['', [
        Validators.pattern(/^$|^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
      ]],
      street: ['',],
      city: ['',],
      state: ['',],
      zipCode: ['',],
      country: ['',],

    });

  }

  // Initialize component and load user data
  ngOnInit() {


    this.authService.getCurrentUser().subscribe(
      user => {
        if (user) {
          this.currentUserData = user;
          this.profileForm.patchValue({
            email: this.currentUserData.email
          });

          this.customerService.getCustomerFromUser(this.currentUserData.user_id).subscribe({
            next: (response) => {
              console.log(response)

              this.customerInfoForm.patchValue({
                firstName: this.currentUserData.firstName,
                lastName: this.currentUserData.lastName,
                phoneNumber: response.customerInfo.phoneNumber,
                street: response.customerInfo.street,
                city: response.customerInfo.city,
                state: response.customerInfo.state,
                zipCode: response.customerInfo.zipCode,
                country: response.customerInfo.country,
              });

              this.customerId = response.customerInfo._id
            }
          })

        }
      }
    );




    this.profileForm.get('email')?.valueChanges.pipe(
      debounceTime(500), // Wait 500ms after last keystroke
      distinctUntilChanged() // Only check if value changed
    ).subscribe(email => {
      if (email &&
        email !== this.currentUserData.email &&
        this.profileForm.get('email')?.valid) {
        this.authService
          .checkEmail(email, this.currentUserData.user_id)
          .subscribe({
            next: (response) => {

              if (response.exists) {
                this.profileForm.get('email')?.setErrors({ 'emailExists': true });
              }
            },
            error: (error) => {

              console.error('Error checking email:', error);
            }
          });
      } else {
      }
    });

  }

  // Get user initials for user image
  getUserInitials(): string {
    return this.currentUserData.email[0].toUpperCase();
  }

  // Switch between profile sections
  showDiv(buttonName: string): void {
    this.activeButton = buttonName;
  }

  // Update customer profile information
  onChangeCustomerInfo() {
    if (!this.profileForm.valid) {
      return;
    }

    const registerUserData = {
      firstName: this.customerInfoForm.value.firstName,
      lastName: this.customerInfoForm.value.lastName,
      email: this.customerInfoForm.value.email,
      phoneNumber: this.customerInfoForm.value.phoneNumber || undefined,
      address: {
        street: this.customerInfoForm.value.street,
        city: this.customerInfoForm.value.city,
        state: this.customerInfoForm.value.state,
        zipCode: this.customerInfoForm.value.zipCode,
        country: this.customerInfoForm.value.country,
      }
    }

    this.customerService.updateSingleCustomer(this.customerId, registerUserData);
  }

  // Update email address
  onChnageEmail() {
    this.spinnerService.show();

    this.authService.updateEmail(this.currentUserData.user_id, this.profileForm.value.email).subscribe({
      next: (response) => {
        this.spinnerService.hide();

        this.messageService.showSuccess(response.message || 'Email changed successfully');

      },
      error: (error) => {
        this.spinnerService.hide();

        const errorMessage = error.error?.message || error.message || 'Failed to add customer';
        this.messageService.showError(errorMessage);
      }
    });

  }

  // Toggle password visibility
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Update password
  onChangePassword() {

    this.spinnerService.show();

    this.authService.updatePassword(this.currentUserData.user_id, this.passwordForm.value.password).subscribe({
      next: (response) => {
        this.spinnerService.hide();

        this.messageService.showSuccess(response.message || 'Password changed successfully');

      },
      error: (error) => {
        this.spinnerService.hide();

        const errorMessage = error.error?.message || error.message || 'Failed to add customer';
        this.messageService.showError(errorMessage);
      }
    });

  }


  //Custome validator for check password with confirm password
  private passwordMatchValidator() {
    return () => {
      if (!this.passwordForm) return null;

      const password = this.passwordForm.get('password');
      const confirmPassword = this.passwordForm.get('confirm_password');

      if (!password || !confirmPassword) return null;

      if (confirmPassword.value === '') return null;

      return password.value === confirmPassword.value ? null : { passwordMismatch: true };
    };
  }

  // Private helper methods
  private emailExistsValidator() {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return this.authService
        .checkEmail(control.value, this.currentUserData.user_id)
        .pipe(
          debounceTime(300),
          map(response => {
            return response.exists ? { emailExists: true } : null;
          })
        );
    };
  }

  get email() { return this.profileForm.get('email'); }
  get password() { return this.profileForm.get('password'); }

}
