import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { SpinnerHelper } from '../spinner-helper';
import { finalize, delay, switchMap, of } from 'rxjs';

export const spinnerInterceptor: HttpInterceptorFn = (req, next) => {
  const spinner = inject(SpinnerHelper);
  spinner.show();

  // Use RxJS to delay the request by 2 seconds
  return of(null).pipe(
  
    switchMap(() => next(req)), // Continue with the request
    finalize(() => spinner.hide()) // Hide the spinner once done
  );
};
