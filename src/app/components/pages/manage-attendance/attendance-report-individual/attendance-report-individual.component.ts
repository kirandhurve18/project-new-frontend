import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Superadmin } from '../../../../core/services/superadmin';
import { environment } from '../../../../environments/environment';
import { EmployeeFilterPipe } from '../../../../core/pipes/employee-filter.pipe';

@Component({
  selector: 'app-attendance-reportindividual',
  standalone: true,
  imports: [CommonModule, FormsModule, EmployeeFilterPipe],
  templateUrl: './attendance-report-individual.component.html',
  styleUrls: ['./attendance-report-individual.component.css'], // ✅ fixed typo
})
export class AttendanceReportIndividualComponent implements OnInit {
  userRole: string | null = null;
  employee_id: string | null = null;

  Math: any;
  search_icon = `${environment.BASE_PATH_ASSETS}/icons/search_icon.svg`;


  constructor(private router: Router, private superadmin: Superadmin) { }

  attendanceReportData: any[] = [];
  employeeList: any[] = [];
  searchTerm: string = '';
  entriesToShow = 5;

  // filters
  selectedEmployee: string = '';
  fromDate: string = '';
  toDate: string = '';
  searchText: string = '';
  selectedEmployeeName: string = '';

  // pagination
  page = 1;
  totalRecords = 0;

  ngOnInit(): void {
    let user: any = localStorage.getItem('user');
    this.userRole = localStorage.getItem('user_role');
    this.employee_id = localStorage.getItem('employee_id');

    if (!user) {
      this.router.navigate(['/login']);
    }

    // Load current month by default
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.fromDate = firstDay.toISOString().split('T')[0];
    this.toDate = lastDay.toISOString().split('T')[0];

    this.loadEmployees();
  }

  loadEmployees() {
    this.superadmin.getAllEmployees(1, 50).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.employeeList = res.data;
        }
      },
      error: (err) => {
        console.error('Error loading employees:', err);
      },
    });
  }

  getAttendance() {
    if (!this.selectedEmployee || !this.fromDate || !this.toDate) {
      alert('Please select employee and date range');
      return;
    }

    const params = {
      fromDate: this.fromDate,
      toDate: this.toDate,
      limit: this.entriesToShow,
      page: this.page,
      employee_id: this.selectedEmployee,
      search: this.searchTerm,
      sortBy: 'checkin_date', // 👈 matches API response
      order: 'desc',
    };

    this.superadmin.getEmployeeAttendanceReport(params).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.attendanceReportData = res.data.map((item: any, index: number) => ({
            SNo: index + 1 + (this.page - 1) * this.entriesToShow,
            checkInDate: item.checkin_date,
            checkInTime: item.checkin_time,
            checkInLocation: item.checkin_location,
            checkOutDate: item.checkout_date,
            checkOutTime: item.checkout_time || '-', // handle null
            checkOutLocation: item.checkout_location || '-', // handle null

          }));
          this.totalRecords = res.pagination?.totalRecords || this.attendanceReportData.length;
        } else {
          this.attendanceReportData = [];
        }
      },
      error: (err) => {
        console.error('Error fetching attendance report:', err);
      },
    });
  }

  onEntriesChange() {
    this.page = 1;
    this.getAttendance();
  }

  onSearchChange() {
    this.page = 1;
    this.getAttendance();
  }

  navigateToDailyAttendance() {
    this.router.navigate(['/main/attendance/report']);
  }


  selectEmployee(emp: any) {
    this.selectedEmployee = emp._id;
    this.selectedEmployeeName = emp.full_name;
    this.getAttendance()
  }
}
