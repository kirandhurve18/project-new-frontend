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
  styleUrls: ['./hierarchy-employee.component.css'],
})
export class HierarchyEmployeeComponent implements OnInit {
  employees: any[] = [];
  entriesPerPage: number = 10;    // Rows per page
  searchQuery: string = '';       // Search text
  currentPage: number = 1;        // Active page
  totalEntries: number = 0;       // Total records from API
  totalPages: number = 0;         // Total pages for pagination

  constructor(private superadmin: Superadmin, private router: Router) { }

  ngOnInit(): void {
    this.loadEmployees();
  }

  // 🔹 Load employees from API
  loadEmployees() {
    const payload: {
      page: number;
      limit: number;
      search: string;
      sortBy: string;
      order: 'asc' | 'desc';
    } = {
      page: this.currentPage,
      limit: this.entriesPerPage,
      search: this.searchQuery,
      sortBy: 'designation_name',
      order: 'asc',
    };

    this.superadmin.getTeamHierarchy(payload).subscribe({
      next: (res) => {
        this.employees = res?.data || [];
        this.totalEntries = res?.pagination?.total || 0;
        this.currentPage = res?.pagination?.page || 1;
        this.entriesPerPage = res?.pagination?.limit || this.entriesPerPage;
        this.totalPages = res?.pagination?.totalPages || 1;
      },
      error: (err) => {
        console.error('Failed to fetch employees:', err);
      },
    });
  }

  // 🔹 Change page
  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadEmployees();
  }

  // 🔹 Change entries per page
  onEntriesChange() {
    this.currentPage = 1;
    this.loadEmployees();
  }

  // 🔹 Search employees
  onSearchChange() {
    this.currentPage = 1;
    this.loadEmployees();
  }

  // 🔹 Navigate to registration page
  goToRegistration(): void {
    this.router.navigate(['/superadmin/registration']);
  }

  // 🔹 Navigate to update info page with employee ID
  goToUpdateInfo(empId: number | string) {
    this.router.navigate(['/superadmin/updateinfo', empId]);
  }

  // 🔹 Helper to generate page numbers for pagination
  getPagesArray(): number[] {
    return Array(this.totalPages)
      .fill(0)
      .map((_, i) => i + 1);
  }
}
