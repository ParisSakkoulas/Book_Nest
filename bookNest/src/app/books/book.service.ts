import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Customer } from '../models/Customer.Model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MessageDialogService } from '../message.dialog/message-dialog.service';
import { SpinnerService } from '../spinner/spinner.service';
import { Book } from '../models/Book.Model';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookService {


  // API base URL from environment
  private baseUrl = environment.baseUrl;



  // Store books data
  private books: Book[] = [];

  // Observable source for books data
  private booksSubject = new BehaviorSubject<Book[]>([]);

  // Track pagination state
  private paginationSubject = new BehaviorSubject<{
    current: number;
    total: number;
    count: number;
    totalRecords: number;
  }>({ current: 1, total: 1, count: 0, totalRecords: 0 });

  constructor(
    private http: HttpClient,
    private spinnerService: SpinnerService,
    private messageService: MessageDialogService,
    private router: Router,
  ) { }

  // Fetch books with optional filtering parameters
  getBooks(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
    sortBy?: string;
  }) {
    let httpParams = new HttpParams()
      .set('page', params.page?.toString() || '1')
      .set('limit', params.limit?.toString() || '10');

    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.minPrice) httpParams = httpParams.set('minPrice', params.minPrice.toString());
    if (params.maxPrice) httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);

    this.spinnerService.show();
    this.http.get<{ success: boolean; data: Book[]; pagination: any }>(
      `${this.baseUrl}/books`,
      { params: httpParams }
    ).subscribe({
      next: (response) => {
        this.spinnerService.hide();
        this.books = response.data;
        this.booksSubject.next(this.books);
        this.paginationSubject.next(response.pagination);
      },
      error: (err) => {
        this.messageService.showError(err.error.message || 'Failed to fetch books');
        this.spinnerService.hide();
      }
    });
  }



  // Get current books as observable
  getCurrentBooks(): Observable<Book[]> {
    return this.booksSubject.asObservable();
  }

  // Get pagination data as observable
  getPagination(): Observable<{ current: number; total: number; count: number; totalRecords: number }> {
    return this.paginationSubject.asObservable();
  }

  // Create new book with
  createBook(bookData: FormData) {
    this.spinnerService.show();

    console.log(bookData.get('image'))
    return this.http.post<{ success: boolean; data: Book }>(
      `${this.baseUrl}/books`,
      bookData  // Send FormData instead of JSON
    )
  }

  // Get single book by ID
  getBookById(bookId: string) {
    return this.http.get<{ success: boolean; book: Book; message: string }>(
      `${this.baseUrl}/books/${bookId}`
    );
  }

  //Update existing book
  updateBook(bookId: string, bookData: FormData) {
    return this.http.put<{ message: string; updatedBook: Book }>(
      `${this.baseUrl}/${bookId}`,
      bookData
    )
  }

  // Delete book by ID
  deleteBook(bookId: string) {
    return this.http.delete<{ message: string; book: Book }>(
      `${this.baseUrl}/books/${bookId}`
    );
  }


  // Get image URL
  getImageUrl(url: string): string {
    if (!url) {
      return 'assets/default-book.png';
    }
    return url;
  }


}
