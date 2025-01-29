import { Order } from "./Order.Model";

export interface SingleOrderResponse {
  order: Order;
  success: boolean;
  message?: string;
}
