
import { Component, OnInit } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Superadmin } from '../../../core/services/superadmin';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

interface Task {
  _id: string;
  title: string;
  employee_id: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

   currentIndex = 0;

  users = [
    { name: 'Alish', date: '11-05-1998', type: 'Birthday', image: 'assets/images/alish.svg' },
    { name: 'Vibha', date: '02-07-1995', type: 'Anniversary', image: 'assets/images/vibha.svg' },
    { name: 'Omm', date: '23-09-1999', type: 'Birthday', image: 'assets/images/om.svg' },
    { name: 'Shrikant', date: '14-01-1992', type: 'Anniversary', image: 'assets/images/shrikant.svg' },
  ];

  prevUser() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  nextUser() {
    if (this.currentIndex < this.users.length - 1) {
      this.currentIndex++;
    }
  }

  presentCount: number = 0;
  lateCount: number = 0;
  onTimeCount: number = 0;   // added
  onLeaveCount: number = 0;


  image_vibha = `${environment.BASE_PATH_ASSETS}/images/vibha.svg`;
  image_omm = `${environment.BASE_PATH_ASSETS}/images/omm_polygon.svg`;
  cross_close_icon = `${environment.BASE_PATH_ASSETS}/icons/cross_close_icon.svg`;

  role: string = 'admin';

  tasks: Task[] = [];
  newTaskTitle = '';
  editingIndex: number = -1;
  isEditing = false;
  showAddTaskPopup = false;

  employeeLeaveData: any[] = [];
  teamOnLeaveToday: any[] = [];
  employeeBirthdayOrWorkAnniversaryData: any[] = [];

  approvalPendings = {
    timeSheets: 0,
    leave_request: 0,
    leaves_pendings_reviewer_approval: 0
  };
  lateComers: any[] = [];

  userRole: string | null = null;

  // Attendance button state
  attendanceStatus: 'present' | 'cheked_out' | 'late' | 'not_checked' | 'leave' | 'weekly_off' = 'not_checked';
  checkedIn = false;
  checkedOut = false;
  employee_id: string = '';
  checkInTime: string = '';
  checkedOutTime: string = '';

  constructor(private superadmin: Superadmin,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    let user: any = localStorage.getItem('user');
    this.userRole = localStorage.getItem('user_role');
    this.employee_id = localStorage.getItem('employee_id') || '';

    if (!user) {
      this.router.navigate(['/login']);
    }

    this.loadAttendanceSummary();
    this.loadTasks();
    this.loadEmployeesOnLeaveToday();
    this.loadApprovalPendings();
    this.loadLateComers();
    this.refreshAttendance()
    this.loadTeamOnLeaveToday();
  }

  openAddTaskPopup(): void {
    this.showAddTaskPopup = true;
    this.newTaskTitle = '';
    this.isEditing = false;
    this.editingIndex = -1;
  }

  closeAddTaskPopup(): void {
    this.showAddTaskPopup = false;
    this.newTaskTitle = '';
    this.isEditing = false;
    this.editingIndex = -1;
  }

  editTask(index: number): void {
    this.editingIndex = index;
    this.newTaskTitle = this.tasks[index].title;
    this.isEditing = true;
    this.showAddTaskPopup = true;
  }

  deleteTask(index: number): void {
    // this.tasks.splice(index, 1);
      const task = this.tasks[index];
    this.superadmin.deleteTask(task._id).subscribe({
      next: (res) => {
        if (res?.success) {
          this.loadTasks()
          this.toastr.success(res?.message || 'Task updated successfully ✅');
        }
      },
      error: (err) => {
        console.error('❌ Failed to update task:', err);
        this.toastr.error(err?.error?.message || 'Failed to update task ❌');
      }
    });
  }

  submitTask(): void {
    const title = this.newTaskTitle.trim();
    if (!title) return;

    if (this.isEditing && this.editingIndex !== -1) {
      // Update existing task via API
      const task = this.tasks[this.editingIndex];
      const payload = { title, employee_id: this.employee_id };

      this.superadmin.updateTask(task._id, payload).subscribe({
        next: (res) => {
          if (res?.success) {
            this.loadTasks()
            // this.tasks[this.editingIndex] = res.data;
            this.toastr.success(res?.message || 'Task updated successfully ✅');
          }
        },
        error: (err) => {
          console.error('❌ Failed to update task:', err);
          this.toastr.error(err?.error?.message || 'Failed to update task ❌');
        }
      });
    } else {
      // Add new task via API
      const payload = { title, employee_id: this.employee_id };
      this.superadmin.addTask(payload).subscribe({
        next: (res) => {
          if (res?.success) {
            // this.tasks.push(res.data);
            this.loadTasks()
            this.toastr.success(res?.message || 'Task added successfully ✅');
          }
        },
        error: (err) => {
          console.error('❌ Failed to add task:', err);
          this.toastr.error(err?.error?.message || 'Failed to add task ❌');
        }
      });
    }

    this.closeAddTaskPopup();
  }



  isCheckedIn(): boolean {
    return true;
  }

  isOnLeaveToday(): boolean {
    return false;
  }




  loadAttendanceSummary(): void {
    this.superadmin.getAttendanceSummary().subscribe({
      next: (res) => {
        if (res?.success) {
          this.presentCount = res.total_present || 0;
          this.lateCount = res.late_count || 0;
          this.onTimeCount = res.on_time_count || 0;
          this.onLeaveCount = res.on_leave_count || 0;

        }
      },
      error: (err) => {
        console.error('Failed to fetch attendance summary:', err);
      }
    });
  }
  loadLateComers(): void {
    const now = new Date();
    const month = now.getMonth() + 1; // JS months are 0-based


    this.superadmin.getMonthlyLateComers({ month: `${month}` }).subscribe({
      next: (res) => {
        if (res.success) {
          this.lateComers = res.data;
        }
      },
      error: (err) => {
        console.error('Error fetching late comers:', err);
      }
    });
  }

  loadTasks(): void {
    this.superadmin.getMyTasks(this.employee_id).subscribe({
      next: (res) => {
        if (res?.success && res?.data) {
          this.tasks = res.data;
        } else {
          console.warn('Tasks response missing data');
          this.tasks = [];
        }
      },
      error: (err) => {
        console.error('Failed to fetch tasks:', err);
      }
    });
  }

  loadEmployeesOnLeaveToday(): void {
    this.superadmin.getEmployeesOnLeaveToday().subscribe({
      next: (res) => {
        if (res?.success && res?.data) {
          this.employeeLeaveData = res.data || [];
        } else {
          console.warn('Leave data not found');
          this.employeeLeaveData = [];
        }
      },
      error: (err) => {
        console.error('Failed to fetch employees on leave today:', err);
      }
    });
  }

  loadTeamOnLeaveToday(): void {
    const payload = { _id: this.employee_id };
    this.superadmin.getTeamOnLeavetoday(payload).subscribe({
      next: (res) => {
        this.teamOnLeaveToday = res?.success ? res.data : [];
      },
      error: (err) => {
        console.error('Failed to fetch team on leave today:', err);
      }
    });
  }


  loadApprovalPendings(): void {
    const employeeId = this.employee_id;
    const userRole = Number(this.userRole) || 0;
    this.superadmin.getApprovalPendings(employeeId, userRole).subscribe({
      next: (res) => {
        if (res?.success && res?.data) {
          this.approvalPendings = {
            timeSheets: res.data.timeSheets || 0,
            leave_request: res.data.leave_request || 0,
            leaves_pendings_reviewer_approval: res.data.leave_reviewer_request || 0
          };
        } else {
          console.warn('No approval pending data found.');
          this.approvalPendings = { timeSheets: 0, leave_request: 0, leaves_pendings_reviewer_approval: 0 };
        }
      },
      error: (err) => {
        console.error('Failed to load approval pendings:', err);
      }
    });
  }

  navigateToSummary(type: string) {
    this.router.navigate(['/attendance-summary'], { queryParams: { filter: type } });
  }

  getButtonLabel(): string {
    if (!this.checkedIn) return 'Check In';
    if (this.checkedIn && !this.checkedOut) return 'Check Out';
    return 'Checked Out';
  }


  private refreshAttendance(): void {
    this.superadmin.getAttendance({ employee_id: this.employee_id }).subscribe({
      next: (res) => {
        let data = res.data || {}
        this.checkInTime = data.checkin_time;
        this.checkedOutTime = data.checkout_time;
        this.checkedIn = data.checkin_time && true;
        this.checkedOut = data.checkout_time && true;
        console.log(this.checkInTime)
        console.log(this.checkedOut, "checkedOut")

        if (this.checkedOut) {
          this.attendanceStatus = 'cheked_out'
        }
        else if (this.checkedIn) {
          this.attendanceStatus = 'present'
        } else {

        }
      },
      error: (err) => {
        console.error('Check-in failed:', err);
      },
    });
  }

  // ---------------- Navigation ----------------
  goToTeamSubmission() {
    this.router.navigate(['/main/team-submission-timesheet']);
  }

  goToTeamLeaves() {
    this.router.navigate(['/main/leave/teams-list']);
  }

  goToPendingReviewer() {
    this.router.navigate(['/main/leave/teams-reviewer-list']);
  }

  goToTeamworksummary() {
    this.router.navigate(['/main/team-work-summary-timesheet']);
  }

  goToTeamLeavesteam() {
    this.router.navigate(['/main/leave/teams-list']);
  }

  goToReport(status: string) {
    this.router.navigate(['/main/attendance/report'], {
      queryParams: { status }
    });
  }


}
