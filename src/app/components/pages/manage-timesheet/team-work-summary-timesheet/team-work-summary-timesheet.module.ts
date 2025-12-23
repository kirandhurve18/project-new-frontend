import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TeamWorkSummaryTimesheetComponent } from './team-work-summary-timesheet.component';



const TeamWorkSummaryTimesheetRoutes: Routes = [
  { path: '', component: TeamWorkSummaryTimesheetComponent },

];
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(TeamWorkSummaryTimesheetRoutes),
  ],
})
export class TeamWorkSummaryTimesheetModule { }
