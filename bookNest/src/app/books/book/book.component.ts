import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageDialogService } from 'src/app/message.dialog/message-dialog.service';
import { Book } from 'src/app/models/Book.Model';
import { BookService } from '../book.service';
import { AuthService } from 'src/app/auth/auth.service';
import { CurrentUserData } from 'src/app/models/CurrentUser.Data';
import { SpinnerService } from 'src/app/spinner/spinner.service';
import { CartService } from 'src/app/cart.service';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit {

  book!: Book;
  quantity = 1;
  selectedTab = 0;

  isAuthenticated = false;
  currentUserData !: CurrentUserData;


  constructor(private cartService: CartService, private route: ActivatedRoute, private spinnerService: SpinnerService, private router: Router, private authService: AuthService, private bookService: BookService, private messageService: MessageDialogService) { }

  ngOnInit() {

    const bookId = this.route.snapshot.paramMap.get('bookId');
    if (bookId) {
      this.bookService.getBookById(bookId).subscribe({
        next: (response) => {
          this.book = response.book;
          console.log(this.book)
        },
        error: (error) => {
          this.messageService.showError('Error loading book details');
          this.router.navigate(['/books']);
        }
      });
    }


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

  increaseQuantity() {
    if (this.quantity < this.book.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  getStockStatus(): { color: string; text: string } {
    if (this.book.stock > 10) {
      return { color: 'success', text: 'In Stock' };
    } else if (this.book.stock > 0) {
      return { color: 'warning', text: `Only ${this.book.stock} left` };
    }
    return { color: 'danger', text: 'Out of Stock' };
  }

  addToCart() {
    const items = [{
      bookId: this.book._id,
      quantity: this.quantity
    }];

    console.log(items)


    this.cartService.addToCart(items).subscribe({
      next: (response) => {
        console.log(response);

        console.log(response)
        this.cartService.updateCartState();
        this.messageService.showSuccess('Added to cart successfully');
      },
      error: (error) => {
        console.log(error);

        this.messageService.showError(error.error?.message || 'Failed to add to cart');
      }
    });
  }


  onDeleteBook() {
    console.log('Delete initiated');
    this.messageService.showWarning(`Are you sure you want to delete ${this.book.title}?`, () => {
      console.log('Confirmation callback triggered');
      this.spinnerService.show();
      this.bookService.deleteBook(this.book._id).subscribe({
        next: (response) => {
          this.messageService.showSuccess(response.message);
          this.spinnerService.hide();
          this.router.navigate(['/books']);
        },
        error: (error) => {
          this.messageService.showError(error.error?.message || 'Failed to delete book');
          this.spinnerService.hide();
        }
      });
    });
  }

}
