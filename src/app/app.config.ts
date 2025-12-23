import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './core/services/interceptor/auth';
import { spinnerInterceptor } from './core/services/interceptor/spinner-interceptor';

import { DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr'; 

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        AuthInterceptor,
        spinnerInterceptor
      ])
    ),
    {
      provide: DateAdapter,
      useFactory: adapterFactory,
    },
    importProvidersFrom(BrowserAnimationsModule),
    importProvidersFrom(NgxSpinnerModule.forRoot()),
    importProvidersFrom( 
      ToastrModule.forRoot({
       
        positionClass: 'toast-bottom-right',
        preventDuplicates: true
      })
    )
  ]
};
