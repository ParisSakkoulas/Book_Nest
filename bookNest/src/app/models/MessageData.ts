export interface MessageData {
  message: string;
  type: 'Success' | 'Error' | 'Info' | 'New' | 'Other';
  duration?: number;
}
