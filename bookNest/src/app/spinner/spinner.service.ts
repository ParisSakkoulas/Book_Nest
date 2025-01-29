import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$: Observable<boolean> = this.isLoading.asObservable();

  constructor() {

    this.isLoading$.subscribe(state => {
      console.log('Spinner state:', state);
    });
  }

  show(): void {
    console.log("Spinner showing")
    this.isLoading.next(true);
  }

  hide(): void {
    console.log("Spinner hide")
    this.isLoading.next(false);
  }
}
