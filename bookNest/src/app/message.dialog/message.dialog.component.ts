import { Component, Inject, OnInit } from '@angular/core';

import { MessageData } from '../models/MessageData';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-message.dialog',
  templateUrl: './message.dialog.component.html',
  styleUrls: ['./message.dialog.component.css']
})
export class MessageDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<MessageDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: MessageData) { }

  ngOnInit(): void {
  }



  getTitle(): string {
    switch (this.data.type) {
      case 'Success':
        return 'Success';
      case 'Error':
        return 'Error';
      case 'Info':
        return 'Information';
      case 'New':
        return 'New Notification';
      default:
        return 'Other';
    }
  }



  closeDialog() {

    this.dialogRef.close();

  }


}
