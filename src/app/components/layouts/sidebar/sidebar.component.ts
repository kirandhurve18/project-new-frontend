import { Component, OnInit, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';
import { SidebarService } from '../../../services/sidebar.service';
import { environment } from '../../../environments/environment';

interface NavLink {
  label: string;
  link: string;
  icon: string;
  order: number;
}

const MENU_CONFIG: Record<string, NavLink> = {
  'dashboard': { label: 'Dashboard', link: '/main/dashboard', icon: `${environment.BASE_PATH_ASSETS}/icons/tachometer-alt-solid 1.svg`, order: 1 },
  'employee-info': { label: 'Employee Info', link: '/main/employee_info', icon: `${environment.BASE_PATH_ASSETS}/icons/id-badge-solid.svg`, order: 2 },
  'mark-attendance': { label: 'Mark Attendance', link: '/main/attendance', icon: `${environment.BASE_PATH_ASSETS}/icons/fingerprint_565512 1.svg`, order: 3 },
  'festival-leave': { label: 'Festival Leave', link: '/main/festival', icon: `${environment.BASE_PATH_ASSETS}/icons/gift-solid 1.svg`, order: 4 },
  'leave-management': { label: 'Leave Management', link: '/main/leave', icon: `${environment.BASE_PATH_ASSETS}/icons/plane-departure-solid 1.svg`, order: 5 },
  'leave-summary': { label: 'Leave Summary', link: '/main/leave/summary', icon: `${environment.BASE_PATH_ASSETS}/icons/calendar-check-solid 1.svg`, order: 6 },
  'rewards-and-recognition': { label: 'Rewards & Recognition', link: '/main/rnr', icon: `${environment.BASE_PATH_ASSETS}/icons/award-solid 1.svg`, order: 7 },
  'todays-timesheet': { label: 'Today’s Timesheet', link: '/main/add-timesheet', icon: `${environment.BASE_PATH_ASSETS}/icons/clock-solid 1.svg`, order: 8 },
  'work-history': { label: 'Work History', link: '/main/view-timesheet', icon: `${environment.BASE_PATH_ASSETS}/icons/briefcase-solid 1.svg`, order: 9 },
  'timesheet-history': { label: 'Timesheet History', link: '/main/list-timesheet', icon: `${environment.BASE_PATH_ASSETS}/icons/calendar-days-solid 1.svg`, order: 10 },
  'attendance-report': { label: 'Attendance Report', link: '/main/attendance/report', icon: `${environment.BASE_PATH_ASSETS}/icons/calendar-check-solid 1.svg`, order: 11 },
  'team-submission': { label: 'Team Submissions', link: '/main/team-submission-timesheet', icon: `${environment.BASE_PATH_ASSETS}/icons/users-solid (1).svg`, order: 12 },
  'team-work-summary': { label: 'Team Work Summary', link: '/main/team-work-summary-timesheet', icon: `${environment.BASE_PATH_ASSETS}/icons/users-solid (1).svg`, order: 13 },
  'admin-settings': { label: 'Admin Settings', link: '/main/settings', icon: `${environment.BASE_PATH_ASSETS}/icons/gear-solid 1 (2).svg`, order: 14 },
  'remote-work-agreement': { label: 'Remote Agreement', link: '/main/remote-work-agreement', icon: `${environment.BASE_PATH_ASSETS}/icons/terms_conditions 1.png`, order: 15 },
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  @Input() isSidebarOpen: boolean = true;

  userRole: string | null = null;
  work_mode: string = '';
  rolePermissions: any[] = [];
  navLinks: NavLink[] = [];

  constructor(
    private router: Router,
    private auth: AuthService,
    private sidebarService: SidebarService,
  ) { }

  ngOnInit() {
    const user = localStorage.getItem('user');
    this.userRole = localStorage.getItem('user_role');
    this.work_mode = localStorage.getItem('work_mode') || '';

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.sidebarService.getPermissions().subscribe({
      next: (response) => {
        if (response?.success && response.data?.permissions) {
          this.rolePermissions = response.data.permissions;

          this.navLinks = this.rolePermissions
            .map((perm: any) => {
              let baseLink = MENU_CONFIG[perm.menu.key];
              if (!baseLink) return undefined;

              // console.log("baseLink ---> ", baseLink)
              if('remote-work-agreement' == perm.menu.key && ['WFO'].includes(this.work_mode)) return undefined;
              if(this.userRole == '1' && 'leave-management' == perm.menu.key){
                baseLink.link = '/main/leave/teams-list'
              }
              return {
                ...baseLink,
                order: perm.order ?? baseLink.order,
              };
            })
            .filter((link: NavLink | undefined): link is NavLink => !!link)
            .sort((a, b) => a.order - b.order);
        } else {
          this.setSidebarLinksFallback();
        }
      },
      error: (error) => {
        this.setSidebarLinksFallback();
      },
    });
  }

  isRouteActive(routePath: string): boolean {
    return this.router.isActive(routePath, false);
  }

  isActive(link: string): boolean {
    const currentUrl = this.router.url;

    if (link === '/main/settings') {
      return [
        '/main/settings/organization',
        '/main/settings/leave-attendance',
        '/main/settings/payroll',
        '/main/settings/permission',
      ].some(route => currentUrl.startsWith(route));
    }

    if (link === '/main/employee_info') {
      return [
        '/main/employee_info',
        '/main/add-employee',
        '/main/update-employee',
        '/main/employee-hierarchy',
      ].some(route => currentUrl.startsWith(route));
    }

    if (link === '/main/leave') {
      return [
        '/main/leave/status',
        '/main/leave/apply',
        '/main/leave/teams-list',
        '/main/leave/teams-pending-list',
        '/main/leave/teams-reviewer-list',
      ].some(route => currentUrl.startsWith(route));
    }

    if (link === '/main/leave' || link === '/main/leave/teams-list') {
      return [
        '/main/leave/status',
        '/main/leave/apply',
        '/main/leave/teams-list',
        '/main/leave/teams-pending-list',
        '/main/leave/teams-reviewer-list',
      ].some(route => currentUrl.startsWith(route));
    }
    
    if (link === '/main/leave/summary') {
      return [
        '/main/leave/summary/active',
        '/main/leave/summary/past',
      ].some(route => currentUrl.startsWith(route));
    }

    if (link === '/main/attendance/report') {
      return [
        '/main/attendance/report',
        '/main/attendance/report-individual',
      ].some(route => currentUrl.startsWith(route));
    }

    return currentUrl === link;
  }

  private setSidebarLinksFallback() {
    if (this.userRole === '1') {
      this.navLinks = [
        MENU_CONFIG['dashboard'],
      ].sort((a, b) => a.order - b.order);
    } else {
      this.navLinks = [
        MENU_CONFIG['mark-attendance'],
      ].sort((a, b) => a.order - b.order);
    }
  }
}
