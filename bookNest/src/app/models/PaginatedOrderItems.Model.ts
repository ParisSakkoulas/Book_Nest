import { Order } from "./Order.Model";

export interface PaginatedOrdersResponse {
  orders: Order[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
  };
}
