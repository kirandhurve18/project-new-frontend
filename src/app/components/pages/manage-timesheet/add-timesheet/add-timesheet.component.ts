
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Superadmin } from '../../../../core/services/superadmin';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


interface WorkLog {
  startTime: string;
  endTime: string;
  task?: string;
}

interface TimesheetData {
  _id?: string;
  employee_id: string;
  full_name: string;
  designation_name: string;
  department_name: string;
  team_lead: string;
  date: string | null;
  submittedAt: string | null;
  approvedBy: string | null;
  rejectedBy: string | null;
  start_time: string;
  break_hours: string;
  regular_hours: string;
  weekend: string[];
  workLogs?: { hourSlot: string; task: string }[];
  submitStatus?: number; // 1 = Draft, 2 = Submitted
}

interface TimesheetResponse {
  success: boolean;
  message?: string;
  data?: TimesheetData;
}


@Component({
  selector: 'app-add-timesheet',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-timesheet.component.html',
  styleUrls: ['./add-timesheet.component.css']
})
export class AddTimesheetComponent implements OnInit {
  userRole: string | null = null;

  constructor(private router: Router, private superadmin: Superadmin) { }

  isMobile = false;
  timesheetForm!: FormGroup;
  employee_id: string | null = null;
  todayDate: string | null = null;
  yesterdayDate: string = '';
  loading = false;
  submitStatus: string = '0';

  reassignTimesheetId: string = '';
  reassignReason: string = '';

  /** ====== Dynamic fields for Summary Table ====== */
  year!: number;
  month!: string;
  date!: number;
  day!: string;
  weekend!: string;
  startTime: string = '09:30 AM';
  regularHours: number = 9;
  breakHours: number = 1;

  /** ====== Employee Info (fetched dynamically) ====== */
  employeeName: string = '';
  department: string = '';
  teamLead: string = '';


  /** ====== UI State ====== */
  isSubmitted: boolean = false; // ✅ Hide buttons after submit

  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    let user: any = localStorage.getItem('user');
    this.userRole = localStorage.getItem('user_role');
    this.employee_id = localStorage.getItem('employee_id');


    if (!user) {
      this.router.navigate(['/login']);
    }

    this.todayDate = new Date().toISOString().split('T')[0];

    this.onResize();
    this.setAllowedDates();
    this.initForm();

    this.updateSummaryFields(this.todayDate);
    this.getWorkReport(this.todayDate);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile = window.innerWidth < 768;
  }

  /** ====== Restrict Date Selection (Today + Yesterday only) ====== */
  private setAllowedDates(): void {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    this.todayDate = today.toISOString().split('T')[0];
    this.yesterdayDate = yesterday.toISOString().split('T')[0];
  }

  private initForm(): void {
    this.timesheetForm = this.fb.group({
      date: [this.todayDate],
      employee: [this.employee_id],
      submitStatus: [1],
      workLogs: this.fb.array([]),
    });

    this.generateTimeSlots();
  }

  get workLogs(): FormArray<FormGroup> {
    return this.timesheetForm.get('workLogs') as FormArray<FormGroup>;
  }

  /** ====== Generate 1-hour slots from 8:30 AM → 7:30 PM ====== */
  private generateTimeSlots(): void {
    this.workLogs.clear();

    const start = 8.5; // 8:30 AM
    const end = 19.5; // 7:30 PM

    for (let t = start; t < end; t++) {
      const startHour = Math.floor(t);
      const startMin = (t % 1) * 60;
      const endHour = Math.floor(t + 1);
      const endMin = ((t + 1) % 1) * 60;

      const startTime = this.formatTime(startHour, startMin);
      const endTime = this.formatTime(endHour, endMin);

      this.workLogs.push(
        this.fb.group({
          startTime: [startTime],
          endTime: [endTime],
          task: [''],
        })
      );
    }
  }

  private formatTime(hour: number, minute: number): string {
    const h = hour.toString().padStart(2, '0');
    const m = minute.toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  private updateSummaryFields(dateStr: string): void {
    const selectedDate = new Date(dateStr);
    this.year = selectedDate.getFullYear();
    this.month = selectedDate.toLocaleString('default', { month: 'long' });
    this.date = selectedDate.getDate();
    this.day = selectedDate.toLocaleString('default', { weekday: 'long' });
    this.weekend =
      selectedDate.getDay() === 0 || selectedDate.getDay() === 6 ? 'Yes' : 'No';
  }

  resetToToday(): void {
    this.timesheetForm.patchValue({ date: this.todayDate });
    this.getWorkReport(this.todayDate);
  }

  /** ====== Fetch Existing Report ====== */
  getWorkReport(date: string | null): void {
    if (!date || !this.employee_id) return;

    if (date !== this.todayDate && date !== this.yesterdayDate) {
      this.toastr.warning('You can only access Today or Yesterday’s timesheet.');
      return;
    }

    this.loading = true;
    this.updateSummaryFields(date);

    this.superadmin.getTimesheetByEmployee(this.employee_id, date).subscribe({
      next: (res: TimesheetResponse) => {
        this.generateTimeSlots();

        if (res.success && res.data) {
          this.timesheetForm.patchValue({
            date,
            submitStatus: res.data.submitStatus || 0,
            employee: this.employee_id,
          });

          // ✅ Lock UI after final submit
          this.isSubmitted = res.data.submitStatus === 2;
          this.submitStatus = res.data.submitStatus?.toString() || '0'


          // ✅ Map employee info from API
          this.employeeName = res.data.full_name || '';
          this.department = res.data.department_name || '';
          this.teamLead = res.data.team_lead || '';

          // ✅ Summary values from API
          this.startTime = res.data.start_time || '09:30 AM';
          this.regularHours = parseFloat(res.data.regular_hours) || 9;
          this.breakHours = parseFloat(res.data.break_hours) || 1;
          this.weekend = res.data.weekend?.join(', ') || 'No';

          if (res.data.workLogs?.length) {
            res.data.workLogs.forEach((savedLog: any) => {
              if (savedLog.hourSlot) {
                const [startTime, endTime] = savedLog.hourSlot.split('-');
                const slot = this.workLogs.controls.find(
                  (ctrl) =>
                    ctrl.value.startTime === startTime &&
                    ctrl.value.endTime === endTime
                );
                if (slot) {
                  slot.patchValue({ task: savedLog.task });
                }
              }
            });
          }

          this.toastr.success('Work report fetched successfully');
        } else {
          this.toastr.info('No report found for this date');
        }
      },
      error: () => this.toastr.error('Error fetching report'),
      complete: () => (this.loading = false),
    });
  }

  /** ====== Save / Submit Report ====== */
  saveTimesheet(status: number): void {
    const rawValue = this.timesheetForm.value;

    if (rawValue.date !== this.todayDate && rawValue.date !== this.yesterdayDate) {
      this.toastr.error('You can only save Today or Yesterday’s timesheet.');
      return;
    }

    const formattedWorkLogs = rawValue.workLogs
      .filter((log: WorkLog) => log.task && log.task.trim() !== '')
      .map((log: WorkLog) => ({
        hourSlot: `${log.startTime}-${log.endTime}`,
        task: log.task,
      }));

    const payload: any = {
      date: rawValue.date || this.todayDate,
      employee: this.employee_id || rawValue.employee,
      submitStatus: status,
      workLogs: formattedWorkLogs,
    };

    if (!payload.employee) {
      this.toastr.error('Employee ID is missing. Please login again.');
      return;
    }

    this.loading = true;

    this.superadmin.addTimesheet(payload).subscribe({
      next: (res: TimesheetResponse) => {
        if (res.success) {
          if (status === 2) {
            this.isSubmitted = true; // ✅ Hide buttons & show status
            this.toastr.success('Timesheet submitted');
          } else {
            this.toastr.success('Draft saved');
          }
        } else {
          this.toastr.error(res.message || 'Something went wrong');
        }
      },
      error: () => this.toastr.error('Error saving timesheet'),
      complete: () => (this.loading = false),
    });
  }

  /** ====== Reassign Timesheet ====== */
  reassignTimesheet(): void {
    if (!this.reassignTimesheetId || !this.reassignReason) {
      this.toastr.warning('Timesheet ID and reason are required');
      return;
    }

    const payload = {
      timesheetId: this.reassignTimesheetId,
      reassignedBy: this.employee_id,
      reason: this.reassignReason,
    };

    this.loading = true;

    this.superadmin.reassignTimesheet(payload).subscribe({
      next: (res) => {
        this.toastr.success('Timesheet reassigned successfully!');
        console.log('Reassign Response:', res);
      },
      error: (err) => {
        this.toastr.error('Failed to reassign timesheet');
        console.error('Reassign Error:', err);
      },
      complete: () => (this.loading = false),
    });
  }
}
