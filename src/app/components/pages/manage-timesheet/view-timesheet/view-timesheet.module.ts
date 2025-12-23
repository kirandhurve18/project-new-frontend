import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ViewTimesheetComponent } from './view-timesheet.component';


const ViewTimesheetRoutes: Routes = [
  { path: '', component: ViewTimesheetComponent },

];
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(ViewTimesheetRoutes),
  ],
})
export class ViewTimesheetModule { }
