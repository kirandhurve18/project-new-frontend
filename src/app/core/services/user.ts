import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class User {
   private baseUrl = environment.baseUrl;
  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    });
  }

  private getJsonHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    });
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    });
  }

  getMyTasks(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Bearer ' + localStorage.getItem('token'), 
    });

    const body = new URLSearchParams(); 

    return this.http.post<any>(
      `/api/hrms/dashboard/my_tasks`, 
      body.toString(),
      { headers }
    );
  }

    // ---- Check-In ----
  // ---- Check-In ----
  checkIn(data: { employee_id: string; checkin_location: string; latitude: string; longitude: string }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/hrms/attendance/checkIn`,
      data,
      { headers: this.getJsonHeaders() }  // ✅ includes token + JSON content type
    );
  }

  // ---- Check-Out ----
  checkOut(data: { employee_id: string; checkout_location: string; latitude: string; longitude: string }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/hrms/attendance/checkOut`,
      data,
      { headers: this.getJsonHeaders() }  // ✅ includes token + JSON content type
    );
  }

  // ----  ----
  getAttendance(data: { employee_id: string; }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/hrms/attendance/get_attendance`,
      data,
      { headers: this.getJsonHeaders() }  // ✅ includes token + JSON content type
    );
  }
  // ----  ----
  getMonthlyAttendance(data: { employee_id: String, month: String, year: String }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/hrms/attendance/get_monthly_attendance`,
      data,
      { headers: this.getJsonHeaders() }  // ✅ includes token + JSON content type
    );
  }

  // Add Timesheet
  addTimesheet(payload: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/hrms/timesheet/add_timesheet`,
      payload,
      { headers: this.getJsonHeaders() }
    );
  }

  // Get Timesheet by Employee
  getTimesheetByEmployee(employee: string, date: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/hrms/timesheet/get_timesheet`,
      { employee, date },
      { headers: this.getJsonHeaders() }
    );
  }


}
