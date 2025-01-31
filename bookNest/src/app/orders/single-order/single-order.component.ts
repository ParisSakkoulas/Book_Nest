import { Component, OnInit } from '@angular/core';
import { CheckoutService } from '../checkout.service';
import { ActivatedRoute } from '@angular/router';
import { MessageDialogService } from 'src/app/message.dialog/message-dialog.service';
import { SpinnerService } from 'src/app/spinner/spinner.service';
import { Order } from 'src/app/models/Order.Model';

@Component({
  selector: 'app-single-order',
  templateUrl: './single-order.component.html',
  styleUrls: ['./single-order.component.css']
})
export class SingleOrderComponent implements OnInit {

  // Store order ID from route params
  orderId: any;

  // Store full order details
  singleOrder !: Order;

  constructor(private route: ActivatedRoute, private orderService: CheckoutService, private spinnerService: SpinnerService, private messageService: MessageDialogService) { }

  // Define possible order status steps
  readonly orderSteps = [
    'Pending',
    'Processing',
    'Shipped',
    'Delivered'
  ];

  // Store order data
  order: any;


  // Load order details on init
  ngOnInit(): void {

    this.orderId = this.route.snapshot.paramMap.get('orderId');
    this.orderService.getOrder(this.orderId?.toString()).subscribe({

      next: (response) => {


        this.order = response
        this.singleOrder = response
        console.log(this.singleOrder)
      },

      error: (err) => {
        console.log(err)
      }
    })

  }

  // Cancel current order
  cancelOrder(orderId: any) {

    this.orderService.cancelOrder(this.orderId).subscribe({
      next: (response) => {
        console.log(response)

        this.messageService.showSuccess(response.message);
        this.singleOrder.status = 'Cancelled'

      }
    })

  }

  // Get current step index in order flow
  getStepIndex(): number {
    if (this.order?.status === 'Cancelled') {
      return -1; // Special handling for cancelled orders
    }
    return this.orderSteps.indexOf(this.order?.status);
  }
  // Check if step is completed
  isStepComplete(step: string): boolean {
    const currentStepIndex = this.orderSteps.indexOf(this.order?.status);
    const stepIndex = this.orderSteps.indexOf(step);
    return stepIndex < currentStepIndex;
  }

  // Get date for order step
  getStepDate(step: string): string {
    // This is a placeholder. You would normally get these dates from your order history
    switch (step) {
      case 'Pending':
        return this.order?.createdAt;
      default:
        return '';
    }
  }

  // Check if step can be edited
  isStepEditable(step: string): boolean {
    if (this.order?.status === 'Cancelled') {
      return false;
    }
    const currentStepIndex = this.orderSteps.indexOf(this.order?.status);
    const stepIndex = this.orderSteps.indexOf(step);
    return stepIndex <= currentStepIndex;
  }

  // Check if step is current
  isCurrentStep(step: string): boolean {
    return this.order?.status === step;
  }

  // Check if step has been reached
  isStepReached(step: string): boolean {
    if (this.order?.status === 'Cancelled') {
      return false;
    }
    const currentStepIndex = this.orderSteps.indexOf(this.order?.status);
    const stepIndex = this.orderSteps.indexOf(step);
    return stepIndex <= currentStepIndex;
  }



}
