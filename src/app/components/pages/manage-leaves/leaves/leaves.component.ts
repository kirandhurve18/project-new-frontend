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

  teamLeaves: any[] = [];
  teamCurrentLeaves: any[] = []; // 🔹 for current/upcoming leaves (superadmin only)

  constructor(private superadmin: Superadmin, private router: Router) {}

  ngOnInit(): void {
    let user: any = localStorage.getItem('user');
    this.userRole = localStorage.getItem('user_role') || '0';
    this.employee_id = localStorage.getItem('employee_id');

    if (!user) {
      this.router.navigate(['/login']);
    }

    if (this.employee_id) {
      this.loadEmployeeLeaveSummary();

      // 🔹 Team summary for 1, 2, 3
      if (['1', '2', '3'].includes(this.userRole)) {
        this.loadTeamLeaves();
      }

      // 🔹 Current/Upcoming only for Superadmin (role = 1)
      if (this.userRole === '1') {
        this.loadCurrentUpcomingLeaves();
      }
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

  /** 🔹 Load Team Leaves (Summary) */
  loadTeamLeaves() {
    const payload = { employee_id: this.employee_id! }; // current logged-in lead/superadmin
    this.superadmin.getTeamLeavesTaken(payload).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          // merge duplicates by employee_id
          const map = new Map();
          res.data.forEach((item: any) => {
            if (map.has(item.employee_id)) {
              map.get(item.employee_id).total_used_leaves +=
                item.total_used_leaves;
            } else {
              map.set(item.employee_id, { ...item });
            }
          });
          this.teamLeaves = Array.from(map.values());
        }
      },
      error: (err) => {
        console.error('Error fetching team leaves:', err);
      }
    });
  }

  /** 🔹 Load Current / Upcoming Leaves (Superadmin Only) */
  loadCurrentUpcomingLeaves() {
    const payload = { _id: this.employee_id! };
    this.superadmin.getCurrentUpcomingLeaves(payload).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.teamCurrentLeaves = res.data;
        } else {
          this.teamCurrentLeaves = [];
        }
      },
      error: (err) => {
        console.error('Error fetching current/upcoming leaves:', err);
        this.teamCurrentLeaves = [];
      }
    });
  }
}
