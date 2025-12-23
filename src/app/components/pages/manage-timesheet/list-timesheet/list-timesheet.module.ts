import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ListTimesheetComponent } from './list-timesheet.component';


const ListTimesheetRoutes: Routes = [
  { path: '', component: ListTimesheetComponent },

];
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(ListTimesheetRoutes),
  ],
})
export class ListTimesheetModule { }
