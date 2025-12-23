
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Superadmin } from '../../../../core/services/superadmin';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


interface Timesheet {
  _id: string;           // timesheetId
  employeeName: string;
  reportDate: string;
  status: string;
}

interface Employee {
  _id: string;
  name: string;
}

@Component({
  selector: 'app-team-work-summary-timesheet',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './team-work-summary-timesheet.component.html',
  styleUrls: ['./team-work-summary-timesheet.component.css']
})
export class TeamWorkSummaryTimesheetComponent implements OnInit {
  
  userRole: string | null = null;
  employee_id: string | null = null;

  employees: Employee[] = [];
  selectedEmployeeId: string = '';

  fromDate: string = '';
  toDate: string = '';

  entriesOptions = [5, 10, 25, 50];
  entriesToShow = 10;
  searchTerm = '';

  timesheetData: Timesheet[] = [];

  constructor(private router: Router, private superadmin: Superadmin, private toastr: ToastrService) { }


  ngOnInit(): void {
    let user: any = localStorage.getItem('user');
    this.userRole = localStorage.getItem('user_role');
    this.employee_id = localStorage.getItem('employee_id') || '';

    if (!user) {
      this.router.navigate(['/login']);
    }

    const today = new Date();
    const oneMonthAgo = new Date(today.setMonth(today.getMonth() - 1));
    this.fromDate = oneMonthAgo.toISOString().split('T')[0];
    this.toDate = new Date().toISOString().split('T')[0];;

    this.getTeamMembers();
    
  }

  /** ✅ Fetch employee list */
  getTeamMembers() {
    this.superadmin.getTeamMembers(this.employee_id).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.employees = res.data.map((emp: any) => ({
            _id: emp._id,
            name: emp.first_name + ' ' + emp.last_name,
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

  /** ✅ Fetch timesheet history */
  getReportStatus() {
    if (!this.selectedEmployeeId || !this.fromDate || !this.toDate) return;

    const payload = {
      fromDate: this.fromDate,
      toDate: this.toDate,
      employee_id: this.selectedEmployeeId,
      page: 1,
      limit: this.entriesToShow,
      sortBy: 'date',
      order: 'desc'
    };

    this.superadmin.getReportStatus(payload).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          console.log("res.data ---> ", res.data)
          this.timesheetData = res.data.map((list: any) => {

            return {
              ...list,
              _id: list._id,
              employeeName: list.full_name,
              reportDate: list.date,
              status: this.mapStatus(list.submitStatus),
            };
          });
        }
      },
      error: (err) => {
        console.error('Error fetching timesheet data:', err);
      }
    });
  }

  /** ✅ Map API status codes (handles numbers & strings) */
  private mapStatus(submitStatus: any): string {
    switch (submitStatus) {
      case 0:
      case 'Pending':
        return 'Not Submitted';
      case 1:
        return 'Save';
      case 2:
        return 'Final Submitted';
      case 3:
        return 'Approved';
      case 4:
        return 'Rejected';
      case 5: // in case backend uses 5 for reassigned
      case 'Reassigned':
        return 'Reassigned';
      default:
        return 'N/A';
    }
  }

  /** ✅ Filter */
  get filteredData(): Timesheet[] {
    return this.timesheetData.filter((row) =>
      row.employeeName?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // ✅ Redirect to Timesheet Page
  viewReport(details: any): void {
    console.log("details: ---> ", details)
    this.router.navigate(['/main/view-timesheet', details.employee_id, details.date]);
  }

  /** ✅ Reassign Timesheet */
  reassignTimesheet(row: Timesheet) {
    const reason = prompt('Enter reason for reassignment:');
    if (!reason) return;

    const userId = localStorage.getItem('employee_id'); // <-- Make sure you save this at login
    if (!userId) {
      alert('❌ UserId missing in localStorage. Please check login flow.');
      return;
    }

    const payload = {
      timesheetId: row._id,
      reassignedBy: userId,
      reason: reason
    };

    console.log('Payload being sent:', payload);

    this.superadmin.reassignTimesheet(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          alert('✅ ' + res.message);

          // update status in UI without reload
          const index = this.timesheetData.findIndex(t => t._id === row._id);
          if (index !== -1) {
            this.timesheetData[index].status = 'Reassigned';
          }
        } else {
          alert('❌ ' + res.message);
        }
      },
      error: (err) => {
        console.error('Error reassigning timesheet:', err);
        alert('❌ ' + (err.error?.message || 'Something went wrong'));
      }
    });
  }
}
