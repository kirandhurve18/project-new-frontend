import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AddEmployeeComponent } from './add-employee.component';

const AddEmployeeRoutes: Routes = [{ path: '', component: AddEmployeeComponent }];
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(AddEmployeeRoutes),
  ],
})
export class AddEmployeeModule {}
