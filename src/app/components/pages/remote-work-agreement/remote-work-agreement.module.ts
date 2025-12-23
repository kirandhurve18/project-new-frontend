import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RemoteWorkAgreementComponent } from './remote-work-agreement.component';

const RemoteWorkAgreementRoutes: Routes = [{ path: '', component: RemoteWorkAgreementComponent }];
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(RemoteWorkAgreementRoutes),
  ],
})
export class RemoteWorkAgreementModule {}
