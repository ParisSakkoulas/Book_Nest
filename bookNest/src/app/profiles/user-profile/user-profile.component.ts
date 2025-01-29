import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { CurrentUserData } from 'src/app/models/CurrentUser.Data';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  activeButton: string = 'Info';
  currentUserData !: CurrentUserData;

  passwordForm !: FormGroup;
  customerInfoForm!: FormGroup;
  profileForm: FormGroup;
  hidePassword = true;

  user = {
    email: 'user@example.com',
    role: 'USER',
    status: 'ACTIVE'
  };

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.profileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],

    });

    this.passwordForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/)
      ]],
      confirm_password: ['', [Validators.required, this.passwordMatchValidator]]


    });


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

  ngOnInit() {


    this.authService.getCurrentUser().subscribe(
      user => {
        if (user) {
          console.log(user)
          this.currentUserData = user;
        }
      })


    this.profileForm.patchValue({
      email: this.currentUserData.email
    });
  }

  getUserInitials(): string {
    return this.user.email[0].toUpperCase();
  }


  // This method sets the active button
  showDiv(buttonName: string): void {
    this.activeButton = buttonName;
  }

  onSubmit() {
    if (this.profileForm.valid) {
      console.log(this.profileForm.value);
    }
  }

  onChnageEmail() {

  }

  onChangePassword() {

  }

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

  get email() { return this.profileForm.get('email'); }
  get password() { return this.profileForm.get('password'); }

}
