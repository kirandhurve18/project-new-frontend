
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private baseUrl = '/api'; 

  constructor(private http: HttpClient) {}

  getAdminTasks(): Observable<any> {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${token}`,
    });

    const body = new URLSearchParams(); 

    return this.http.post<any>(
      `${this.baseUrl}/hrms/dashboard/my_tasks`,
      body.toString(),
      { headers }
    );
  }
}
