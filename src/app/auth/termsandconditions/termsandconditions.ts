import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-termsandconditions',
  standalone: true,
  templateUrl: './termsandconditions.html',
  styleUrls: ['./termsandconditions.css']
})
export class Termsandconditions {
    constructor(private router: Router) {}

     goToLogin() {
    this.router.navigate(['/login']);
  }
}
