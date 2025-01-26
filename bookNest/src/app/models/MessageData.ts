export interface MessageData {
  message: string;
  type: 'Success' | 'Error' | 'Info' | 'New' | 'Warning' | 'Other';
  duration?: number;
  showConfirm?: boolean;
}
