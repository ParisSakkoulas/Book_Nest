import { OrderItem } from "./OrderItem.Model";
import { ShippingAddress } from "./ShippingAddress.Model";

export interface Order {
  _id: string;
  userId: {
    _id: string;
    email: string;
  };
  customerName?: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  sessionId: string | null;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
  status: string;
  orderDate: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
