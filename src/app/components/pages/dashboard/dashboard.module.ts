import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

const dashboardRoutes: Routes = [{ path: '', component: DashboardComponent }];
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(dashboardRoutes),
  ],
})
export class DashboardModule {}
