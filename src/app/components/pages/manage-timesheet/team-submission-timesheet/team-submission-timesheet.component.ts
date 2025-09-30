import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Superadmin } from '../../../../core/services/superadmin';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';

interface Timesheet {
  sr: number;
  date:string;
  timesheet_id: string,
  employee_id: string;
  name: string;
  mobile: string;
  reportStatus: string;
}

@Component({
  selector: 'app-team-submission-timesheet',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './team-submission-timesheet.component.html',
  styleUrls: ['./team-submission-timesheet.component.css']
})
export class TeamSubmissionTimesheetComponent implements OnInit {
  userRole: string | null = null;
  employee_id: string | null = null;
  todayDate: string = '';

  search_icon = `${environment.BASE_PATH_ASSETS}/icons/search_icon.svg`;

  employees: Timesheet[] = [];
  selectedList: string = 'team'; // default → My Team

  entriesOptions = [5, 10, 25, 50];
  searchTerm: string = '';
  entriesToShow: number = 10;

  statusLabels: { [key: number]: string } = {
    0: 'Pending',
    1: 'Saved',
    2: 'Final Submitted',
    3: 'Approved',
    4: 'Rejected',
    5: 'Reassigned'
  };

  constructor(
    private router: Router,
    private superadmin: Superadmin,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    let user: any = localStorage.getItem('user');
    this.userRole = localStorage.getItem('user_role');
    this.employee_id = localStorage.getItem('employee_id') || '';

    this.todayDate = new Date().toISOString().split('T')[0];

    if (!user) {
      this.router.navigate(['/login']);
    }

    this.loadEmployees();
  }

  /** ✅ Reassign Timesheet */
  reassignTimesheet(row: Timesheet) {
    const reason = prompt('Enter reason for reassignment:');
    if (!reason) return;

    // const userId = localStorage.getItem('employee_id'); // <-- Make sure you save this at login
    // if (!userId) {
    //   alert('❌ UserId missing in localStorage. Please check login flow.');
    //   return;
    // }

    const payload = {
      timesheetId: row.timesheet_id,
      reassignedBy: this.employee_id,
      reason: reason
    };

    // console.log('Payload being sent:', payload);

    this.superadmin.reassignTimesheet(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          // alert('✅ ' + res.message);
          this.toastr.success(res.message)
          // update status in UI without reload
          // const index = this.timesheetData.findIndex(t => t._id === row._id);
          // if (index !== -1) {
          //   this.timesheetData[index].status = 'Reassigned';
          // }
          this.loadEmployees();
        } else {
          this.toastr.error(res.message)
          // alert('❌ ' + res.message);
        }
      },
      error: (err) => {
        this.toastr.error(err.error.message)
        console.error('Error reassigning timesheet:', err);
        // alert('❌ ' + (err.error?.message || 'Something went wrong'));
      }
    });
  }

  // ✅ Load Team Members OR All Employees
  loadEmployees(): void {
    if (!this.employee_id) return;

    if (this.selectedList === 'team') {
      this.superadmin
        .getTimesheetStatusByTeam({
          employee_id: this.employee_id,
          date: this.todayDate,
          search: this.searchTerm,
          page: 1,
          limit: this.entriesToShow
        })
        .subscribe({
          next: (res: any) => {

            if (res.success && res.data) {
              console.log("response timesheet submission --> ", res.data)
              this.employees = res.data.map((emp: any, index: number) => ({
                sr: index + 1,
                date:emp.date,
                employee_id: emp.employee_id,
                timesheet_id: emp.timesheet_id,
                name: emp.full_name,
                mobile: emp.employee_number || 'N/A',
                reportStatus: this.statusLabels[emp.submitStatus] || 'Unknown'
              }));
            } else {
              this.employees = [];
            }
          },
          error: (err) => {
            console.error('Error fetching team members:', err);
            this.toastr.error(err.error.message || 'Failed to load team members');
          }
        });
    } else if (this.selectedList === 'all') {
      // All Employees → Call getTimesheetStatusByDate
      this.superadmin
        .getTimesheetStatusByDate({
          employee_id: this.employee_id,
          date: this.todayDate,
          search: this.searchTerm,
          page: 1,
          limit: this.entriesToShow
        })
        .subscribe({
          next: (res: any) => {
            if (res.success && res.data) {
              console.log("response timesheet submission all employee--> ", res.data)

              this.employees = res.data.map((emp: any, index: number) => ({
                sr: index + 1,
              date:emp.date,
                employee_id: emp.employee_id,
                timesheet_id: emp.timesheet_id,
                name: emp.full_name,
                mobile: emp.employee_number || 'N/A',
                reportStatus: this.statusLabels[emp.submitStatus] || 'Unknown'
              }));
            } else {
              this.employees = [];
            }
          },
          error: (err) => {
            console.error('Error fetching all employees:', err);
            this.toastr.error(err.error.message || 'Failed to load employees');
          }
        });
    }
  }

  // ✅ Report Status Color
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'final submitted':
        return '#FFA500'; // Orange
      case 'pending':
        return '#F3523C'; // Red
      case 'approved':
        return '#28A745'; // Green
      case 'rejected':
        return '#DC3545'; // Dark red
      default:
        return '#000000'; // Black
    }
  }

  // ✅ Redirect to Timesheet Page
  viewReport(employeeId: string, date: any): void {
    console.log("employeeId ---> ", employeeId)
    this.router.navigate(['/main/view-timesheet', employeeId, date]);
  }

  onSearchChange() {
    this.loadEmployees()
  }

  onLimitChange() {
    this.loadEmployees()
  }
}
