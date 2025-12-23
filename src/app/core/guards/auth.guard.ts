import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanLoad {
  constructor(private router: Router) {}

  private isAuthenticated(): boolean {
    const user = localStorage.getItem('user');
    return !!user; 
  }

  canActivate(): boolean {
    if (this.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['/login']); 
      return false;
    }
  }

  canLoad(): boolean {
    return this.isAuthenticated(); 
  }
}
