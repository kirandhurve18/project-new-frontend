import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HierarchyEmployeeComponent } from './hierarchy-employee.component';

const HierarchyEmployeeRoutes: Routes = [
  { path: '', component: HierarchyEmployeeComponent },

];
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(HierarchyEmployeeRoutes),
  ],
})
export class HierarchyEmployeeModule { }
