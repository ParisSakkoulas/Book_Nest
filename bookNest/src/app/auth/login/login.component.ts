import { Component, OnInit } from '@angular/core';
import { FormBuilder, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatDialogConfig } from '@angular/material/dialog';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {


  ///Toogle password visibility
  public showPassword: boolean = false;


  //For veryfication user profiles
  private verificationCode: any;

  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private authService: AuthService) { }

  ngOnInit(): void {

    //Check if token exitst on the URL and saves it on verificationCode variable
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.verificationCode = paramMap.get('token');

      console.log('TOKEN GET')
    });

    //Calls verification method from auth service to verify the acount on the back
    if (this.verificationCode) {
      this.authService.verifyUser(this.verificationCode);

    }
  }

  onLogin(form: NgForm) {


    if (form.invalid) {
      return;
    }


    const userLogin = {
      email: form.value.email,
      password: form.value.password,
    }

    this.authService.login(userLogin.email, userLogin.password);

  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  openDialogForResetPassword() {
    const dialogCreateConfig = new MatDialogConfig();
    dialogCreateConfig.disableClose = true;
    dialogCreateConfig.autoFocus = true;
    dialogCreateConfig.width = '800px';
    //this.dialog.open(ForgotPasswordComponent, dialogCreateConfig)
  }

}
