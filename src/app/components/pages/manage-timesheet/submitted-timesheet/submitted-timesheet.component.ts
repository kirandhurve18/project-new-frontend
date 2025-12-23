
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Superadmin } from '../../../../core/services/superadmin';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';



interface Timesheet {
  employeeName: string;
  reportDate: string;
  status: string;
}

interface Employee {
  _id: string;
  name: string;
}

@Component({
  selector: 'app-submitted-timesheet',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './submitted-timesheet.component.html',
  styleUrls: ['./submitted-timesheet.component.css']
})
export class SubmittedTimesheetComponent implements OnInit {
  userRole: string | null = null;
  employee_id: string | null = null;
  todayDate: string = '';

  search_icon = `${environment.BASE_PATH_ASSETS}/icons/search_icon.png`;

  employees: any[] = [];
  selectedEmployeeId: string = '';


  entriesOptions = [5, 10, 25, 50];
  entriesToShow = 10;
  searchTerm = '';

  timesheetData: Timesheet[] = [];


  constructor(private router: Router, private superadmin: Superadmin, private toastr: ToastrService) { }


  ngOnInit(): void {
    let user: any = localStorage.getItem('user');
    this.userRole = localStorage.getItem('user_role');
    this.employee_id = localStorage.getItem('employee_id') || '';

    this.todayDate = new Date().toISOString().split('T')[0];

    if (!user) {
      this.router.navigate(['/login']);
    }
    // this.getAllEmployees();
    this.loadTeamMembers();
  }


  getEmployees() {
    this.superadmin.getAllEmployees().subscribe({
      next: (res: any) => {
        this.employees = res.data || [];
        if (this.employees.length > 0) {
          this.selectedEmployeeId = this.employees[0]._id;
        }
      },
      error: (err) => {
        console.error('Error fetching employees:', err);
      }
    });
  }


  /** ✅ Fetch employee list for dropdown */
  getAllEmployees() {
    this.superadmin.getAllEmployees().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.employees = res.data.map((emp: any) => ({
            _id: emp._id,
            name: emp.full_name
              ? emp.full_name
              : emp.designation_name
                ? emp.designation_name
                : 'Unknown'
          }));

          if (this.employees.length > 0) {
            this.selectedEmployeeId = this.employees[0]._id;
          }
        }
      },
      error: (err) => {
        console.error('Error fetching employees:', err);
      }
    });
  }


  /** ✅ Map API status codes to UI status */
  private mapStatus(submitStatus: number): string {
    switch (submitStatus) {
      case 0:
        return 'Pending';
      case 1:
        return 'Approved';
      case 2:
        return 'Submitted';
      case 3:
        return 'Rejected';
      default:
        return 'Unknown';
    }
  }

  /** ✅ Search + Filter logic */
  get filteredData(): Timesheet[] {
    return this.timesheetData.filter((row) =>
      row.employeeName?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  reassignTimesheet(row: Timesheet) {
    console.log('Reassigning timesheet for:', row);
    // TODO: open modal
  }



  // ✅ Team Members fetch from backend
  loadTeamMembers(): void {
    if (!this.employee_id) return;

    this.superadmin.getTeamMembers(this.employee_id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.employees = res.data.map((emp: any, index: number) => ({
            sr: index + 1,
            employeeId: emp._id,
            name: emp.first_name + ' ' + emp.last_name,
            mobile: emp.mobile || 'N/A',
            reportStatus: emp.report_status || 'Not Submitted'
          }));
        }
      },
      error: (err) => {
        console.error('Error fetching team members:', err);
      }
    });
  }


  // // ✅ Team Members fetch from backend
  // getTimesheetStatusByTeam(): void {
  //   if (!this.employee_id) return;
  //   this.superadmin.getTimesheetStatusByTeam({ employee_id: this.employee_id, date: this.todayDate }).subscribe({


  //   });
  // }

  // ✅ Report Status Color
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'submitted':
        return '#FFA500'; // Orange
      case 'not submitted':
        return '#F3523C'; // Red
      case 'approved':
        return '#28A745'; // Green
      default:
        return '#000000'; // Black
    }
  }

  // ✅ Redirect to Timesheet Page
  viewReport(employeeId: string, date: any): void {
    this.router.navigate(['/main/view-timesheet', employeeId, date]);
  }

}
