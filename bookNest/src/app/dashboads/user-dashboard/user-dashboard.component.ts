import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {

  columns = ['book', 'date', 'status'];

  recentOrders = [
    { book: 'The Great Gatsby', date: '2024-01-20', status: 'Delivered' },
    { book: '1984', date: '2024-01-15', status: 'Processing' },
    { book: 'To Kill a Mockingbird', date: '2024-01-10', status: 'Delivered' }
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
