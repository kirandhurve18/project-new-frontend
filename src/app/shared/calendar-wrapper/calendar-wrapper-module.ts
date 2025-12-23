import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule, CalendarCommonModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

@NgModule({
  imports: [
    CommonModule,
    CalendarCommonModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
  ],
  exports: [
    CalendarCommonModule,
    CalendarModule,
  ]
})
export class CalendarWrapperModule {}
