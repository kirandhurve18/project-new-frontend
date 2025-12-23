import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeComponent } from './employee.component';

const EmployeeRoutes: Routes = [
  { path: '', component: EmployeeComponent },

];
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(EmployeeRoutes),
  ],
})
export class EmployeeModule { }
