import { Component, OnInit, HostListener, Output, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  @Input() isSidebarOpen: boolean = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  full_name: string | null = '';
  role: string | null = '';
  designation_name: string | null = '';

  userIcon = `${environment.BASE_PATH_ASSETS}/icons/user_icon.png`;
  bellIcon = `${environment.BASE_PATH_ASSETS}/icons/bell_icon.png`;
  employeeId: string | null = null; // ✅ will hold logged-in employee id

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit() {
    this.full_name = localStorage.getItem('full_name');
    this.role = localStorage.getItem('role');
    this.designation_name = localStorage.getItem('designation_name');
    // ✅ get employeeId (depends on your backend response key)
    this.employeeId = localStorage.getItem('employee_id') || localStorage.getItem('_id');

  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // If you wish to make the header aware of mobile state, let parent own the logic.
  }

  emitSidebarToggle() {
    console.log("toggle")
    this.toggleSidebar.emit();
  }

  logout() {
    this.auth.logout();
  }

  viewProfile() {
    if (this.employeeId) {
      this.router.navigate(['/main/employee_profile', this.employeeId]);
    } else {
      console.error('❌ Employee ID not found in localStorage');
    }
  }
}
