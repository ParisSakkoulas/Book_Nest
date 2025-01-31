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

  // Authentication and user state
  isAuthenticated = false;
  currentUserData !: CurrentUserData;
  userData$ = this.authService.getCurrentUser();
  isAdmin$ = this.userData$.pipe(
    map(user => user?.role === 'ADMIN')
  );

  // Mobile menu state
  showMobileMenu = false;
  isMobileView = false;

  // Cart state
  cart: any = null;
  cartItemCount = 0;


  // Navigation links
  navLinks = [
    { path: '/books', label: 'Browse', icon: 'library_books' }
  ];



  constructor(private router: Router, private authService: AuthService, private cartService: CartService) { }


  // Subscribe to cart updates
  cartSubscription = this.cartService.cart$.subscribe(cart => {
    if (cart) {
      this.cart = cart;
      this.cartItemCount = cart.items.length;
    }
  });


  ngOnInit() {


    // Set up responsive layout handling
    this.checkScreenSize();

    // Listen for window resize events
    window.addEventListener('resize', () => this.checkScreenSize());

    // Attempt to restore previous login session
    this.authService.autoLogin();

    // Subscribe to authentication state changes
    this.authService.isAuthenticated$().subscribe(
      isAuth => this.isAuthenticated = isAuth
    );

    // Get and store current user information
    this.authService.getCurrentUser().subscribe(
      user => {
        if (user) {
          console.log(user)
          this.currentUserData = user;
        }
      })

    // Initialize shopping cart state
    this.initializeCart();


  }


  // Check screen size for responsive layout
  checkScreenSize() {
    this.isMobileView = window.innerWidth <= 768;
    if (!this.isMobileView) {
      this.showMobileMenu = false;
      document.body.classList.remove('mobile-menu-open');
    }
  }

  // Handle mobile menu visibility
  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
    if (this.showMobileMenu) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }


  }


  // Initialize shopping cart
  initializeCart() {
    this.cartService.updateCartState();
  }


  // Remove item from cart
  removeFromCart(bookId: string) {
    this.cartService.removeFromCart(bookId).subscribe(() => {
      this.cartService.updateCartState();
    });
  }

  // Update item quantity in cart
  updateQuantity(bookId: string, quantity: number) {
    if (quantity < 1) return;
    const item = this.cart.items.find((item: { productId: { _id: string; }; }) => item.productId._id === bookId);
    if (item && quantity > item.productId.stock) return;

    this.cartService.updateQuantity(bookId, quantity).subscribe(() => {
      this.cartService.updateCartState();
    });
  }

  // Navigate to checkout
  checkout() {
    this.router.navigate(['/orders/checkout']);
  }



  // Handle user logout
  onLogout() {


    this.authService.logout();
    this.cart = null;
    this.cartItemCount = 0;
    this.cartService.updateCartState();
  }



}
