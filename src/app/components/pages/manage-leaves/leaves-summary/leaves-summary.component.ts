
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Superadmin } from '../../../../core/services/superadmin';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterLinkWithHref, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-leaves-summary',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet,
    RouterLink,
    RouterLinkActive,
    RouterLinkWithHref],
  templateUrl: './leaves-summary.component.html',
  styleUrls: ['./leaves-summary.component.css']
})
export class LeavesSummaryComponent implements OnInit {

  router: any;

  userRole: string | null = null;

  employeeleave: any[] = [];

  // Replace this with logged-in employee id
  employee_id: string | null = '';


  constructor(private superadmin: Superadmin) {

  }

  ngOnInit(): void {
    let user: any = localStorage.getItem('user');
    this.userRole = localStorage.getItem('user_role');
    this.employee_id = localStorage.getItem('employee_id')

    if (!user) {
      this.router.navigate(['/login']);
    }
  }

}
