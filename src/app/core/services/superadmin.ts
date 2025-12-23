import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


export interface LeaveService {
  _id: string;
  title: string;
  duration: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  _id: string;
  department_name: string;
  status: 'active' | 'inactive';
}

export interface Designation {
  _id: string;
  designation_name: string;
  departmentId: string;
  status: 'active' | 'inactive';
}

export interface SubDesignation {
  _id: string;
  sub_designation_name: string;
  status: 'active' | 'inactive';
}

export interface WeekOff {
  id: string;
  day: string;
  status: 'active' | 'inactive';
}

export interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  status: 'active' | 'inactive';
}


@Injectable({
  providedIn: 'root',
})
export class Superadmin {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }


  private getHeaders(contentType: 'json' | 'url' | 'none' = 'json'): HttpHeaders {
    const headers: any = {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    };

    if (contentType === 'json') headers['Content-Type'] = 'application/json';
    if (contentType === 'url') headers['Content-Type'] = 'application/x-www-form-urlencoded';

    return new HttpHeaders(headers);
  }


  getAttendanceSummary(): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/hrms/attendance/get_attendance_summary`,
      {},
      { headers: this.getHeaders('none') }
    );
  }

  getMyTasks(): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/hrms/dashboard/my_tasks`,
      '',
      { headers: this.getHeaders('url') }
    );
  }

  getEmployeesOnLeaveToday(): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/hrms/dashboard/employees_on_leave_today`,
      '',
      { headers: this.getHeaders('url') }
    );
  }

  getApprovalPendings(employee_id: string, user_role: number): Observable<any> {
    const url = `${this.baseUrl}/hrms/dashboard/approval_pendings?employee_id=${employee_id}&user_role=${user_role}`;
    return this.http.post<any>(url, {}, { headers: this.getHeaders('url') });
  }


  // getAllEmployees(page: number = 1, limit: number = 10): Observable<any> {
  //   return this.http.get<any>(
  //     `${this.baseUrl}/hrms/employee/get_all_employees?Staging=true&page=${page}&limit=${limit}`,
  //     { headers: this.getHeaders('none') }
  //   );
  // }
  getAllEmployees(page: number = 1, limit: number = 10, search: string = ''): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/hrms/employee/get_all_employees`,
      {
        headers: this.getHeaders('none'),
        params: {
          page: page.toString(),
          limit: limit.toString(),
          search: search,
          // sortBy: '',
          order: 'desc'
        }
      }
    );
  }


  addNewEmployee(payload: any, files?: { [key: string]: File }): Observable<any> {
    const formData = new FormData();

    Object.keys(payload).forEach((key) => {
      const value = payload[key];
      if (value !== undefined && value !== null) {
        formData.append(
          key,
          typeof value === 'object' ? JSON.stringify(value) : value
        );
      }
    });

    if (files) {
      Object.entries(files).forEach(([key, file]) => {
        if (file) formData.append(key, file);
      });
    }

    return this.http.post(
      `${this.baseUrl}/hrms/employee/add_new_employee`,
      formData,
      { headers: this.getHeaders('none') }
    );
  }

  updateEmployee(payload: any, files?: { [key: string]: File }): Observable<any> {
    const formData = new FormData();

    Object.keys(payload).forEach((key) => {
      const value = payload[key];
      if (value !== undefined && value !== null) {
        formData.append(
          key,
          typeof value === 'object' ? JSON.stringify(value) : value
        );
      }
    });

    if (files) {
      Object.entries(files).forEach(([key, file]) => {
        if (file) formData.append(key, file);
      });
    }

    return this.http.post(
      `${this.baseUrl}/hrms/employee/update_employee`,
      formData,
      { headers: this.getHeaders('none') }
    );
  }

  getEmployeeById(id: string): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/hrms/employee/${id}`,
      { headers: this.getHeaders('none') }
    );
  }

  downloadEmployeeListService(): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/hrms/employee/download_employee_list`,
      { responseType: 'blob' }
    );
  }


  getFestivalLeaves(page: number = 1, limit: number = 10, search: string = ''): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/hrms/dashboard/festival_leaves`,
      {
        headers: this.getHeaders('none'),
        params: {
          page: page,
          limit: limit,
          search: search
        }
      }
    );
  }

  addFestivalLeaves(festival: {
    festival_name: string;
    festival_date: string;
    is_every_year: boolean;
  }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/dashboard/add_festival_leave`,
      festival,
      { headers: this.getHeaders('json') }
    );
  }
  getFestivalLeaveById(festivalId: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/hrms/dashboard/festival_leaves/${festivalId}`,
      { headers: this.getHeaders('json') }
    );
  }
  updateFestivalLeave(payload: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/dashboard/update_festival_leave`,
      payload,
      { headers: this.getHeaders('json') }
    );
  }

  // ----------------- Department APIs -----------------
  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(
      `${this.baseUrl}/hrms/department/get_all_departments`,
      { headers: this.getHeaders('none') }
    );
  }

  addDepartment(data: any): Observable<any> {
    const body = {
      departments: [
        {
          name: data.department_name || data.dept_name,   // ✅ match backend key
          status: (data.status || 'active').toLowerCase() // ✅ always lowercase
        },
      ],
    };
    return this.http.post(
      `${this.baseUrl}/hrms/department/add_department`,
      body,
      { headers: this.getHeaders('json') }
    );
  }

  updateDepartment(data: any): Observable<any> {
    console.log("data --> ", data)
    const body = {
      department_id: data.department_id,       // ✅ backend expects dept_id
      department_name: data.department_name,  // ✅ update name also
      status: data.status,    // ✅ normalize
    };
    return this.http.post(
      `${this.baseUrl}/hrms/department/update_department`,
      body,
      { headers: this.getHeaders('json') }
    );
  }

  deleteDepartment(id: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/department/delete_department`,
      { dept_id: id },   // ✅ backend expects dept_id
      { headers: this.getHeaders('json') }
    );
  }



  getDesignations(): Observable<Designation[]> {
    return this.http.get<Designation[]>(
      `${this.baseUrl}/hrms/designation/get_all_designation`,
      { headers: this.getHeaders('none') }
    );
  }

  addDesignation(data: any): Observable<any> {
    const body = {
      designation_name: data.designation_name,
      department_id: data.department_id,
      status: data.status,
    };
    return this.http.post(
      `${this.baseUrl}/hrms/designation/add_designation`,
      body,
      { headers: this.getHeaders('json') }
    );
  }

  updateDesignation(data: any): Observable<any> {
    const body = {
      designation_id: data._id || data.designation_id || data.id,
      designation_name: data.designation_name,
      department_id: data.department_id,
      status: data.status,
    };
    return this.http.post(
      `${this.baseUrl}/hrms/designation/update_designation`,
      body,
      { headers: this.getHeaders('json') }
    );
  }

  deleteDesignation(id: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/designation/delete_designation`,
      { designation_id: id },
      { headers: this.getHeaders('json') }
    );
  }


  getSubdesignations(): Observable<SubDesignation[]> {
    return this.http.get<SubDesignation[]>(
      `${this.baseUrl}/hrms/sub_designation/get_all_subdesignation`,
      { headers: this.getHeaders('none') }
    );
  }

  addSubdesignation(data: any): Observable<any> {
    const body = {
      subdesignations: [{ sub_designation_name: data.sub_designation_name, status: data.status || 'active' }],
    };
    return this.http.post(
      `${this.baseUrl}/hrms/sub_designation/add_subdesignation`,
      body,
      { headers: this.getHeaders('json') }
    );
  }

  updateSubdesignation(data: any): Observable<any> {
    const body = {
      sub_designation_id: data._id || data.sub_designation_id || data.id,
      sub_designation_name: data.sub_designation_name,
      status: (data.status || 'active').toLowerCase(),
    };
    return this.http.post(
      `${this.baseUrl}/hrms/sub_designation/update_subdesignation`,
      body,
      { headers: this.getHeaders('json') }
    );
  }

  deleteSubdesignation(id: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/sub_designation/delete_subdesignation`,
      { sub_designation_id: id },
      { headers: this.getHeaders('json') }
    );
  }


  getLeaveServices(): Observable<LeaveService[]> {
    return this.http.get<LeaveService[]>(
      `${this.baseUrl}/hrms/admin_settings/get_leave_services`,
      { headers: this.getHeaders('json') }
    );
  }

  addLeaveOrService(data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/admin_settings/add_leave_services`,
      data,
      { headers: this.getHeaders('json') }
    );
  }

  updateLeaveOrService(data: { id: string; title: string; duration: string }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/admin_settings/update_leave_services`,
      data,
      { headers: this.getHeaders('json') }
    );
  }

  deleteLeaveOrService(id: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/admin_settings/delete_leave_services`,
      { id },
      { headers: this.getHeaders('json') }
    );
  }


  getWeekOff(): Observable<WeekOff[]> {
    return this.http.get<WeekOff[]>(
      `${this.baseUrl}/hrms/admin_settings/get_week_off_setup`,
      { headers: this.getHeaders('none') }
    );
  }

  addWeekOff(data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/admin_settings/add_week_off_setup`,
      { work_mode: data.work_mode, days: data.days },
      { headers: this.getHeaders('json') }
    );
  }

  updateWeekOff(data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/admin_settings/update_week_off_setup`,
      { id: data.id, work_mode: data.work_mode, days: data.days },
      { headers: this.getHeaders('json') }
    );
  }

  deleteWeekOff(id: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/admin_settings/delete_week_off_setup`,
      { id },
      { headers: this.getHeaders('json') }
    );
  }


  getShifts(): Observable<Shift[]> {
    return this.http.get<Shift[]>(
      `${this.baseUrl}/hrms/admin_settings/get_shift_timings`,
      { headers: this.getHeaders('none') }
    );
  }

  addShift(data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/admin_settings/add_shift_timings`,
      { shift_timings: data.shift_timings || data },
      { headers: this.getHeaders('json') }
    );
  }

  updateShift(data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/admin_settings/update_shift_timings`,
      { shift_timings: data.shift_timings || data },
      { headers: this.getHeaders('json') }
    );
  }

  deleteShift(id: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/admin_settings/delete_shift_timings`,
      { id },
      { headers: this.getHeaders('json') }
    );
  }

  getRoles(): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/hrms/admin_settings/get_roles_list`,
      { headers: this.getHeaders('none') }
    );
  }

  getMenus(): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/dashboard/get_menus`,
      { headers: this.getHeaders('json') }
    );
  }

  addRole(data: any): Observable<any> {
    const payload = {
      roles: [
        {
          role_name: data.role_name,
          description: data.description || '',
          is_active: data.is_active ?? true,
          permissions: (data.permissions || []).map((p: any) => ({
            menu: p._id || p.menu,
            actions: Array.isArray(p.actions)
              ? p.actions
              : [
                ...(p.read ? ['read'] : []),
                ...(p.write ? ['write'] : []),
                ...(p.create ? ['create'] : []),
              ],
          })),
        },
      ],
    };
    return this.http.post(
      `${this.baseUrl}/hrms/admin_settings/add_roles`,
      payload,
      { headers: this.getHeaders('json') }
    );
  }

  updateRole(data: any): Observable<any> {
    const payload = {
      _id: data._id,
      data: {
        role_name: data.role_name,
        description: data.description || '',
        is_active: data.is_active ?? true,
        permissions: (data.permissions || []).map((p: any) => ({
          menu: p._id || p.menu,
          actions: Array.isArray(p.actions)
            ? p.actions
            : [
              ...(p.read ? ['read'] : []),
              ...(p.write ? ['write'] : []),
              ...(p.create ? ['create'] : []),
            ],
        })),
      },
    };
    return this.http.post(
      `${this.baseUrl}/hrms/admin_settings/update_role`,
      payload,
      { headers: this.getHeaders('json') }
    );
  }


  checkIn(data: {
    employee_id: string;
    checkin_location: string;
    latitude: string;
    longitude: string;
  }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/attendance/checkIn`,
      data,
      { headers: this.getHeaders('json') }
    );
  }

  checkOut(data: {
    employee_id: string;
    checkout_location: string;
    latitude: string;
    longitude: string;
  }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/attendance/checkOut`,
      data,
      { headers: this.getHeaders('json') }
    );
  }

  getAttendance(data: { employee_id: string }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/attendance/get_attendance`,
      data,
      { headers: this.getHeaders('json') }
    );
  }

  getMonthlyAttendance(data: { employee_id: string; month: string; year: string }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/attendance/get_monthly_attendance`,
      data,
      { headers: this.getHeaders('json') }
    );
  }


  addTimesheet(payload: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/timesheet/add_timesheet`,
      {
        employee: payload.employee,
        date: payload.date,
        submitStatus: payload.submitStatus,
        workLogs: payload.workLogs,
      },
      { headers: this.getHeaders('json') }
    );
  }

  getTimesheetByEmployee(employeeId: string, date: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/timesheet/get_timesheet`,
      { employee: employeeId, date },
      { headers: this.getHeaders('json') }
    );
  }

  getTimesheetStatusByEmployee(payload: {
    fromDate: string;
    toDate: string;
    employee_id: string | null;
    page: number;
    limit: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/timesheet/get_timesheet_status_by_employee`,
      payload,
      { headers: this.getHeaders('json') }
    );
  }

  // getTimesheetStatusByTeam(payload: {
  //   date: string;
  //   employee_id: string | null;
  //   page?: number;
  //   limit?: number;
  //   sortBy?: string;
  //   order?: 'asc' | 'desc';
  // }): Observable<any> {
  //   return this.http.post(
  //     `${this.baseUrl}/hrms/timesheet/get_timesheet_status_by_team`,
  //     payload,
  //     { headers: this.getHeaders('json') }
  //   );
  // }


  getTeamLeads(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/hrms/employee/get_team_leads`,
      { headers: this.getHeaders('none') }
    );
  }

  getTeamManagers(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/hrms/employee/get_team_managers`,
      { headers: this.getHeaders('none') }
    );
  }
  getRoleById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/hrms/admin_settings/get_roles/${id}`);
  }

  getTeamMembers(employee_id: string | null): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/hrms/employee/get_team_member`,
      { employee_id: employee_id },
      { headers: this.getHeaders('json') }
    );
  }

  reassignTimesheet(payload: {
    timesheetId: string;
    reassignedBy: string | null;
    reason: string;
  }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/timesheet/reassign_timesheet`,
      payload,
      { headers: this.getHeaders('json') }
    );
  }

  getReportStatus(payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/hrms/timesheet/get_timesheet_status_by_employee`,
      payload,
      { headers: this.getHeaders('json') }
    );
  }

  applyLeave(payload: {
    employee_id: string;
    leave_type: string;
    leave_mode: string;
    from_date: string;
    to_date: string;
    reason: string;
    number_of_days: number;
    start_time?: string;
    end_time?: string;
    half_day_session?: string;
  }) {
    return this.http.post(
      `${this.baseUrl}/hrms/leave/apply_leave`,
      payload,
      { headers: this.getHeaders('json') }
    );
  }

  getLeaveDetailsByTeam(payload: {
    employee_id: string | null;
    team_member_id?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    return this.http.post(
      `${this.baseUrl}/hrms/leave/get_leave_details_by_team`,
      payload,
      { headers: this.getHeaders('json') }
    );
  }


  getLeaveDetailsByEmployee(payload: { employee_id: string | null; year: number }) {
    return this.http.post(
      `${this.baseUrl}/hrms/leave/get_leave_details_by_employee`,
      payload,
      { headers: this.getHeaders('json') }
    );
  }

  cancelLeave(payload: { leave_id: string; status: string; approver_id?: string }) {
    return this.http.post(
      `${this.baseUrl}/hrms/leave/update_leave_status`,
      payload,
      { headers: this.getHeaders('json') }
    );
  }
  getTeamOnLeave(payload: any) {
    return this.http.post<any>(
      `${this.baseUrl}/hrms/leave/get_leave_details_by_team`,
      payload
    );

  }

  getTeamOnLeavetoday(payload: { _id: string }): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/hrms/leave/team_on_leave`,
      payload,
      { headers: this.getHeaders('json') }
    );
  }

  getLeaveById(payload: any) {
    return this.http.post(`${this.baseUrl}/hrms/leave/get_leave_by_id`, payload);
  }

  updateLeaveStatus(payload: any) {
    const token = localStorage.getItem('token'); // 👈 assuming your token is stored as 'token'
    console.log("token --> ", token)
    const headers = {
      Authorization: `Bearer ${token}`
    };

    return this.http.post<any>(
      `${this.baseUrl}/hrms/leave/update_leave_status`,
      payload,
      { headers }
    );
  }


  getActiveLeaveList(payload: { search?: string; page?: number; limit?: number }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/leave/get_active_leave_list`,
      {},
      {
        headers: this.getHeaders('json'),
        params: {
          search: payload.search || '',
          page: (payload.page || 1).toString(),
          limit: (payload.limit || 10).toString(),
        },
      }
    );
  }

  getPastLeaveList(payload: { search?: string; page?: number; limit?: number }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/leave/get_past_leave_list`,
      {},
      {
        headers: this.getHeaders('json'),
        params: {
          search: payload.search || '',
          page: (payload.page || 1).toString(),
          limit: (payload.limit || 10).toString(),
        },
      }
    );
  }

  updateEmployeeById(id: string, employeeData: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/hrms/employee/update_employee_by_id`,
      {
        _id: id,
        data: employeeData
      }
    );
  }

  updateEmployeeStatus(id: string, isActive: boolean) {
    const body = {
      _id: id,
      is_active: isActive
    };

    return this.http.post<any>(
      `${this.baseUrl}/hrms/employee/update_employee_status`,
      body,
      { headers: this.getHeaders('json') }
    );
  }



  getEmployeeAttendanceReport(payload: {
    fromDate: string;
    toDate: string;
    limit: number;
    page: number;
    employee_id: string;
    search?: string;
    sortBy?: string;
    order?: string;   // 👈 allow string instead of only 'asc' | 'desc'
  }): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/hrms/attendance/get_employee_attendance_report`,
      {
        headers: this.getHeaders('none'),
        params: {
          fromDate: payload.fromDate,
          toDate: payload.toDate,
          limit: payload.limit.toString(),
          page: payload.page.toString(),
          employee_id: payload.employee_id,
          search: payload.search || '',
          sortBy: payload.sortBy || 'status',
          order: payload.order || 'desc',
        },
      }
    );
  }

  /**
   * ✅ New API for Daily Attendance (Present Employee List)
   * Example API: /hrms/attendance/get_present_employee_list?date=2025-09-25&page=1&limit=10
   */
  getPresentEmployeeList(payload: {
    date: string;
    page: number;
    limit: number;
    search?: string
  }): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/hrms/attendance/get_present_employee_list`,
      {
        headers: this.getHeaders('none'),
        params: {
          date: payload.date,
          page: payload.page.toString(),
          limit: payload.limit.toString(),
          search: payload.search || '',
        },
      }
    );
  }

  updateAttendanceStatus(payload: { attendance_id: string; status: number }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/attendance/update_present_employee_status`,
      payload,
      { headers: this.getHeaders('json') }
    );
  }

  approveTimesheet(payload: { timesheetId: string; approvedBy: string }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/timesheet/approve_timesheet`,
      payload,
      { headers: this.getHeaders('json') }
    );
  }
  rejectTimesheet(payload: { timesheetId: string; rejectedBy: string, reason: string }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/timesheet/reject_timesheet`,
      payload,
      { headers: this.getHeaders('json') }
    );
  }

  getTimesheetStatusByDate(payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/hrms/timesheet/get_timesheet_status_by_date`,
      payload,
      { headers: this.getHeaders('json') }
    );
  }

  getTimesheetStatusByTeam(payload: { employee_id: string; date: string; search?: string; page: number, limit: number }) {
    return this.http.post(`${this.baseUrl}/hrms/timesheet/get_timesheet_status_by_team`, payload);
  }

  getMonthlyLateComers(payload: { month: string }): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/hrms/attendance/get_monthly_late_commers`,
      {},
      { headers: this.getHeaders('json') }
    );
  }


  getReviewerLeaveList(payload: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/hrms/leave/get_reviewer_leave_list`, payload);
  }

  updateLeaveStatusByReviewer(payload: {
    leave_id: string;
    status: string;              // "Approved" | "Rejected" | "Cancelled"
    reviewer_id: string;
    reviewer_comment: string;  // optional
    rejection_reason: string;  // optional
  }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/leave/update_leave_status_by_reviewer`,
      payload,
      { headers: this.getHeaders('json') }
    );
  }

  getEmployeeLeaveSummary(payload: { employee_id: string; year: number }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/hrms/leave/get_leave_summary_by_employee`,
      payload,
      { headers: this.getHeaders('json') }
    );
  }

  getTeamHierarchy(payload: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/hrms/employee/team_hierarchy`,
      {
        headers: this.getHeaders('none'),
        params: {
          page: (payload.page || 1).toString(),
          limit: (payload.limit || 10).toString(),
          search: payload.search || '',
          sortBy: payload.sortBy || 'designation_name',
          order: payload.order || 'asc',
        },
      }
    );
  }


  addTask(task: { title: string; employee_id: string }): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/hrms/dashboard/tasks`,
      task,
      { headers: this.getHeaders('json') }
    );
  }
  updateTask(id: string, task: { title: string; employee_id: string }): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/hrms/dashboard/tasks/${id}`,
      task,
      { headers: this.getHeaders('json') }
    );
  }



}