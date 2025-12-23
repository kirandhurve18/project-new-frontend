import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Superadmin } from '../../../../core/services/superadmin';

@Component({
  selector: 'app-teamhierarchy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hierarchy-employee.component.html',
  styleUrl: './hierarchy-employee.component.css',
})
export class HierarchyEmployeeComponent implements OnInit {
  employees: any[] = [];
  entriesPerPage: number = 10;  // limit
  searchQuery: string = '';     // search text
  currentPage: number = 1;      // active page
  totalEntries: number = 0;     // for showing total records
  totalPages: number = 0;       // for pagination

  selectedEmployees: any[] = [];

  constructor(private superadmin: Superadmin, private router: Router) { }

  ngOnInit(): void {
    this.loadEmployees();
  }

  // 🔹 Load employees from API
  loadEmployees() {
    this.superadmin.getTeamHierarchy({
      page: this.currentPage,
      limit: this.entriesPerPage,
      search: this.searchQuery,
      sortBy: 'designation_name',
      order: 'asc'
    }).subscribe({
      next: (res) => {
        this.employees = res?.data || [];
        this.totalEntries = res?.totalRecords || 0;
        this.totalPages = Math.ceil(this.totalEntries / this.entriesPerPage);
      },
      error: (err) => {
        console.error('Failed to fetch employees:', err);
      },
    });
  }

  // 🔹 When page changes
  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadEmployees();
  }

  // 🔹 When entries-per-page changes
  onEntriesChange() {
    this.currentPage = 1;
    this.loadEmployees();
  }

  // 🔹 When search is typed
  onSearchChange() {
    this.currentPage = 1;
    this.loadEmployees();
  }

  goToRegistration(): void {
    this.router.navigate(['/superadmin/registration']);
  }

  goToUpdateInfo(empId: number | string) {
    this.router.navigate(['/superadmin/updateinfo']);
  }
}
