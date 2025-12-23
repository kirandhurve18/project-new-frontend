import { Routes } from '@angular/router';
import { Termsandconditions } from './auth/termsandconditions/termsandconditions';
import { Privacyandpolicy } from './auth/privacyandpolicy/privacyandpolicy';
import { AuthGuard } from './core/guards/auth.guard';
import { MainComponent } from './components/main/main.component';
import { LoginComponent } from './components/pages/login/login.component';
import { LeavesRedirectGuard } from './core/guards/leave-redirect.guard';

export const routes: Routes = [
  // ✅ Default route → redirect to login
  { path: 'login', component: LoginComponent },
  // { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'termsandconditions', component: Termsandconditions },
  { path: 'privacyandpolicy', component: Privacyandpolicy },
  {
    path: 'main',
    component: MainComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./components/pages/dashboard/dashboard.module').then((m) => m.DashboardModule),
      },
      {
        path: 'attendance',
        loadChildren: () =>
          import('./components/pages/manage-attendance/attendance/attendance.module').then((m) => m.AttendanceModule),
      },
      {
        path: 'attendance_report',
        loadChildren: () =>
          import('./components/pages/manage-attendance/attendance-report/attendance-report.module').then((m) => m.AttendanceReportModule),
      },
      {
        path: 'attendance-report-individual',
        loadChildren: () =>
          import('./components/pages/manage-attendance/attendance-report-individual/attendance-report-individual.module').then((m) => m.AttendanceReportIndividualModule),
      },
      {
        path: 'festival',
        loadChildren: () =>
          import('./components/pages/festival/festival.module').then((m) => m.FestivalModule),
      },
      {
        path: 'employee_info',
        loadChildren: () =>
          import('./components/pages/manage-employee/employee/employee.module').then((m) => m.EmployeeModule),
      },
      {
        path: 'employee-hierarchy',
        loadChildren: () =>
          import('./components/pages/manage-employee/hierarchy-employee/hierarchy-employee.module').then((m) => m.HierarchyEmployeeModule),
      },
      {
        path: 'employee_profile/:id',
        loadChildren: () =>
          import('./components/pages/manage-employee/profile-employee/profile-employee.module').then((m) => m.ProfileEmployeeModule),
      },
      {
        path: 'add-employee',
        loadChildren: () =>
          import('./components/pages/manage-employee/add-employee/add-employee.module').then((m) => m.AddEmployeeModule),
      },
      {
        path: 'update-employee/:id',
        loadChildren: () =>
          import('./components/pages/manage-employee/update-employee/update-employee.module').then((m) => m.UpdateEmployeeModule),
      },
      {
        path: 'add-timesheet',
        loadChildren: () =>
          import('./components/pages/manage-timesheet/add-timesheet/add-timesheet.module').then((m) => m.AddTimesheetModule),
      },
      {
        path: 'list-timesheet',
        loadChildren: () =>
          import('./components/pages/manage-timesheet/list-timesheet/list-timesheet.module').then((m) => m.ListTimesheetModule),
      },
      {
        path: 'submitted-timesheet',
        loadChildren: () =>
          import('./components/pages/manage-timesheet/submitted-timesheet/submitted-timesheet.module').then((m) => m.SubmittedTimesheetModule),
      },
      {
        path: 'team-submission-timesheet',
        loadChildren: () =>
          import('./components/pages/manage-timesheet/team-submission-timesheet/team-submission-timesheet.module').then((m) => m.TeamSubmissionTimesheetModule),
      },
      {
        path: 'rnr',
        loadChildren: () =>
          import('./components/pages/rewards-and-recognition/rewards-and-recognition.module').then((m) => m.RewardsAndRecognitionModule),
      },
      {
        path: 'remote-work-agreement',
        loadChildren: () =>
          import('./components/pages/remote-work-agreement/remote-work-agreement.module').then((m) => m.RemoteWorkAgreementModule),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./components/pages/manage-settings/settings/settings.module').then((m) => m.SettingsModule),
      },
      {
        path: 'team-work-summary-timesheet',
        loadChildren: () =>
          import('./components/pages/manage-timesheet/team-work-summary-timesheet/team-work-summary-timesheet.module').then((m) => m.TeamWorkSummaryTimesheetModule),
      },
      {
        path: 'leave',
        loadChildren: () =>
          import('./components/pages/manage-leaves/leaves/leaves.module').then((m) => m.LeavesModule),
      },
      {
        path: 'view-timesheet',
        loadChildren: () =>
          import('./components/pages/manage-timesheet/view-timesheet/view-timesheet.module').then((m) => m.ViewTimesheetModule),
      },
      {
        path: 'view-timesheet/:employee_id/:date',
        loadChildren: () =>
          import('./components/pages/manage-timesheet/view-timesheet/view-timesheet.module').then((m) => m.ViewTimesheetModule),
      },
    ]
  },
  { path: '**', redirectTo: 'login' },
];
