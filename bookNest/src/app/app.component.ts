import { Component } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { map } from 'rxjs';
import { CurrentUserData } from './models/CurrentUser.Data';
import { CartService } from './cart.service';
import { Router } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';

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

  cart: any = null;
  cartItemCount = 0;
  isMobileView = false;

  userData$ = this.authService.getCurrentUser();
  isAdmin$ = this.userData$.pipe(
    map(user => user?.role === 'ADMIN')
  );

  navLinks = [
    { path: '/books', label: 'Browse', icon: 'library_books' }
  ];



  constructor(private router: Router, private authService: AuthService, private cartService: CartService) { }



  cartSubscription = this.cartService.cart$.subscribe(cart => {
    if (cart) {
      this.cart = cart;
      this.cartItemCount = cart.items.length;
    }
  });


  ngOnInit() {


    // Add window resize listener
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());




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
      })

    this.initializeCart();


  }


  checkScreenSize() {
    this.isMobileView = window.innerWidth <= 768;
    if (!this.isMobileView) {
      this.showMobileMenu = false;
      document.body.classList.remove('mobile-menu-open');
    }
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
    if (this.showMobileMenu) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }


  }



  initializeCart() {
    this.cartService.updateCartState();
  }



  removeFromCart(bookId: string) {
    this.cartService.removeFromCart(bookId).subscribe(() => {
      this.cartService.updateCartState();
    });
  }

  updateQuantity(bookId: string, quantity: number) {
    if (quantity < 1) return;
    const item = this.cart.items.find((item: { productId: { _id: string; }; }) => item.productId._id === bookId);
    if (item && quantity > item.productId.stock) return;

    this.cartService.updateQuantity(bookId, quantity).subscribe(() => {
      this.cartService.updateCartState();
    });
  }

  checkout() {
    this.router.navigate(['/orders/checkout']);
  }





  onLogout() {


    this.authService.logout();
    this.cart = null;
    this.cartItemCount = 0;

    this.cartService.updateCartState();
  }



}
