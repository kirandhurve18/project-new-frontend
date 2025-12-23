import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AddTimesheetComponent } from './add-timesheet.component';


const AddTimesheetRoutes: Routes = [
  { path: '', component: AddTimesheetComponent },

];
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(AddTimesheetRoutes),
  ],
})
export class AddTimesheetModule { }
