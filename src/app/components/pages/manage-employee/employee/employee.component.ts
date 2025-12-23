
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Superadmin } from '../../../../core/services/superadmin';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {
  userRole: string | null = null;

  file_excel_solid_1_icon = `${environment.BASE_PATH_ASSETS}/icons/file_excel_solid_1_icon.svg`;
  search_icon = `${environment.BASE_PATH_ASSETS}/icons/search_icon.svg`;


  employees: any[] = [];
  entriesPerPage: number = 10;
  searchQuery: string = '';

  // Pagination (from backend)
  currentPage: number = 1;
  totalPages: number = 1;
  totalEmployees: number = 0;

  showModal = false;
  showBulkImportModal = false;
  showImportResultModal = false;
  selectedEmployee: any = null;

  importSummary = {
    successCount: 0,
    errorCount: 0,
    errors: [] as { name: string; description: string }[],
  };

  constructor(private router: Router, private superadmin: Superadmin, private toastr: ToastrService) { }

  ngOnInit(): void {
    let user: any = localStorage.getItem('user');
    this.userRole = localStorage.getItem('user_role');

    if (!user) {
      this.router.navigate(['/login']);
    }

    this.loadEmployees();

  }


  // ✅ Get employees from backend with pagination
  loadEmployees() {
    this.superadmin.getAllEmployees(this.currentPage, this.entriesPerPage, this.searchQuery).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.employees = res.data || [];
          this.totalEmployees = res.pagination?.total || 0;
          this.totalPages = res.pagination?.totalPages || 1;
          this.currentPage = res.pagination?.page || 1;
        } else {
          this.employees = [];
        }
      },
      error: (err) => console.error('Failed to fetch employees:', err),
    });
  }

  // ✅ Search filter (only frontend filtering)
  get filteredEmployees() {
    const search = this.searchQuery.toLowerCase();
    if (!search) return this.employees;

    return this.employees.filter(
      (emp) =>
        `${emp.first_name ?? ''} ${emp.middle_name ?? ''} ${emp.last_name ?? ''}`
          .toLowerCase()
          .includes(search) ||
        emp.company_email?.toLowerCase().includes(search)
    );
  }

  // ✅ Pagination controls (backend call)
  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadEmployees();
    }
  }
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadEmployees();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadEmployees();
    }
  }

  onEntriesPerPageChange() {
    this.currentPage = 1;
    this.loadEmployees();
  }
  onSearchChange() {
    this.currentPage = 1;     // reset to first page
    this.loadEmployees();     // fetch from backend
  }


  // ✅ Navigation
  goToRegistration(): void {
    this.router.navigate(['/main/add-employee']);
  }
  goToUpdateInfo(emp: any): void {
    this.router.navigate(['/main/update-employee', emp._id]); // pass id in URL
  }

  goToTeamHierarchy() {
    this.router.navigate(['/main/employee-hierarchy']);
  }

  // ✅ Status Modal
  openStatusModal(emp: any) {
    this.selectedEmployee = emp;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedEmployee = null;
  }

  confirmToggleStatus() {
    if (!this.selectedEmployee) return;

    const newStatus = !this.selectedEmployee.is_active;

    this.superadmin.updateEmployeeStatus(this.selectedEmployee._id, newStatus).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.selectedEmployee.is_active = newStatus; // update UI immediately
          this.toastr.success(res.message || 'Employee status updated successfully');
          this.closeModal();
        } else {
          this.toastr.error(res.message || 'Failed to update status');
        }
      },
      error: () => {
        this.toastr.error('Error updating employee status');
      }
    });
  }


  // ✅ Bulk Import
  openBulkImportModal() {
    this.showBulkImportModal = true;
    this.showImportResultModal = false;
  }

  closeBulkImportModal() {
    this.showBulkImportModal = false;
  }

  processImport() {
    this.showBulkImportModal = false;
    this.showImportResultModal = true;
  }

  closeImportResultModal() {
    this.showImportResultModal = false;
  }

  restartBulkImport() {
    this.showImportResultModal = false;
    this.showBulkImportModal = true;
  }

  // ✅ Download Employee List
  downloadEmployeeList() {
    this.superadmin.downloadEmployeeListService().subscribe({
      next: (res: Blob) => {
        const blob = new Blob([res], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'employees.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();

        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Failed to download employee list:', err),
    });
  }
}
