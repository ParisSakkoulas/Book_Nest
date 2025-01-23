import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageDialogService } from 'src/app/message.dialog/message-dialog.service';
import { Book } from 'src/app/models/Book.Model';
import { BookService } from '../book.service';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit {

  book!: Book;
  quantity = 1;
  selectedTab = 0;

  constructor(private route: ActivatedRoute, private router: Router, private bookService: BookService, private messageService: MessageDialogService) { }

  ngOnInit() {

    const bookId = this.route.snapshot.paramMap.get('bookId');
    if (bookId) {
      this.bookService.getBookById(bookId).subscribe({
        next: (response) => {
          this.book = response.book;
        },
        error: (error) => {
          this.messageService.showError('Error loading book details');
          this.router.navigate(['/books']);
        }
      });
    }
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
    // Implement cart functionality
    this.messageService.showSuccess('Added to cart successfully');
  }

}
