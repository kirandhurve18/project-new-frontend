import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FestivalComponent } from './festival.component';


const FestivalRoutes: Routes = [{ path: '', component: FestivalComponent }];
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(FestivalRoutes),
  ],
})
export class FestivalModule {}
