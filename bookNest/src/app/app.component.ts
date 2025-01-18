import { Component } from '@angular/core';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'bookNest';

  isAuthenticated = false;

  constructor(private authService: AuthService) { }

  ngOnInit() {


    this.authService.autoLogin();

    this.authService.isAuthenticated$().subscribe(
      isAuth => this.isAuthenticated = isAuth
    );


  }

  onLogout() {
    this.authService.logout();
  }
}
