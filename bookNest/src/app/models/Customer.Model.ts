export interface Customer {
  _id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  customerStatus?: string
  isActive: boolean;
  address?: {
    street: string;
    state: string;
    zipCode: string;
    country: string;
    city: string;
  };
  createdAt?: Date;
  updatedAt?: Date;

  user?: {
    email: string;
    role: string;
    status: string;
  }



}
