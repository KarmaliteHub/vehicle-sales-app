import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

export interface MessageDetailData {
  message: {
    id: number;
    name: string;
    email: string;
    phone: string;
    message: string;
    date: string;
    is_read: boolean;
  };
}

@Component({
  selector: 'app-message-detail-dialog',
  templateUrl: './message-detail-dialog.component.html',
  styleUrls: ['./message-detail-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ]
})
export class MessageDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MessageDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MessageDetailData
  ) {}

  onClose(markAsRead: boolean = false): void {
    this.dialogRef.close({ markAsRead });
  }
}
