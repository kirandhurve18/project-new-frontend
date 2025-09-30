import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarCommonModule } from 'angular-calendar';
import { CalendarWrapperModule } from '../../../../shared/calendar-wrapper/calendar-wrapper-module';
import { Superadmin } from '../../../../core/services/superadmin';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-attendance-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarCommonModule,
    CalendarWrapperModule,
  ],
  templateUrl: './attendance-report.component.html',
  styleUrls: ['./attendance-report.component.css'],
})
export class AttendanceReportComponent implements OnInit {
  Math: any = Math;
  search_icon = `${environment.BASE_PATH_ASSETS}/icons/search_icon.svg`;


  constructor(private router: Router, private superadmin: Superadmin) { }

  // UI States
  entriesToShow = 10;
  searchTerm = '';
  attendanceReportData: any[] = [];

  // Pagination
  totalRecords = 0;
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  // Date filters (default today)
  fromDate: string = this.getTodayDate();
  toDate: string = this.getTodayDate();

  // Mode: "daily" or "report"
  mode: 'daily' | 'report' = 'daily';

  // Selected employee for report
  selectedEmployeeId: string = '';

  // Track active dropdown row
  activeRow: number | null = null;

  // Status mapping (string → number for API)
  statusMapping: { [key: string]: number } = {
    'Full Day Leave': 1,
    'Half Day Leave': 2,
    'Early Leave': 3,
    'Late Joining': 4,
    'Comp Off': 5,
    'Electricity Issue': 6,
    'Late Mark': 7,
  };
  statusOptions = [
    'Full Day Leave',
    'Half Day Leave',
    'Early Leave',
    'Late Joining',
    'Comp Off',
    'Electricity Issue',
    'Late Mark'
  ];

  attendanceStatusLabels: { [key: number]: string } = {
    1: 'Full Day',
    2: 'Half Day',
    3: 'Early Leave',
    4: 'Late Join',
    5: 'Comp Off',
    6: 'Electricity Issue',
    7: 'Late Mark'
  };


  ngOnInit(): void {
    this.getAttendanceReport();
  }

  /** ✅ Get today's date in yyyy-mm-dd */
  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  /** ✅ Unified function (Daily + Report) */
  getAttendanceReport() {
    if (this.mode === 'daily') {
      this.fetchDailyAttendance();
    } else {
      this.fetchEmployeeReport();
    }
  }

  /** ✅ Daily Attendance API */
  private fetchDailyAttendance() {
    const payload = {
      date: this.fromDate,
      page: this.currentPage,
      limit: this.entriesToShow,
      search: this.searchTerm,
    };

    this.superadmin.getPresentEmployeeList(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.setPagination(res.pagination);

          this.attendanceReportData = res.data.map(
            (item: any, index: number) => ({
              _id: item._id, // ✅ Needed for status update
              SNo: (this.currentPage - 1) * this.pageSize + (index + 1),
              name: item.full_name,
              checkInDate: item.checkin_date,
              checkInTime: item.checkin_time,
              checkInLocation: item.checkin_location || 'N/A',
              checkOutDate: item.checkout_date || 'N/A',
              checkOutTime: item.checkout_time || 'N/A',
              checkOutLocation: item.checkout_location || 'N/A',
              latLong:
                item.latitude && item.longitude
                  ? `${item.latitude}, ${item.longitude}`
                  : 'N/A',
              currentStatus: this.attendanceStatusLabels[item.status],
            })
          );
        }
      },
      error: (err) => {
        console.error('API Error (Daily):', err);
      },
    });
  }

  /** ✅ Employee Attendance Report API (date range) */
  private fetchEmployeeReport() {
    const payload = {
      fromDate: this.fromDate,
      toDate: this.toDate,
      limit: this.entriesToShow,
      page: this.currentPage,
      employee_id: this.selectedEmployeeId || '',
      search: this.searchTerm,
      sortBy: 'status',
      order: 'desc' as const,
    };

    this.superadmin.getEmployeeAttendanceReport(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.setPagination(res.pagination);

          this.attendanceReportData = res.data.map(
            (item: any, index: number) => ({
              _id: item._id, // ✅ Needed for status update
              SNo: (this.currentPage - 1) * this.pageSize + (index + 1),
              name: item.full_name,
              checkInDate: item.checkin_date,
              checkInTime: item.checkin_time,
              checkInLocation: item.checkin_location || 'N/A',
              checkOutDate: item.checkout_date || 'N/A',
              checkOutTime: item.checkout_time || 'N/A',
              checkOutLocation: item.checkout_location || 'N/A',
              latLong:
                item.latitude && item.longitude
                  ? `${item.latitude}, ${item.longitude}`
                  : 'N/A',
              currentStatus: item.status,
            })
          );
        }
      },
      error: (err) => {
        console.error('API Error (Report):', err);
      },
    });
  }

  /** ✅ Common Pagination Setter */
  private setPagination(pagination: any) {
    this.totalRecords = pagination.totalRecords;
    this.currentPage = pagination.currentPage;
    this.totalPages = pagination.totalPages;
    this.pageSize = pagination.pageSize;
  }

  // --------------------------
  // 🔹 UI Actions
  // --------------------------

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.getAttendanceReport();
    }
  }

  onSearch() {
    this.currentPage = 1;
    this.getAttendanceReport();
  }

  onEntriesChange() {
    this.currentPage = 1;
    this.getAttendanceReport();
  }

  onDateFilter() {
    this.currentPage = 1;
    this.getAttendanceReport();
  }

  showDailyAttendance() {
    this.mode = 'daily';
    this.currentPage = 1;
    this.getAttendanceReport();
  }

  showEmployeeReport(employeeId: string) {
    this.mode = 'report';
    this.selectedEmployeeId = employeeId || '';
    this.currentPage = 1;
    this.getAttendanceReport();
  }

  navigateToEmployeeAttendanceReport() {
    this.router.navigate(['/main/attendance/report-individual']);
  }

  // --------------------------
  // 🔹 Change Status Actions
  // --------------------------

  toggleDropdown(rowId: number) {
    this.activeRow = this.activeRow === rowId ? null : rowId;
  }

  updateStatus(item: any, status: string) {
    const statusCode = this.statusMapping[status];

    const payload = {
      attendance_id: item._id,
      status: statusCode,
    };

    // Update UI instantly
    item.currentStatus = status;

    // Call API
    this.superadmin.updateAttendanceStatus(payload).subscribe({
      next: (res) => {
        console.log('Status updated successfully:', res);
      },
      error: (err) => {
        console.error('Error updating status:', err);
      },
    });

    // Close dropdown
    this.activeRow = null;
  }
}
