import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class LeavesRedirectGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const userRole = Number(localStorage.getItem('user_role')); // 👈 or get from auth service

    if (userRole === 1) {
      return this.router.createUrlTree(['/main/leave/teams-list']);
    }
    return this.router.createUrlTree(['/main/leave/status']);
  }
}
