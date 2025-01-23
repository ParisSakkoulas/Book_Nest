import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  activeButton: string = 'Info';


  profileForm: FormGroup;
  hidePassword = true;
  user = {
    email: 'user@example.com',
    role: 'USER',
    status: 'ACTIVE'
  };

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/)
      ]]
    });
  }

  ngOnInit() {
    this.profileForm.patchValue({
      email: this.user.email
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

  get email() { return this.profileForm.get('email'); }
  get password() { return this.profileForm.get('password'); }

}
