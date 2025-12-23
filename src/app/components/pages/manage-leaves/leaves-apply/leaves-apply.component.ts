import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Superadmin } from '../../../../core/services/superadmin';
import { Router } from '@angular/router';

@Component({
  selector: 'app-leaves-apply',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leaves-apply.component.html',
  styleUrls: ['./leaves-apply.component.css']
})
export class LeavesApplyComponent implements OnInit {

  leaveType: string = 'fullDay';   // fullDay | halfDay
  selectedTab: string = 'apply';

  // ✅ Full Day
  startDate: string = '';
  endDate: string = '';

  // ✅ Half Day
  halfDate: string = '';
  halfTime: string = '';  // Morning | Afternoon or a time input

  selectedLeaveType: string = '';
  reason: string = '';

  constructor(private superadmin: Superadmin, private router: Router) { }

  ngOnInit(): void {}

  calculateDays(): string {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return diff > 0 ? diff.toString() : '0';
    }
    return '0';
  }

  submitLeave() {
    if (!this.selectedLeaveType || !this.reason) {
      alert('Please fill all fields');
      return;
    }

    let leaveData: any = {
      employee_id: localStorage.getItem('employee_id') || '',
      leave_type: this.selectedLeaveType,
      reason: this.reason
    };

    if (this.leaveType === 'fullDay') {
      if (!this.startDate || !this.endDate) {
        alert('Please select Start Date and End Date');
        return;
      }
      leaveData = {
        ...leaveData,
        leave_mode: 'Full Day',
        from_date: this.startDate,
        to_date: this.endDate,
        number_of_days: parseInt(this.calculateDays(), 10),
        // start_time: '09:30',   // optional
        // end_time: '18:30',
        half_day_session: ''
      };
    }

    if (this.leaveType === 'halfDay') {
      if (!this.halfDate || !this.halfTime) {
        alert('Please select Date and Time for Half Day');
        return;
      }
      leaveData = {
        ...leaveData,
        leave_mode: 'Half Day',
        from_date: this.halfDate,
        to_date: this.halfDate,
        number_of_days: 0.5,
        start_time: this.halfTime === 'morning' ? '09:30' : '14:00',
        end_time: this.halfTime === 'morning' ? '13:00' : '18:30',
        half_day_session: this.halfTime   // morning | afternoon
      };
    }

    this.superadmin.applyLeave(leaveData).subscribe({
      next: (res: any) => {
        if (res.success) {
          alert('Leave Applied Successfully');
          this.router.navigate(['/main/leave/status']);
        } else {
          alert('Failed to apply leave');
        }
      },
      error: (err) => {
        console.error('Error applying leave:', err);
        alert('Something went wrong');
      }
    });
  }
}
