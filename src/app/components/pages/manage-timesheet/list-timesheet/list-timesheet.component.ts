
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Superadmin } from '../../../../core/services/superadmin';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-list-timesheet',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './list-timesheet.component.html',
  styleUrls: ['./list-timesheet.component.css']
})
export class ListTimesheetComponent implements OnInit {
  userRole: string | null = null;
  employee_id: string | null = null;

  constructor(private router: Router, private superadmin: Superadmin, private toastr: ToastrService) { }


  // 🔹 Filters
  fromDate: string = '';
  toDate: string = '';
  searchTerm: string = '';

  // 🔹 Data
  timesheetList: any[] = [];
  // employeeId = '68b827359c742cab4e0eb97f'; // 👉 Replace with logged-in employeeId
  Math = Math;
  // 🔹 Pagination
  page = 1;
  limit = 10;
  totalRecords = 0;
  totalPages = 0;

  ngOnInit(): void {
    let user: any = localStorage.getItem('user');
    this.userRole = localStorage.getItem('user_role');
    this.employee_id = localStorage.getItem('employee_id');

    if (!user) {
      this.router.navigate(['/login']);
    }

    // Load current month by default
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.fromDate = firstDay.toISOString().split('T')[0];
    this.toDate = lastDay.toISOString().split('T')[0];

    this.getTimesheetStatus();

  }


  // 🔹 Fetch API Data
  getTimesheetStatus(): void {
    const payload = {
      fromDate: this.fromDate,
      toDate: this.toDate,
      employee_id: this.employee_id,
      page: this.page,
      limit: this.limit,
      sortBy: 'date',
      order: 'desc' as 'desc' | 'asc'
    };

    this.superadmin.getTimesheetStatusByEmployee(payload).subscribe({
      next: (res) => {
        this.timesheetList = res?.data || [];
        this.totalRecords = res?.pagination?.totalRecords || this.timesheetList.length;
        this.totalPages = Math.ceil(this.totalRecords / this.limit);
      },
      error: (err) => {
        console.error('Error fetching timesheet status:', err);
      }
    });
  }

  getSubmitStatusLabel(status: number): string {
    switch (status) {
      case 0: return 'Not Submitted';
      case 1: return 'Saved';
      case 2: return 'Final Submitted';
      case 3: return 'Approved';
      case 4: return 'Rejected';
      case 5: return 'Reassigned';
      default: return 'Unknown';
    }
  }

  // 🔹 Search + entries filter
  get filteredTimesheets() {
    let filtered = this.timesheetList;

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(row =>
        (row.date && row.date.toLowerCase().includes(search)) ||
        (row.note && row.note.toLowerCase().includes(search)) ||
        (row.approvedBy && row.approvedBy.toLowerCase().includes(search))
      );
    }

    // ✅ Apply limit (entriesToShow)
    return filtered.slice(0, this.limit);
  }

  // 🔹 Pagination controls
  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.getTimesheetStatus();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.getTimesheetStatus();
    }
  }

  changeLimit(newLimit: number): void {
    this.limit = newLimit;
    this.page = 1;
    this.getTimesheetStatus();
  }
}
