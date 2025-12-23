import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AttendanceComponent } from './attendance.component';
import { AttendanceReportComponent } from '../attendance-report/attendance-report.component';
import { AttendanceReportIndividualComponent } from '../attendance-report-individual/attendance-report-individual.component';

const attendanceRoutes: Routes = [
  { path: '', component: AttendanceComponent },
  { path: 'report-individual', component: AttendanceReportIndividualComponent },
  { path: 'report', component: AttendanceReportComponent },
  // { path: '', redirectTo: 'report', pathMatch: 'full' }, // default child
  // { path: '**', redirectTo: 'organization' },


];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(attendanceRoutes),
  ],
})
export class AttendanceModule { }
