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

  orderId: any;

  singleOrder !: Order;

  constructor(private route: ActivatedRoute, private orderService: CheckoutService, private spinnerService: SpinnerService, private messageService: MessageDialogService) { }

  readonly orderSteps = [
    'Pending',
    'Processing',
    'Shipped',
    'Delivered'
  ];

  order: any;
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

  cancelOrder(orderId: any) {

    this.orderService.cancelOrder(this.orderId).subscribe({
      next: (response) => {
        console.log(response)

        this.messageService.showSuccess(response.message);
        this.singleOrder.status = 'Cancelled'

      }
    })

  }


  getStepIndex(): number {
    if (this.order?.status === 'Cancelled') {
      return -1; // Special handling for cancelled orders
    }
    return this.orderSteps.indexOf(this.order?.status);
  }

  isStepComplete(step: string): boolean {
    const currentStepIndex = this.orderSteps.indexOf(this.order?.status);
    const stepIndex = this.orderSteps.indexOf(step);
    return stepIndex < currentStepIndex;
  }

  getStepDate(step: string): string {
    // This is a placeholder. You would normally get these dates from your order history
    switch (step) {
      case 'Pending':
        return this.order?.createdAt;
      default:
        return '';
    }
  }


  isStepEditable(step: string): boolean {
    if (this.order?.status === 'Cancelled') {
      return false;
    }
    const currentStepIndex = this.orderSteps.indexOf(this.order?.status);
    const stepIndex = this.orderSteps.indexOf(step);
    return stepIndex <= currentStepIndex;
  }

  isCurrentStep(step: string): boolean {
    return this.order?.status === step;
  }

  isStepReached(step: string): boolean {
    if (this.order?.status === 'Cancelled') {
      return false;
    }
    const currentStepIndex = this.orderSteps.indexOf(this.order?.status);
    const stepIndex = this.orderSteps.indexOf(step);
    return stepIndex <= currentStepIndex;
  }



}
