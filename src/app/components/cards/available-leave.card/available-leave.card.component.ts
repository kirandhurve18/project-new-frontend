import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LeaveDetailsInterface } from '../../../interfaces/leave-details.interface';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { Superadmin } from '../../../core/services/superadmin';

@Component({
  selector: 'app-available-leave-card',
  imports: [CommonModule, FormsModule],
  templateUrl: './available-leave.card.component.html',
  styleUrl: './available-leave.card.component.css'
})
export class AvailableLeaveCardComponent {
  @Input() modelType: string;  // [1= status, 2= apply , 3 = team, 4 = reviewer] // receive state from parent
  @Input() title: string;

  // Icons Path  
  cross_close_icon = `${environment.BASE_PATH_ASSETS}/icons/cross_close_icon.svg`;

  // View 

  // Variables
  userRole: string = '';
  employee_id: string = '';
  currentYear: number;
  // leave_details: LeaveDetailsInterface;
  data: any;
  teamLeaves: any[] = [];
  teamCurrentLeaves: any[] = []; // 🔹 for current/upcoming leaves (superadmin only)

  constructor(
    private toastr: ToastrService,
    private superadmin: Superadmin,
  ) {
    this.userRole = localStorage.getItem('user_role') || '';
    this.employee_id = localStorage.getItem('employee_id') || '';
    this.modelType = '';
    // this.leave_details = {
    //   "employee_id": "",
    //   "leave_type": "",
    //   "from_date": "",
    //   "to_date": "",
    //   "custom_dates": [],
    //   "leave_mode": "",
    //   "half_day_start_time": "",
    //   "half_day_end_time": "",
    //   "reason": "",
    //   "status": "",
    //   "number_of_days": 0,
    //   "createdAt": "",
    //   "manager_comment": "",
    //   "rejection_reason": "",
    //   "reviewer_comment": "",
    //   "leave_id": "",
    //   "full_name": "",
    //   "updated_by_full_name": "",
    //   "head_full_name": "",
    //   "reviewer_full_name": "",
    //   "designation_name": "",
    //   "updated_by_head_id": "",
    //   "updated_by_reviewer_id": "",
    //   "updated_by_id": ""
    // }
    this.currentYear = new Date().getFullYear();
    this.data = [];
    if (this.userRole == '') this.title = 'Available Leaves This Year';
    else this.title = 'My Teams Leave';

    this.loadEmployeeLeaveSummary()
    this.loadTeamLeaves();
    this.loadCurrentUpcomingLeaves();
  }

  // Function to be called from parent
  openLeaveCard(modelType?: string) {
    this.modelType = modelType || '';
    this.getDetails();
  }

  onToggle() {

  }

  getDetails() {

  }

  /** 🔹 Call API and map leave summary */
  loadEmployeeLeaveSummary() {
    this.superadmin
      .getEmployeeLeaveSummary({
        employee_id: this.employee_id!,
        year: this.currentYear
      })
      .subscribe({
        next: (res: any) => {
          if (res.success && res.data?.length) {
            const leaves = res.data[0].leaves;

            this.data = [
              {
                leaveType: 'Casual Leave',
                Taken: leaves.casual?.used || 0,
                Available:
                  (leaves.casual?.allotted || 0) - (leaves.casual?.used || 0),
                Total: leaves.casual?.allotted || 0
              },
              {
                leaveType: 'Sick Leave',
                Taken: leaves.sick?.used || 0,
                Available:
                  (leaves.sick?.allotted || 0) - (leaves.sick?.used || 0),
                Total: leaves.sick?.allotted || 0
              },
              {
                leaveType: 'Emergency Leave',
                Taken: leaves.emergency?.used || 0,
                Available:
                  (leaves.emergency?.allotted || 0) -
                  (leaves.emergency?.used || 0),
                Total: leaves.emergency?.allotted || 0
              }
            ];
          } else {
            this.data = [];
          }
        },
        error: (err) => {
          console.error('Error fetching leave summary:', err);
        }
      });
  }

  /** 🔹 Load Team Leaves (Summary) */
  loadTeamLeaves() {
    const payload = { employee_id: this.employee_id! }; // current logged-in lead/superadmin
    this.superadmin.getTeamLeavesTaken(payload).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          // merge duplicates by employee_id
          const map = new Map();
          res.data.forEach((item: any) => {
            if (map.has(item.employee_id)) {
              map.get(item.employee_id).total_used_leaves +=
                item.total_used_leaves;
            } else {
              map.set(item.employee_id, { ...item });
            }
          });
          this.teamLeaves = Array.from(map.values());
        }
      },
      error: (err) => {
        console.error('Error fetching team leaves:', err);
      }
    });
  }

  /** 🔹 Load Current / Upcoming Leaves (Superadmin Only) */
  loadCurrentUpcomingLeaves() {
    const payload = { _id: this.employee_id! };
    this.superadmin.getCurrentUpcomingLeaves(payload).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.teamCurrentLeaves = res.data;
        } else {
          this.teamCurrentLeaves = [];
        }
      },
      error: (err) => {
        console.error('Error fetching current/upcoming leaves:', err);
        this.teamCurrentLeaves = [];
      }
    });
  }
}
