import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CustomersService } from '../customer.service';
import { title } from 'process';

@Component({
  selector: 'app-create-customer',
  templateUrl: './create-customer.component.html',
  styleUrls: ['./create-customer.component.css']
})
export class CreateCustomerComponent implements OnInit {


  // Form group for customer creation/editing
  createCustomerForm: any;

  // Dialog title and button text that changes based on mode
  title = 'Create Customer';
  buttonText = 'Create';


  constructor(private customerService: CustomersService, private formBuilder: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<CreateCustomerComponent>,) { }

  ngOnInit(): void {

    this.createCustomerForm = this.formBuilder.group({
      // Always Required
      firstName: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],


      // Required for contact - at least one of email or phone must be provided
      phoneNumber: ['', [
        Validators.pattern(/^$|^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
      ]],
      email: ['', [
        Validators.email
      ]],

      street: ['',],
      city: ['',],
      state: ['',],
      zipCode: ['',],
      country: ['',],

    }, {
      validators: this.atLeastOneContactMethod() // Custom validator to ensure either email or phone is provided
    });


    if (this.data) {
      console.log(this.data)
      this.title = 'Edit Customer';
      this.buttonText = 'Save';

      console.log(this.data)

      this.createCustomerForm.patchValue({
        firstName: this.data.customer.firstName,
        lastName: this.data.customer.lastName,
        phoneNumber: this.data.customer.phoneNumber,
        email: this.data.customer?.user ? this.data.customer?.user.email : '',
        street: this.data.customer?.address ? this.data.customer.address.street : '',
        city: this.data.customer?.address ? this.data.customer.address.city : '',
        state: this.data.customer?.address ? this.data.customer.address.state : '',
        zipCode: this.data.customer?.address ? this.data.customer.address.zipCode : '',
        country: this.data.customer?.address ? this.data.customer.address.country : '',

      })
    }


  }


  // Custom validator to require either email or phone
  private atLeastOneContactMethod(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const email = formGroup.get('email')?.value;
      const phone = formGroup.get('phoneNumber')?.value;

      return !email && !phone ? { noContact: true } : null;
    };
  }

  // Handle form submission for create/update
  onSubmit() {

    if (this.createCustomerForm.valid) {

      const registerUserData = {
        firstName: this.createCustomerForm.value.firstName,
        lastName: this.createCustomerForm.value.lastName,
        email: this.createCustomerForm.value.email,
        phoneNumber: this.createCustomerForm.value.phoneNumber || undefined,
        address: {
          street: this.createCustomerForm.value.street,
          city: this.createCustomerForm.value.city,
          state: this.createCustomerForm.value.state,
          zipCode: this.createCustomerForm.value.zipCode,
          country: this.createCustomerForm.value.country,
        }
      }

      if (!this.data) {
        this.customerService.createNewCustomer(registerUserData);
      }
      else {
        this.customerService.updateSingleCustomer(this.data.customer._id, registerUserData)
      }


      this.dialogRef.close();

    }
    else {
      Object.keys(this.createCustomerForm.controls).forEach(key => {
        const control = this.createCustomerForm.get(key);
        control?.markAsTouched();
      });
    }

  }

  // Close dialog without saving
  onCancel() {
    this.dialogRef.close();
  }

}
