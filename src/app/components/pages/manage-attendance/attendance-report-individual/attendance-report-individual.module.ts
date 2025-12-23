import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AttendanceReportIndividualComponent } from './attendance-report-individual.component';


const AttendanceReportIndividualRoutes: Routes = [{ path: '', component: AttendanceReportIndividualComponent }];
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(AttendanceReportIndividualRoutes),
  ],
})
export class AttendanceReportIndividualModule {}
