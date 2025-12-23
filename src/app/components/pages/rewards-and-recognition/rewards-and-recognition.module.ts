import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RewardsAndRecognitionComponent } from './rewards-and-recognition.component';

const RewardsAndRecognitionRoutes: Routes = [{ path: '', component: RewardsAndRecognitionComponent }];
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(RewardsAndRecognitionRoutes),
  ],
})
export class RewardsAndRecognitionModule {}
