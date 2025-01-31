import { Injectable } from '@angular/core';
import { MessageDialogComponent } from './message.dialog.component';
import { MatDialogRef, MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MessageData } from '../models/MessageData';

@Injectable({
  providedIn: 'root'
})
export class MessageDialogService {


  // Track currently open dialog reference
  private dialogRef: MatDialogRef<MessageDialogComponent> | null = null;


  constructor(private dialog: MatDialog) { }

  // Show message dialog with custom configuration
  showMessage(data: MessageData): void {
    this.closeExistingDialog();
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = data;
    dialogConfig.autoFocus = 'dialog';
    dialogConfig.restoreFocus = true;
    dialogConfig.disableClose = true;
    dialogConfig.panelClass = 'message-dialog';
    const dialogRef = this.dialog.open(MessageDialogComponent, dialogConfig);

    // Auto close if duration is provided
    if (data.duration) {
      setTimeout(() => {
        dialogRef.close();
      }, data.duration);
    }
  }

  // Close any existing dialog before showing new one
  private closeExistingDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }
  // Show success message dialog
  showSuccess(message: string, duration?: number): void {
    this.showMessage({
      message,
      type: 'Success',
      duration
    });
  }

  // Show error message dialog
  showError(message: string, duration?: number): void {
    this.showMessage({
      message,
      type: 'Error',
      duration
    });
  }

  // Show info message dialog
  showInfo(message: string, duration?: number): void {
    this.showMessage({
      message,
      type: 'Info',
      duration
    });
  }

  // Show new message dialog
  showNew(message: string, duration?: number): void {
    this.showMessage({
      message,
      type: 'New',
      duration
    });
  }

  // Show warning dialog with confirmation
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
