import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerHelper {
  private _spinner = new BehaviorSubject<boolean>(false);
  spinner$ = this._spinner.asObservable();

  show() {
    this._spinner.next(true);
  }

  hide() {
    this._spinner.next(false);
  }
}
