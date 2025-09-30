import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Superadmin } from '../../../../core/services/superadmin';
import { environment } from '../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { LeaveCardComponent } from '../../../cards/leave.card/leave.card.component';
import { AvailableLeaveCardComponent } from '../../../cards/available-leave.card/available-leave.card.component';

@Component({
  selector: 'app-leaves-status',
  standalone: true,
  imports: [CommonModule, FormsModule, LeaveCardComponent, AvailableLeaveCardComponent],
  templateUrl: './leaves-status.component.html',
  styleUrls: ['./leaves-status.component.css']
})
export class LeavesStatusComponent implements OnInit {
  @ViewChild(LeaveCardComponent) leaveCard!: LeaveCardComponent;

  cardOpen: boolean = false;
  userRole: string | null = null;
  router: any;

  view_solid_icon = `${environment.BASE_PATH_ASSETS}/icons/view_solid_icon.png`;
  delete_solid_icon = `${environment.BASE_PATH_ASSETS}/icons/delete_solid_icon.png`;

  leaveData: any[] = [];

  popupVisible = false;
  leaveToDelete: any = null;

  viewPopupVisible = false;
  selectedLeave: any = null;

  // Replace this with logged-in employee id
  employee_id: string | null = '';

  constructor(private superadmin: Superadmin, private toastr: ToastrService) { }

  ngOnInit(): void {
    let user: any = localStorage.getItem('user');
    this.userRole = localStorage.getItem('user_role');
    this.employee_id = localStorage.getItem('employee_id')

    if (!user) {
      this.router.navigate(['/login']);
    }
    this.loadLeaveDetails();
  }

  openCardFromParent(leave_id: string) {
    this.leaveCard.openLeaveCard(leave_id); // call child function
  }
  /** 🔹 Load leave details from API */
  loadLeaveDetails() {
    this.superadmin.getLeaveDetailsByEmployee({
      employee_id: this.employee_id,
      year: new Date().getFullYear()
    }).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.leaveData = res.data.map((leave: any) => ({
            id: leave._id,
            leave_id: leave.leave_id,
            applyDate: new Date(leave.createdAt).toLocaleDateString(),
            leaveType: leave.leave_type,
            startDate: new Date(leave.from_date).toLocaleDateString(),
            endDate: new Date(leave.to_date).toLocaleDateString(),
            totalDays: leave.number_of_days,
            reason: leave.reason,
            status: leave.status,
            el: leave.is_el,
            fullName: leave.full_name
          }));
        }
      },
      error: err => {
        console.error('Error fetching leave details', err);
      }
    });
  }

  openDeletePopup(leave: any) {
    if (leave.status == 'Cancelled') {
      this.toastr.info("Leave Alread Cancelled")
      return;
    }
    if (leave.status !== 'Pending') {
      this.toastr.info("Only Pending Leaves Can be cancelled");
      return;
    }
    this.leaveToDelete = leave;
    this.popupVisible = true;
  }

  closePopup() {
    this.popupVisible = false;
    this.leaveToDelete = null;
  }

  /** 🔹 Confirm cancel leave with API */
  confirmDeleteLeave() {
    if (this.leaveToDelete) {
      const payload = {
        leave_id: this.leaveToDelete.id,
        status: 'Cancelled',
        updated_by: this.employee_id,
      };

      this.superadmin.cancelLeave(payload).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.leaveData = this.leaveData.map(l =>
              l.id === this.leaveToDelete.id ? { ...l, status: 'Cancelled' } : l
            );
            alert(res.message || 'Leave cancelled successfully');
          } else {
            alert('Failed to cancel leave. Try again.');
          }
          this.closePopup();
        },
        error: (err) => {
          console.error('Error cancelling leave:', err);
          alert('Something went wrong while cancelling leave.');
          this.closePopup();
        }
      });
    }
  }



  // ------------------- Modal -------------------
  viewLeave(leave_id: any) {
    console.log("leave_id --> ", leave_id)
    if (!leave_id) {
      this.toastr.error('Leave ID missing');
      return;
    }

    this.superadmin.getLeaveById({ leave_id: leave_id }).subscribe({
      next: (res: any) => {
        console.log("res.data ---> ", res.data);
        if (res.success) {
          this.selectedLeave = res.data;
          this.viewPopupVisible = true;
        } else {
          this.toastr.error(res.message || 'Failed to fetch leave details');
        }
      },
      error: () => {
        this.toastr.error('Something went wrong while fetching leave details');
      }
    });
  }

  closeViewPopup() {
    this.viewPopupVisible = false;
    this.selectedLeave = null;
  }

  /** 🔹 Return badge class for leave status */
  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'badge bg-success';
      case 'cancelled':
        return 'badge bg-danger';
      case 'pending':
        return 'badge bg-warning text-dark';
      default:
        return 'badge bg-secondary';
    }
  }

  getStatusBgColor(status: string) {
    if (status === 'Pending Manager') {
      return '#FFA500';
    } else if (status === 'Approved Reviewer') {
      return '#28A745';
    } else if (status === 'Rejected Reviewer') {
      return '#DC3545';
    } else if (status === 'Cancelled') {
      return '#6C757D';
    }
    return '#fff';
  }

}
