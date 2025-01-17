import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'bookNest';

  productItems!: { label: string; icon: string; routerLink: string; }[];
  userItems!: { label: string; icon: string; routerLink: string; }[];


  ngOnInit() {
    this.productItems = [
      {
        label: 'Προβολή Βιβλίων',
        icon: 'pi pi-list',
        routerLink: '/products'
      },
      {
        label: 'Προσθήκη Βιβλίου',
        icon: 'pi pi-plus',
        routerLink: '/products/new'
      },
      {
        label: 'Διαχείριση',
        icon: 'pi pi-cog',
        routerLink: '/products/manage'
      }
    ];

    this.userItems = [
      {
        label: 'Σύνδεση',
        icon: 'pi pi-sign-in',
        routerLink: '/login'
      },
      {
        label: 'Εγγραφή',
        icon: 'pi pi-user-plus',
        routerLink: '/register'
      },

      {
        label: 'Οι Παραγγελίες μου',
        icon: 'pi pi-shopping-bag',
        routerLink: '/my-orders'
      },
      {
        label: 'Έξοδος',
        icon: 'pi pi-sign-out',
        routerLink: ''
      }
    ];
  }
}
