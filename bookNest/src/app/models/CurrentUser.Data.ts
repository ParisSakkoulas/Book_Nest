export interface CurrentUserData {
  user_id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: 'ADMIN' | 'USER';
}
