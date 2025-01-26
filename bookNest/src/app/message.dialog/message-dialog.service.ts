import { Injectable } from '@angular/core';
import { MessageDialogComponent } from './message.dialog.component';
import { MatDialogRef, MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MessageData } from '../models/MessageData';

@Injectable({
  providedIn: 'root'
})
export class MessageDialogService {

  private dialogRef: MatDialogRef<MessageDialogComponent> | null = null;


  constructor(private dialog: MatDialog) { }


  showMessage(data: MessageData): void {
    this.closeExistingDialog();
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = data;
    dialogConfig.autoFocus = 'dialog';
    dialogConfig.restoreFocus = true;
    dialogConfig.disableClose = true;
    //dialogConfig.panelClass = data.type === 'Success' ? 'success-dialog' : 'error-dialog';
    dialogConfig.panelClass = 'message-dialog';
    const dialogRef = this.dialog.open(MessageDialogComponent, dialogConfig);

    // Auto close if duration is provided
    if (data.duration) {
      setTimeout(() => {
        dialogRef.close();
      }, data.duration);
    }
  }

  private closeExistingDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }

  showSuccess(message: string, duration?: number): void {
    this.showMessage({
      message,
      type: 'Success',
      duration
    });
  }


  showError(message: string, duration?: number): void {
    this.showMessage({
      message,
      type: 'Error',
      duration
    });
  }


  showInfo(message: string, duration?: number): void {
    this.showMessage({
      message,
      type: 'Info',
      duration
    });
  }

  showNew(message: string, duration?: number): void {
    this.showMessage({
      message,
      type: 'New',
      duration
    });
  }

  // MessageDialogService
  showWarning(message: string, onConfirm: () => void): void {
    this.closeExistingDialog();
    const dialogRef = this.dialog.open(MessageDialogComponent, {
      data: {
        message,
        type: 'Warning',
        showConfirm: true
      },
      disableClose: true
    });

    this.dialogRef = dialogRef;

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        onConfirm();
      }
    });
  }

}
