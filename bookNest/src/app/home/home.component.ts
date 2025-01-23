import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  categories: any[] = [
    {
      name: 'Fiction',
      image: 'assets/images/fiction.jpg',
      description: 'Explore worlds of imagination through our fiction collection.'
    },
    {
      name: 'Non-Fiction',
      image: 'assets/images/non-fiction.jpg',
      description: 'Discover real-world knowledge and insights.'
    },
    {
      name: 'Academic',
      image: 'assets/images/academic.jpg',
      description: 'Support your studies with our academic resources.'
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
