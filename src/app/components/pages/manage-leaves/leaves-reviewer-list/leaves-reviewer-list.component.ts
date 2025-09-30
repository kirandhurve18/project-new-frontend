import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Superadmin } from '../../../../core/services/superadmin';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';
import { LeaveCardComponent } from '../../../cards/leave.card/leave.card.component';
import { AvailableLeaveCardComponent } from '../../../cards/available-leave.card/available-leave.card.component';

@Component({
  selector: 'app-leaves-reviewer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LeaveCardComponent, AvailableLeaveCardComponent],
  templateUrl: './leaves-reviewer-list.component.html',
  styleUrls: ['./leaves-reviewer-list.component.css']
})
export class LeavesReviewerListComponent implements OnInit {
  @ViewChild(LeaveCardComponent) leaveCard!: LeaveCardComponent;
  cardOpen: boolean = false;
  modelType: string = '4';
  // credentials
  userRole: string = '';
  employee_id: string | null = '';

  //images
  cross_close_icon = `${environment.BASE_PATH_ASSETS}/icons/cross_close_icon.svg`;


  // Data
  myTeamLeaveData: any[] = [];
  pagination: any = {};
  currentPage: number = 1;
  pageSize: number = 5;

  // Filters
  searchTerm: string = '';
  statusFilter: string = '';

  constructor(
    private superadmin: Superadmin,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.userRole = localStorage.getItem('user_role') || '';
    this.employee_id = localStorage.getItem('employee_id');

    this.fetchReviewerLeaves();
  }

  openCardFromParent(leave_id: string) {
    this.leaveCard.openLeaveCard(leave_id, '1'); // call child function
  }

  // ---------------- API Call ----------------
  fetchReviewerLeaves(page: number = 1) {
    const payload = {
      status: this.statusFilter || '',
      search: this.searchTerm || '',
      limit: this.pageSize,
      page
    };

    this.superadmin.getReviewerLeaveList(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.myTeamLeaveData = res.data || [];
          this.pagination = res.pagination || {};
          this.currentPage = this.pagination.currentPage || 1;
        } else {
          this.toastr.error(res.message || 'Failed to fetch leave list');
        }
      },
      error: (err) => {
        console.error('Error fetching reviewer leaves:', err);
        this.toastr.error('Something went wrong');
      }
    });
  }

  // ---------------- Helpers ----------------
  getStatusBgColor(status: string) {
    if (status === 'Pending') return '#FFA500';
    if (status === 'Approved') return '#28A745';
    if (status === 'Rejected') return '#DC3545';
    if (status === 'Cancelled') return '#6C757D';
    return '#FFA500';
  }

}
