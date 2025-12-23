import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private userRole: string | null = null;
  private role_id: string | null = null;
  private baseUrl: string = environment.baseUrl;

  constructor(
    private router: Router,
    private http: HttpClient,
  ) {

  }

  uploadDocument(formData: FormData): Observable<any> {
    const token = localStorage.getItem('token'); // 👈 fetch token

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // 👈 attach token
    });

    return this.http.post(`${this.baseUrl}/hrms/employee/upload_employee_document`, formData, {
      headers,
    });
  }

  acceptRemoteWorkAggrement(employee_id: string, rw_agreement_accepted: boolean): Observable<any> {
    const token = localStorage.getItem('token'); // 👈 fetch token

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // 👈 attach token
    });

    console.log("is_aggrement_accepted serv--> ", rw_agreement_accepted )
    return this.http.post(`${this.baseUrl}/hrms/employee/accept_rw_agreement`, {
      employee_id: employee_id,
      rw_agreement_accepted: rw_agreement_accepted,      
      rw_agreement_accepted_date: new Date(),
    }, {
      headers,
    });
  }

  getRemoteWorkAgreementStatus(employee_id: string): Observable<any> {
    const token = localStorage.getItem('token'); // 👈 fetch token

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // 👈 attach token
    });

    return this.http.post(`${this.baseUrl}/hrms/employee/get_remote_work_agreement_status`, {
      employee_id: employee_id,
    }, {
      headers,
    });
  }

  documentStatusUpdate(payload: any): Observable<any> {
    const token = localStorage.getItem('token'); // 👈 fetch token

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // 👈 attach token
    });

    return this.http.post(`${this.baseUrl}/hrms/employee/update_employee_document_status`, payload, {
      headers,
    });
  }
}
