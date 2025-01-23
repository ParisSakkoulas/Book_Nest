import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Customer } from '../models/Customer.Model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MessageDialogService } from '../message.dialog/message-dialog.service';
import { SpinnerService } from '../spinner/spinner.service';
import { Book } from '../models/Book.Model';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  private books: Book[] = [];
  private booksSubject = new BehaviorSubject<Book[]>([]);
  private paginationSubject = new BehaviorSubject<{
    current: number;
    total: number;
    count: number;
    totalRecords: number;
  }>({ current: 1, total: 1, count: 0, totalRecords: 0 });

  constructor(
    private http: HttpClient,
    private spinnerService: SpinnerService,
    private messageService: MessageDialogService
  ) { }

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
      'http://localhost:3000/api/books',
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

  getCurrentBooks(): Observable<Book[]> {
    return this.booksSubject.asObservable();
  }

  getPagination(): Observable<{ current: number; total: number; count: number; totalRecords: number }> {
    return this.paginationSubject.asObservable();
  }

  createBook(bookData: Partial<Book>) {
    this.spinnerService.show();
    return this.http.post<{ success: boolean; data: Book }>(
      'http://localhost:3000/api/books/create',
      bookData
    ).subscribe({
      next: (response) => {
        this.books.push(response.data);
        this.booksSubject.next(this.books);
        this.messageService.showSuccess('Book created successfully');
        this.spinnerService.hide();
      },
      error: (error) => {
        this.messageService.showError(error.error?.message || 'Failed to create book');
        this.spinnerService.hide();
      }
    });
  }

  getBookById(bookId: string) {
    return this.http.get<{ success: boolean; book: Book; message: string }>(
      `http://localhost:3000/api/books/${bookId}`
    );
  }

  updateBook(bookId: string, bookData: Partial<Book>) {
    this.spinnerService.show();
    return this.http.put<{ message: string; updatedBook: Book }>(
      `http://localhost:3000/api/books/${bookId}`,
      bookData
    ).subscribe({
      next: (response) => {
        this.books = this.books.map(book =>
          book._id === bookId ? response.updatedBook : book
        );
        this.booksSubject.next(this.books);
        this.messageService.showSuccess(response.message);
        this.spinnerService.hide();
      },
      error: (error) => {
        this.messageService.showError(error.error?.message || 'Failed to update book');
        this.spinnerService.hide();
      }
    });
  }

  deleteBook(bookId: string) {
    this.spinnerService.show();
    return this.http.delete<{ message: string; book: Book }>(
      `http://localhost:3000/api/books/${bookId}`
    ).subscribe({
      next: (response) => {
        this.books = this.books.filter(book => book._id !== bookId);
        this.booksSubject.next(this.books);
        this.messageService.showSuccess(response.message);
        this.spinnerService.hide();
      },
      error: (error) => {
        this.messageService.showError(error.error?.message || 'Failed to delete book');
        this.spinnerService.hide();
      }
    });
  }


}
