import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MessageDialogService } from 'src/app/message.dialog/message-dialog.service';
import { Book } from 'src/app/models/Book.Model';
import { BookService } from '../book.service';
import { AuthService } from 'src/app/auth/auth.service';
import { CurrentUserData } from 'src/app/models/CurrentUser.Data';

@Component({
  selector: 'app-books',
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.css']
})
export class BooksComponent implements OnInit {

  books: Book[] = [];
  pagination = {
    current: 1,
    total: 1,
    count: 0,
    totalRecords: 0
  };
  filters = {
    search: '',
    category: '',
    minPrice: null as number | null,
    maxPrice: null as number | null,
    sortBy: '',
    limit: 12
  };

  currentUserData !: CurrentUserData;


  constructor(
    private bookService: BookService,
    private router: Router,
    private dialog: MatDialog,
    private messageService: MessageDialogService,
    private authService: AuthService

  ) { }

  ngOnInit() {
    this.loadBooks();
    this.bookService.getCurrentBooks().subscribe(books => {
      this.books = books;
    });
    this.bookService.getPagination().subscribe(pagination => {
      this.pagination = pagination;
    });

    this.authService.getCurrentUser().subscribe(
      user => {
        if (user) {
          console.log(user)
          this.currentUserData = user;
        }
      }

    )


  }

  loadBooks() {
    this.bookService.getBooks({
      page: this.pagination.current,
      limit: this.filters.limit,
      search: this.filters.search,
      category: this.filters.category,
      minPrice: this.filters.minPrice || undefined,
      maxPrice: this.filters.maxPrice || undefined,
      sortBy: this.filters.sortBy
    });
  }

  onSearch() {
    this.pagination.current = 1;
    this.loadBooks();
  }

  onPageChange(page: number) {
    this.pagination.current = page;
    this.loadBooks();
  }

  onEditBook(book: Book, event: Event) {
    event.stopPropagation();
    // Implement edit dialog
  }

  onDeleteBook(bookId: string, event: Event) {
    event.stopPropagation();
    this.messageService.showInfo(
      'Delete Book'
    );
  }

  onViewBook(bookId: string) {
    this.router.navigate(['/books', bookId]);
  }

  getStockStatus(stock: number): { color: string; text: string } {
    if (stock > 10) {
      return { color: 'success', text: 'In Stock' };
    } else if (stock > 0) {
      return { color: 'warning', text: 'Low Stock' };
    } else {
      return { color: 'danger', text: 'Out of Stock' };
    }
  }
}
