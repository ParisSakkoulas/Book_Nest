import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MessageDialogService } from 'src/app/message.dialog/message-dialog.service';
import { Book } from 'src/app/models/Book.Model';
import { BookService } from '../book.service';
import { AuthService } from 'src/app/auth/auth.service';
import { CurrentUserData } from 'src/app/models/CurrentUser.Data';
import bookCategories from 'src/app/models/Book.Categories';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-books',
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.css']
})
export class BooksComponent implements OnInit {

  // Array to store book data
  books: Book[] = [];

  // Pagination state object
  pagination = {
    current: 1,
    total: 1,
    count: 0,
    totalRecords: 0
  };

  categories: string[] = ["All", ...bookCategories];

  // Filter options for book search/filtering
  filters = {
    search: '',
    category: '',
    minPrice: null as number | null,
    maxPrice: null as number | null,
    sortBy: '',
    limit: 12
  };

  // Store current user information
  currentUserData !: CurrentUserData;


  // for the search
  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;



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


    // Initialize the search subscription
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(300), // Wait for 300ms pause in typing
        distinctUntilChanged() // Only emit if value is different from previous
      )
      .subscribe(() => {
        this.onSearch();
      });


  }

  // Fetch books with current filters and pagination
  loadBooks() {
    this.bookService.getBooks({
      page: this.pagination.current,
      limit: this.filters.limit,
      search: this.filters.search,
      category: this.filters.category === "All" ? undefined : this.filters.category,
      minPrice: this.filters.minPrice || undefined,
      maxPrice: this.filters.maxPrice || undefined,
      sortBy: this.filters.sortBy
    });
  }

  // Handle search button click
  onSearch() {
    this.pagination.current = 1;
    this.loadBooks();
  }

  // Handle pagination changes
  onPageChange(page: number) {
    this.pagination.current = page;
    this.loadBooks();
  }

  // Navigate to edit book form
  onEditBook(book: Book, event: Event) {
    event.stopPropagation();
  }

  // Show delete confirmation
  onDeleteBook(bookId: string, event: Event) {
    event.stopPropagation();
    this.messageService.showInfo(
      'Delete Book'
    );
  }

  // go to book details page
  onViewBook(bookId: string) {
    this.router.navigate(['/books', bookId]);
  }

  //get stock level indicator
  getStockStatus(stock: number): { color: string; text: string } {
    if (stock > 10) {
      return { color: 'success', text: 'In Stock' };
    } else if (stock > 0) {
      return { color: 'warning', text: 'Low Stock' };
    } else {
      return { color: 'danger', text: 'Out of Stock' };
    }
  }


  // add onSearchChange method
  onSearchChange(event: any): void {
    this.searchSubject.next(event.target.value);
  }


  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }
}
