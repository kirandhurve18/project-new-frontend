import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

export interface RolePermission {
  menu: {
    _id: string;
    name: string;
    key: string;
  };
  actions: string[];
}

export interface RoleData {
  _id: string;
  role_name: string;
  role_slug: string;
  description: string;
  permissions: RolePermission[];
  is_active: boolean;
  updatedAt: string;
}

export interface ApiResponse {
  message: string;
  success: boolean;
  data: RoleData;
}


@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  private _showSidebar: boolean = true;
  private rolePermissions: any;
  private userRole: string | null = null;
  private role_id: string | null = null;
  private baseUrl: string = environment.baseUrl;

  get showSidebar(): boolean {
    return this._showSidebar;
  }

  set showSidebar(value: boolean) {
    this._showSidebar = value;
  }

  constructor(
    private router: Router,
    private http: HttpClient,
  ) {

  }

  getPermissions(): Observable<any> {
    const role_id = localStorage.getItem('role_id');
    const token = localStorage.getItem('token'); // 👈 fetch token

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // 👈 attach token
    });

    return this.http.get(`${this.baseUrl}/hrms/admin_settings/get_roles/${role_id}`, {
      headers,
    });
  }
}
