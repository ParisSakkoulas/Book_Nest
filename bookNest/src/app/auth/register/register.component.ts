import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { MessageDialogService } from 'src/app/message.dialog/message-dialog.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  //The registration form
  signUpForm: any;

  //To show and hide password input
  public showPassword: boolean = false;

  constructor(private messageService: MessageDialogService, private formBuilder: FormBuilder, private authService: AuthService) { }

  ngOnInit(): void {

    this.signUpForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern('^(?=.*[A-Z].*[A-Z])(?=.*[!@#$&*])(?=.*[0-9].*[0-9])(?=.*[a-z].*[a-z].*[a-z]).{8,}$')]],
      confirm_password: ['', [Validators.required, this.passwordMatchValidator]]
    });

    this.signUpForm.addValidators(this.passwordMatchValidator());

  }


  onRegister() {

    if (this.signUpForm.valid) {

      const registerUserData = {
        email: this.signUpForm.value.email,
        password: this.signUpForm.value.password,
        firstName: this.signUpForm.value.firstName,
        lastName: this.signUpForm.value.lastName,
      }

      this.authService.registerNewUser(registerUserData);

    }
    else {
      this.signUpForm.touched();
    }

  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }


  private passwordMatchValidator() {
    return () => {
      if (!this.signUpForm) return null;

      const password = this.signUpForm.get('password');
      const confirmPassword = this.signUpForm.get('confirm_password');

      if (!password || !confirmPassword) return null;

      if (confirmPassword.value === '') return null;

      return password.value === confirmPassword.value ? null : { passwordMismatch: true };
    };
  }


  // Helper methods for template
  getErrorMessage(controlName: string): string {
    const control = this.signUpForm.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
    }
    if (control.hasError('email')) {
      return 'Please enter a valid email address';
    }

    if (control.hasError('firstName')) {
      return 'Please enter your first name';
    }

    if (control.hasError('lastName')) {
      return 'Please enter your last name';
    }

    if (control.hasError('pattern') && controlName === 'phoneNumber') {
      return 'Please enter a valid phone number';
    }

    if (control.hasError('pattern') && controlName === 'password') {
      return 'Password must contain 2 uppercase letters, 1 special character, 2 numbers, 3 lowercase letters, and be at least 8 characters long';
    }
    if (control.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }
}
