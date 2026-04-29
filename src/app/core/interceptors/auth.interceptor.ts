import { HttpInterceptorFn } from '@angular/common/http';
import { from, switchMap } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  return from(Preferences.get({ key: 'token' })).pipe(
    switchMap(tokenData => {
      if (tokenData.value) {
        const cloned = req.clone({
          setHeaders: { Authorization: `Bearer ${tokenData.value}` }
        });
        return next(cloned);
      }
      return next(req);
    })
  );
};