import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Superadmin } from '../../../../core/services/superadmin';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';
import { LeaveCardComponent } from '../../../cards/leave.card/leave.card.component';
import { AvailableLeaveCardComponent } from '../../../cards/available-leave.card/available-leave.card.component';

@Component({
  selector: 'app-leaves-teams-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LeaveCardComponent, AvailableLeaveCardComponent],
  templateUrl: './leaves-teams-list.component.html',
  styleUrls: ['./leaves-teams-list.component.css']
})
export class LeavesTeamsListComponent implements OnInit {
  @ViewChild(LeaveCardComponent) leaveCard!: LeaveCardComponent;
  cardOpen: boolean = false;
  modelType: string = '3';

  userRole: string = '';
  employee_id: string = '';

  delete_solid_icon = `${environment.BASE_PATH_ASSETS}/icons/delete_solid_icon.png`;

  // Data
  myTeamLeaveData: any[] = [];

  // Filters
  searchTerm: string = '';
  statusFilter: string = '';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  totalRecords: number = 0;
  limit: number = 10

  applyLeaveForTeamMember: any;

  constructor(private superadmin: Superadmin, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.userRole = localStorage.getItem('user_role') || '';
    this.employee_id = localStorage.getItem('employee_id') || '';
    this.fetchTeamOnLeave();
  }

  openCardFromParent(leave_id: string) {
    this.leaveCard.openLeaveCard(leave_id, '2'); // call child function
  }

  fetchTeamOnLeave() {
    const payload = { employee_id: this.employee_id, search: this.searchTerm, status: this.statusFilter, limit: this.limit, page: this.currentPage };
    this.superadmin.getTeamOnLeave(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.myTeamLeaveData = res.data || [];
          this.currentPage = res.pagination.currentPage;
          this.totalPages = res.pagination.totalPages;
          this.totalRecords = res.pagination.totalRecords;
          // this.applyFilters();
        } else {
          this.toastr.error(res.message || 'Failed to fetch team leaves');
        }
      },
      error: (err) => {
        console.error('HTTP error fetching team leaves:', err);
        this.toastr.error('Something went wrong');
      }
    });
  }


  onStatusChange() {
    this.currentPage = 1;
    this.fetchTeamOnLeave();
  }

  onSearchChange() {
    this.currentPage = 1;
    this.fetchTeamOnLeave();
  }

  onChangePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.fetchTeamOnLeave();
  }

  get totalPagesArray() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getStatusBgColor(status: string) {
    if (status === 'Pending Manager') return '#FFC107';
    if (status === 'Pending') return '#17A2B8';
    if (status === 'Approved') return '#28A745';
    if (status === 'Rejected') return '#DC3545';
    return '#6C757D';
  }

}
