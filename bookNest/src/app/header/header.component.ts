import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { CartService } from '../cart.service';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { CurrentUserData } from '../models/CurrentUser.Data';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isAuthenticated = false;
  currentUserData!: CurrentUserData;
  showMobileMenu = false;
  cart: any = null;
  cartItemCount = 0;
  isMobileView = false;

  showSearch: boolean = false;
  searchQuery: string = '';

  userData$ = this.authService.getCurrentUser();
  isAdmin$ = this.userData$.pipe(
    map(user => user?.role === 'ADMIN')
  );

  navLinks = [
    { path: '/books', label: 'Browse', icon: 'library_books' }
  ];

  cartSubscription = this.cartService.cart$.subscribe(cart => {
    //If cart has items
    if (cart) {
      this.cart = cart;
      this.cartItemCount = cart.items.length;
    }

    //If cart has not items
    if (!cart) {
      this.cart = cart;
      this.cartItemCount = 0;
    }
  });

  constructor(
    private router: Router,
    private authService: AuthService,
    private cartService: CartService
  ) { }

  ngOnInit() {


    // Add event listener for escape key to close search
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.closeSearch();
      }
    });


    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());

    this.authService.isAuthenticated$().subscribe(
      isAuth => this.isAuthenticated = isAuth
    );

    this.authService.getCurrentUser().subscribe(
      user => {
        if (user) {
          this.currentUserData = user;
        }
      });

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
    const item = this.cart.items.find((item: { productId: { _id: string; }; }) =>
      item.productId._id === bookId
    );
    if (item && quantity > item.productId.stock) return;

    this.cartService.updateQuantity(bookId, quantity).subscribe(() => {
      this.cartService.updateCartState();
    });
  }

  // Toggle search overlay
  toggleSearch(): void {
    this.showSearch = !this.showSearch;
    if (this.showSearch) {
      // Focus the search input after a brief delay to allow the animation to start
      setTimeout(() => {
        const searchInput = document.querySelector('.search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);

      // Add class to body to prevent scrolling when search is open
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable scrolling when search is closed
      document.body.style.overflow = 'auto';
    }
  }

  // Close search overlay
  closeSearch(): void {
    this.showSearch = false;
    this.searchQuery = ''; // Clear search query
    document.body.style.overflow = 'auto'; // Re-enable scrolling
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
