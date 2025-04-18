import { CanActivateFn } from '@angular/router';

export const publicGuard: CanActivateFn = (route, state) => {
  return true;
};
