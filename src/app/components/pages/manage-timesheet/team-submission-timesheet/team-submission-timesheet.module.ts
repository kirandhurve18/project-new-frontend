import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TeamSubmissionTimesheetComponent } from './team-submission-timesheet.component';



const TeamSubmissionTimesheetRoutes: Routes = [
  { path: '', component: TeamSubmissionTimesheetComponent },

];
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(TeamSubmissionTimesheetRoutes),
  ],
})
export class TeamSubmissionTimesheetModule { }
