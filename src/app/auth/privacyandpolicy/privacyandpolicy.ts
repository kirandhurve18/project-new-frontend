import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-privacyandpolicy',
  standalone: true,
  templateUrl: './privacyandpolicy.html',
  styleUrls: ['./privacyandpolicy.css']
})
export class Privacyandpolicy {

 constructor(private router: Router) {}

      goToLogin() {
    this.router.navigate(['/login']);
  }
}
