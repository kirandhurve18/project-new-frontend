import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LeaveDetailsInterface } from '../../../interfaces/leave-details.interface';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { Superadmin } from '../../../core/services/superadmin';

@Component({
  selector: 'app-leave-card',
  imports: [CommonModule, FormsModule],
  templateUrl: './leave.card.component.html',
  styleUrl: './leave.card.component.css'
})
export class LeaveCardComponent {
  @Input() isOpen: boolean;   // receive state from parent
  @Input() modelType: string;  // [1, 2, 3,] // receive state from parent
  @Output() toggleCard = new EventEmitter<boolean>();
  @Input() leave_id: string | number = ''; // parent passes the ID
  @Input() title: string;

  // Icons Path  
  cross_close_icon = `${environment.BASE_PATH_ASSETS}/icons/cross_close_icon.svg`;

  // View 

  // Variables
  userRole: string = '';
  employee_id: string = '';
  leave_details: LeaveDetailsInterface;

  constructor(
    private toastr: ToastrService,
    private superadmin: Superadmin,
  ) {
    this.userRole = localStorage.getItem('user_role') || '';
    this.employee_id = localStorage.getItem('employee_id') || '';
    this.isOpen = true;
    this.modelType = '';
    this.leave_details = {
      "employee_id": "",
      "leave_type": "",
      "from_date": "",
      "to_date": "",
      "custom_dates": [],
      "leave_mode": "",
      "half_day_start_time": "",
      "half_day_end_time": "",
      "reason": "",
      "status": "",
      "number_of_days": 0,
      "createdAt": "",
      "manager_comment": "",
      "rejection_reason": "",
      "reviewer_comment": "",
      "leave_id": "",
      "full_name": "",
      "updated_by_full_name": "",
      "head_full_name": "",
      "reviewer_full_name": "",
      "designation_name": "",
      "updated_by_head_id": "",
      "updated_by_reviewer_id": "",
      "updated_by_id": ""
    }
    if (this.userRole == '') this.title = 'View Leave Request';
    else this.title = 'Review Leave Request';
  }

  // Function to be called from parent
  openLeaveCard(leave_id: string, modelType?: string) {
    if (!leave_id) {
      this.toastr.error("Leave Id not found");
      return;
    }
    this.modelType = modelType || '';
    this.leave_id = leave_id;
    this.isOpen = true;
    console.log('Child card opened with ID:', leave_id);
    this.getLeaveDetails();
  }

  onToggle() {
    this.isOpen = !this.isOpen;
  }

  updateLeaveStatus(status: string) {
    if (!this.leave_details.leave_id) {
      this.toastr.error('Invalid leave selected');
      return;
    }

    if (this.modelType == '1') {
      const payload = {
        leave_id: this.leave_details.leave_id, // ✅ always a string
        status: status,
        reviewer_id: this.employee_id,
        reviewer_comment: this.leave_details.reviewer_comment || '',
        rejection_reason: this.leave_details.rejection_reason || '',
      };

      this.superadmin.updateLeaveStatusByReviewer(payload).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.toastr.success(res.message);
            this.getLeaveDetails()
          } else {
            this.toastr.error(res.message || 'Failed to update leave status');
          }
        },
        error: (err) => {
          this.toastr.error('Something went wrong');
        }
      });
    } else {
      const payload = {
        leave_id: this.leave_details.leave_id, // ✅ Always string
        status: status,
        updated_by_id: this.employee_id,
        manager_comment: this.leave_details.manager_comment || '',
        rejection_reason: this.leave_details.rejection_reason || '',
      };

      // console.log('Payload before API:', payload);

      this.superadmin.updateLeaveStatus(payload).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.toastr.success(res.message);
            // this.showViewDetailsModal = false;
            this.getLeaveDetails()
          } else {
            this.toastr.error(res.message || 'Failed to update leave status');
          }
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Something went wrong');
        }
      });
    }
  }


  // ---------------- Helpers ----------------
  getStatusBgColor(status: string) {
    if (status === 'Pending') return '#FFA500';
    if (status === 'Approved') return '#28A745';
    if (status === 'Rejected') return '#DC3545';
    if (status === 'Cancelled') return '#6C757D';
    return '#FFA500';
  }


  getLeaveDetails() {
    this.superadmin.getLeaveById({ leave_id: this.leave_id }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.leave_details = res.data;
        } else {
          this.toastr.error(res.message || "Failed to fetch leave details");
        }
      },
      error: (err) => {
        console.error("Error fetching leave details:", err);
        this.toastr.error(err.message || "Something went wrong while fetching leave details");
      }
    });
  }

}
