import { Book } from "./Book.Model";

export interface OrderItem {
  productId: Book;
  quantity: number;
  price: number;
  _id: string;
}
