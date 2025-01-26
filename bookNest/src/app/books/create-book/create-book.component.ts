import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../book.service';
import { MessageDialogService } from 'src/app/message.dialog/message-dialog.service';
import { SpinnerService } from 'src/app/spinner/spinner.service';

@Component({
  selector: 'app-create-book',
  templateUrl: './create-book.component.html',
  styleUrls: ['./create-book.component.css']
})
export class CreateBookComponent implements OnInit, OnDestroy {

  mode = 'Add'

  bookId = '';

  bookForm!: FormGroup;
  imagePreview: string | null = null;
  selectedFile: File | null = null;
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private bookService: BookService,
    private router: Router,
    private messageService: MessageDialogService,
    private spinnerService: SpinnerService,
  ) { }

  ngOnInit(): void {



    // Component changes
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      isbn: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0.01)]],
      description: [''],
      category: ['', Validators.required],
      stock: ['', [Validators.required, Validators.min(0)]],
      publishDate: ['', [Validators.pattern(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(0|1|2)\d\d\d$/)]],
      imageUrl: [null]
    });


    //Check if the route contains the book id, in that case we are in edit mode
    const bookId = this.route.snapshot.paramMap.get('bookId');
    if (bookId) {

      this.bookId = bookId
      this.mode = 'Save';

      this.bookService.getBookById(bookId).subscribe({
        next: (response) => {





          let formattedDate;
          if (response.book.publishDate) {
            const newDate = new Date(response.book.publishDate)
            const day = String(newDate.getDate()).padStart(2, '0'); // Get the day and pad it
            const month = String(newDate.getMonth() + 1).padStart(2, '0'); // Get the month (0-based) and pad it
            const year = newDate.getFullYear(); // Get the year

            formattedDate = `${day}/${month}/${year}`; // Combine into DD/MM/YYYY format

          }


          this.bookForm.patchValue({
            title: response.book.title || null,
            author: response.book.author || null,
            isbn: response.book.isbn || null,
            price: response.book.price || null,
            description: response.book.description || null,
            category: response.book.category || null,
            stock: response.book.stock || null,
            publishDate: formattedDate || null,
            imageUrl: response.book.imageUrl || null
          });

          console.log('Form after patch:', this.bookForm.valid);
          console.log('Form values:', this.bookForm.value);
          console.log('Form errors:', this.bookForm.errors);

          if (response.book.imageUrl) {
            this.imagePreview = response.book.imageUrl;
          }


        },
        error: (err) => {

        }
      })

    }



  }

  onFileSelected(event: any) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      this.selectedFile = fileInput.files[0];

      // Preview the selected image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  removeImage() {
    this.imagePreview = null;
    this.selectedFile = null;
  }


  onSubmit() {
    if (!this.bookForm.valid) {
      return;
    }


    const formData = new FormData();
    formData.append('title', this.bookForm.get('title')?.value);
    formData.append('author', this.bookForm.get('author')?.value);
    formData.append('isbn', this.bookForm.get('isbn')?.value);
    formData.append('price', this.bookForm.get('price')?.value);
    formData.append('description', this.bookForm.get('description')?.value);
    formData.append('category', this.bookForm.get('category')?.value);
    formData.append('stock', this.bookForm.get('stock')?.value);
    formData.append('publishDate', this.bookForm.get('publishDate')?.value);



    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }


    if (this.mode === 'Add') {
      this.bookService.createBook(formData).subscribe({
        next: (response) => {

          console.log(response)

          this.messageService.showSuccess('Book created successfully');
          this.spinnerService.hide();
          this.router.navigate(['books'])
        },
        error: (error) => {
          console.log(error)
          this.messageService.showError(error.error?.message || 'Failed to create book');
          this.spinnerService.hide();
        }
      });
    }

    else {
      this.spinnerService.show();

      this.bookService.updateBook(this.bookId, formData).subscribe({
        next: (response) => {


          console.log(response.updatedBook.publishDate);
          let formattedDate;
          if (response.updatedBook.publishDate) {
            const newDate = new Date(response.updatedBook.publishDate)
            const day = String(newDate.getDate()).padStart(2, '0'); // Get the day and pad it
            const month = String(newDate.getMonth() + 1).padStart(2, '0'); // Get the month (0-based) and pad it
            const year = newDate.getFullYear(); // Get the year

            formattedDate = `${day}/${month}/${year}`; // Combine into DD/MM/YYYY format

          }


          this.bookForm.patchValue({
            title: response.updatedBook.title,
            author: response.updatedBook.author,
            isbn: response.updatedBook.isbn,
            price: response.updatedBook.price,
            description: response.updatedBook.description,
            category: response.updatedBook.category,
            stock: response.updatedBook.stock,
            publishDate: formattedDate,
            image: response.updatedBook.imageUrl,

          });

          if (response.updatedBook.imageUrl) {
            this.imagePreview = response.updatedBook.imageUrl;
          }

          this.spinnerService.hide();
          this.messageService.showSuccess(response.message || 'Updated successfull!');


        },
        error: (error) => {
          console.log(error)
          this.messageService.showError(error.error?.message || 'Failed to update book');
          this.spinnerService.hide();
        }
      });
    }




  }



  ngOnDestroy(): void {
    this.imagePreview = null;
    this.selectedFile = null;
  }

}
