import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Superadmin } from '../../../../core/services/superadmin';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

interface WorkLog {
  startTime: string;
  endTime: string;
  task: string;
}

interface TimesheetData {
  _id?: string; // 👈 added timesheetId
  timesheet_id: string,
  year: number;
  month: string;
  date: number;
  day: string;
  weekend: string;
  startTime: string;
  regularHours: number;
  breakHours: number;
  employeeName: string;
  department: string;
  teamLead: string;
  workLogs: WorkLog[];
}

@Component({
  selector: 'app-view-timesheet', // 👈 fixed selector
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './view-timesheet.component.html',
  styleUrls: ['./view-timesheet.component.css']
})
export class ViewTimesheetComponent implements OnInit {
  userRole: string | null = null;
  employee_id: string | null = null;

  selectedDate: string = '';
  workReport: TimesheetData | null = null;
  reportStatus: string = '';
  remarks: string = '';
  submitStatus: string = '';
  update_status: boolean = false;

  constructor(
    private router: Router,
    private superadmin: Superadmin,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const user: any = localStorage.getItem('user');
    this.userRole = localStorage.getItem('user_role');

    if (!user) {
      this.router.navigate(['/login']);
    }

    this.route.paramMap.subscribe(params => {
      const employee_id = params.get('employee_id');
      const date = params.get('date');

      if (employee_id) {
        this.employee_id = employee_id;
        this.selectedDate = date || '';
      } else {
        this.employee_id = localStorage.getItem('employee_id');
        this.selectedDate = new Date().toISOString().slice(0, 10);
      }

      this.getWorkHistory(this.selectedDate);

      this.update_status = this.employee_id !== localStorage.getItem('employee_id');
    });
  }

  submitReportStatus() {
    if (!this.reportStatus) {
      this.toastr.warning('Please select a status before submitting.');
      return;
    }

    if (!this.workReport || !this.workReport._id) {
      this.toastr.error('No timesheet found to update.');
      return;
    }

    if (this.reportStatus === 'Approved') {
      const payload = {
        timesheetId: this.workReport.timesheet_id,
        approvedBy: localStorage.getItem('employee_id') || ''
      };

      this.superadmin.approveTimesheet(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success(res.message || 'Timesheet Approved Successfully');
          } else {
            this.toastr.error(res.message || 'Failed to approve timesheet');
          }
        },
        error: (err) => {
          console.error('Error approving timesheet:', err);
          this.toastr.error('Something went wrong while approving');
        }
      });
    } else if (this.reportStatus === 'Rejected') {
      // TODO: If you have reject API, call it here
      // this.toastr.info('Timesheet rejected (API integration pending).');
      const payload = {
        timesheetId: this.workReport.timesheet_id,
        rejectedBy: localStorage.getItem('employee_id') || '',
        reason: this.remarks,
      };

      this.superadmin.rejectTimesheet(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success(res.message || 'Timesheet Rejected Successfully');
            this.getWorkHistory(this.selectedDate)
          } else {
            this.toastr.error(res.message || 'Failed to Reejct timesheet');
          }
        },
        error: (err) => {
          console.error('Error reject timesheet:', err);
          this.toastr.error('Something went wrong while rejecting');
        }
      });
    }
  }

  getWorkHistory(date: string): void {
    if (!this.employee_id) {
      this.toastr.error('Employee ID not found.');
      return;
    }

    this.superadmin.getTimesheetByEmployee(this.employee_id, date).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const data = res.data;
          this.submitStatus = res.data.submitStatus?.toString() || '0';
          console.log("submitStatus ---> ", this.submitStatus)
          this.workReport = {
            _id: data._id, // 👈 capture timesheetId for approve/reject
            timesheet_id: data.timesheet_id,
            year: new Date(data.date).getFullYear(),
            month: new Date(data.date).toLocaleString('default', { month: 'long' }),
            date: new Date(data.date).getDate(),
            day: new Date(data.date).toLocaleString('default', { weekday: 'long' }),
            weekend: [0, 6].includes(new Date(data.date).getDay()) ? 'Yes' : 'No',
            startTime: '09:30 AM',
            regularHours: 9,
            breakHours: 1,
            employeeName: data.full_name || 'Unknown',
            department: data.department_name,
            teamLead: data.team_lead,
            workLogs: data.workLogs?.map((log: any) => ({
              startTime: log.hourSlot?.split('-')[0] || '',
              endTime: log.hourSlot?.split('-')[1] || '',
              task: log.task || ''
            })) || []
          };
        } else {
          this.workReport = null;
          this.toastr.info('No timesheet found for this date.');
        }
      },
      error: () => this.toastr.error('Error fetching work history.')
    });
  }
}
