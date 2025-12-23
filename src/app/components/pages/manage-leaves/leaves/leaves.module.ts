import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LeavesComponent } from './leaves.component';
import { LeavesStatusComponent, } from '../leaves-status/leaves-status.component';
import { LeavesApplyComponent } from '../leaves-apply/leaves-apply.component';
import { LeavesTeamsListComponent } from '../leaves-teams-list/leaves-teams-list.component';
import { LeavesSummaryComponent } from '../leaves-summary/leaves-summary.component';
import { LeavesActiveListComponent } from '../leaves-active-list/leaves-active-list.component';
import { LeavesPastListComponent } from '../leaves-past-list/leaves-past-list.component';
import { LeavesReviewerListComponent } from '../leaves-reviewer-list/leaves-reviewer-list.component';
import { LeavesRedirectGuard } from '../../../../core/guards/leave-redirect.guard';

const LeavesRoutes: Routes = [
  {
    path: 'summary',
    component: LeavesSummaryComponent,
    children: [
      { path: 'active', component: LeavesActiveListComponent },
      { path: 'past', component: LeavesPastListComponent },
      { path: '', redirectTo: 'active', pathMatch: 'full' }, // default child
      { path: '**', redirectTo: 'active' }, // fallback
    ]
  },
  {
    path: '',
    component: LeavesComponent,
    children: [
      { path: 'status', component: LeavesStatusComponent },
      { path: 'apply', component: LeavesApplyComponent },
      { path: 'teams-list', component: LeavesTeamsListComponent },
      { path: 'teams-reviewer-list', component: LeavesReviewerListComponent },
      { path: '', redirectTo: 'status', pathMatch: 'full' }, // default child
      // { path: '**', canActivate: [LeavesRedirectGuard]}, // fallback
    ]
  },

];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(LeavesRoutes),
  ],
})
export class LeavesModule { }
