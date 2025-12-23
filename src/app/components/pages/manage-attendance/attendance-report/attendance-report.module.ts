import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AttendanceReportComponent } from './attendance-report.component';

const attendanceReportRoutes: Routes = [{ path: '', component: AttendanceReportComponent }];
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(attendanceReportRoutes),
  ],
})
export class AttendanceReportModule {}
