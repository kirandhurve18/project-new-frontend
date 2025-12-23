import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SubmittedTimesheetComponent } from './submitted-timesheet.component';



const SubmittedTimesheetRoutes: Routes = [
  { path: '', component: SubmittedTimesheetComponent },

];
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(SubmittedTimesheetRoutes),
  ],
})
export class SubmittedTimesheetModule { }
