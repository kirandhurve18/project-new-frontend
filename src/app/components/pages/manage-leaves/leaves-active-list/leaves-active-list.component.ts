import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Superadmin } from '../../../../core/services/superadmin';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-leaves-active-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leaves-active-list.component.html',
  styleUrls: ['./leaves-active-list.component.css']
})
export class LeavesActiveListComponent implements OnInit {
  userRole: string | null = null;
  router: any;
  activeTab: 'active' | 'past' = 'active';
  searchEmployee = '';
  page = 1;
  limit = 10;

  activeLeavesData: any[] = [];
  pastLeavesData: any[] = [];

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

    this.loadData();
  }


  /** Load API based on activeTab */
  loadData(): void {
    if (this.activeTab === 'active') {
      this.fetchActiveLeaves();
    } else if (this.activeTab === 'past') {
      this.fetchPastLeaves();
    }
  }

  /** Active Leaves API */
  fetchActiveLeaves(): void {
    this.superadmin.getActiveLeaveList({
      search: this.searchEmployee,
      page: this.page,
      limit: this.limit,
    }).subscribe({
      next: (res) => {
        this.activeLeavesData = (res?.data || []).map((item: any, index: number) => ({
          sno: index + 1,
          employeeName: item.full_name,
          department: item.department_name || '-',
          applyDate: item.createdAt || '-',
          is_el: item.is_el, // placeholder
          leaveType: item.leave_type,
          startDate: item.from_date,
          endDate: item.to_date,
          paid: '-', // placeholder
          unpaid: '-', // placeholder
          noOfDays: item.number_of_days,
          reason: item.reason,
          status: item.status,
        }));
      },
      error: (err) => {
        console.error('Error fetching active leaves:', err);
      }
    });
  }

  /** Past Leaves API */
  fetchPastLeaves(): void {
    this.superadmin.getPastLeaveList({
      search: this.searchEmployee,
      page: this.page,
      limit: this.limit,
    }).subscribe({
      next: (res) => {
        this.pastLeavesData = (res?.data || []).map((item: any, index: number) => ({
          sno: index + 1,
          employeeName: item.full_name,
          department: item.department || '-',
          applyDate: item.createdat?.split('T')[0] || '-',
          el: '10',
          leaveType: item.leave_type,
          startDate: item.from_date,
          endDate: item.to_date,
          paid: '10',
          unpaid: '0',
          noOfDays: this.calculateDays(item.from_date, item.to_date),
          reason: item.reason,
          status: item.status,
        }));
      },
      error: (err) => {
        console.error('Error fetching past leaves:', err);
      }
    });
  }

  /** Search filter */
  searchEmployeeChange(): void {
    this.page = 1;
    this.loadData();
  }

  /** Status button colors */
  getStatusBgColor(status: string): string {
    if (status === 'Pending') return '#FFA500';
    if (status === 'Approved') return '#28A745';
    if (status === 'Rejected') return '#DC3545';
    if (status === 'Cancelled') return '#6C757D';
    return '#fff';
  }

  /** Dynamic heading */
  getHeadingFromActiveTab(): string {
    return this.activeTab === 'active' ? 'Active Leaves' : 'Past Leaves';
  }

  /** Calculate days difference */
  calculateDays(start: string, end: string): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const timeDiff = endDate.getTime() - startDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  }

  /** Handle tab change */
  changeTab(tab: 'active' | 'past') {
    this.activeTab = tab;
    this.page = 1;
    this.loadData();
  }
  showReviewLeaveRequestModal = false;
  selectedReviewLeave: any = null;
  managerComments: string = '';
  reviewerComments: string = '';

  openReviewLeaveRequestModal(leave: any) {
    this.selectedReviewLeave = leave;
    this.showReviewLeaveRequestModal = true;
  }

  closeReviewLeaveRequestModal() {
    this.showReviewLeaveRequestModal = false;
    this.selectedReviewLeave = null;
    this.managerComments = '';
    this.reviewerComments = '';
  }

}
