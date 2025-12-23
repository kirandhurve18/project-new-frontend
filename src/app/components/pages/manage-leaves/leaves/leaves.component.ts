import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Superadmin } from '../../../../core/services/superadmin';
import { FormsModule } from '@angular/forms';
import {
  RouterLink,
  RouterLinkActive,
  RouterLinkWithHref,
  RouterOutlet,
  Router
} from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    RouterLinkWithHref
  ],
  templateUrl: './leaves.component.html',
  styleUrls: ['./leaves.component.css']
})
export class LeavesComponent implements OnInit {
  userRole: string = '0';
  employeeleave: any[] = [];
  employee_id: string | null = '';
  currentYear = new Date().getFullYear();

  constructor(private superadmin: Superadmin, private router: Router) { }

  ngOnInit(): void {
    let user: any = localStorage.getItem('user');
    this.userRole = localStorage.getItem('user_role') || '0';
    this.employee_id = localStorage.getItem('employee_id');

    if (!user) {
      this.router.navigate(['/login']);
    }

    if (this.employee_id) {
      this.loadEmployeeLeaveSummary();
    }
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

            this.employeeleave = [
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
            this.employeeleave = [];
          }
        },
        error: (err) => {
          console.error('Error fetching leave summary:', err);
          this.employeeleave = [];
        }
      });
  }
}
