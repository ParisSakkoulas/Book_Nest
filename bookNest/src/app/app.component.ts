import { Component } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { map } from 'rxjs';
import { CurrentUserData } from './models/CurrentUser.Data';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'bookNest';

  isAuthenticated = false;

  currentUserData !: CurrentUserData;

  showMobileMenu = false;

  navLinks = [
    { path: '/books', label: 'Browse', icon: 'library_books' },
    { path: '/categories', label: 'Categories', icon: 'category' },
    { path: '/about', label: 'About', icon: 'info' }
  ];

  constructor(private authService: AuthService) { }

  userData$ = this.authService.getCurrentUser();
  isAdmin$ = this.userData$.pipe(
    map(user => user?.role === 'ADMIN')
  );

  ngOnInit() {


    this.authService.autoLogin();

    this.authService.isAuthenticated$().subscribe(
      isAuth => this.isAuthenticated = isAuth
    );

    this.authService.getCurrentUser().subscribe(
      user => {
        if (user) {
          console.log(user)
          this.currentUserData = user;
        }
      }

    )




  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  onLogout() {
    this.authService.logout();
  }
}
