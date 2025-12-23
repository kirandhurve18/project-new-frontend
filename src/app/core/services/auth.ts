import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// ✅ Define API response structure
interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    role: string;
    email: string;
    employee_id: string;
    _id: string;
    full_name: string;
    is_team_lead: boolean;
    is_team_manager: boolean;
    is_super_admin: boolean;
    designation_name: string;
    role_id: string;
    work_mode: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, private router: Router) { }

  // ---------------- LOGIN ----------------
  login(data: { email: string; password: string }): Observable<LoginResponse> {
    // console.log("data --> ", data);
    return this.http.post<LoginResponse>(environment.baseUrl + `/hrms/auth/login`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // ---------------- STORE TOKEN ----------------
  // ---------------- STORE TOKEN ----------------
  storeAuthData(
    token: string,
    employee_id: string,
    email: string,
    role_id: string,
    full_name: string,
    userRole: string,
    designation_name: string,
    user: any,
    work_mode: any,
    // role: string,
  ): void {
    localStorage.setItem('user', JSON.stringify(user ?? {}));
    localStorage.setItem('token', token ?? '');
    // localStorage.setItem('role', role ?? '');
    localStorage.setItem('employee_id', employee_id ?? '');
    localStorage.setItem('email', email ?? '');
    localStorage.setItem('full_name', full_name ?? '');
    localStorage.setItem('user_role', userRole ?? '4');
    localStorage.setItem('designation_name', designation_name ?? 'Employee');
    localStorage.setItem('role_id', role_id ?? '');
    localStorage.setItem('work_mode', work_mode ?? '');

    // // ✅ Always store booleans (even if false)
    // localStorage.setItem('is_team_lead', JSON.stringify(is_team_lead ?? false));
    // localStorage.setItem('is_team_manager', JSON.stringify(is_team_manager ?? false));
    // localStorage.setItem('is_super_admin', JSON.stringify(is_super_admin ?? false));
    // console.log('✅ Auth data saved:', { token, role, employee_id, email, full_name });
  }

  // ---------------- LOGOUT ----------------
  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  // ---------------- HELPERS ----------------
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getRole(): string {
    return localStorage.getItem('role') || '';
  }

  getEmployeeId(): string {
    return localStorage.getItem('employee_id') || '';
  }

  getEmail(): string {
    return localStorage.getItem('email') || '';
  }
}
