export interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  imageUrl?: string;
  publishDate?: Date;
  status?: string;
}
