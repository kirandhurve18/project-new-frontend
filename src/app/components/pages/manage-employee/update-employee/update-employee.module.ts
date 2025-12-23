import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UpdateEmployeeComponent } from './update-employee.component';

const UpdateEmployeeRoutes: Routes = [{ path: '', component: UpdateEmployeeComponent }];
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(UpdateEmployeeRoutes),
  ],
})
export class UpdateEmployeeModule {}
