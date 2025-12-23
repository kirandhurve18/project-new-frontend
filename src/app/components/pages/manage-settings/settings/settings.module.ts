import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './settings.component';
import { OrganizationComponent } from '../organization/organization';
import { LeaveAttendance } from '../settings-leave-attendance/leave-attendance';
import { SettingsPermissionComponent } from '../settings-permission/settings-permission.component';
import { PayrollComponent } from '../payroll/payroll';

const SettingsRoutes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    children: [
      { path: 'organization', component: OrganizationComponent },
      { path: 'leave-attendance', component: LeaveAttendance },
      { path: 'payroll', component: PayrollComponent }, // maybe a dedicated PayrollComponent later
      { path: 'permission', component: SettingsPermissionComponent },

      { path: '', redirectTo: 'organization', pathMatch: 'full' }, // default child
      { path: '**', redirectTo: 'organization' }, // fallback
    ]
  }

];
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(SettingsRoutes),
  ],
})
export class SettingsModule { }
