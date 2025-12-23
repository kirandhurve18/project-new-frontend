import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SpinnerDialogComponent } from './shared/spinner-dialog/spinner-dialog';
// import { Spinner } from './superadmin/spinner/spinner';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SpinnerDialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent  {
  title = 'HRMS';

  constructor(private router: Router) {}

  ngOnInit(): void {
    const user = localStorage.getItem('user');
    const currentPath = this.router.url;

    if (!user && currentPath !== '/login') {
      this.router.navigate(['/login']);
    }
    if (user && currentPath === '/login') {
      this.router.navigate(['/main/dashboard']);
    }
  }
}
