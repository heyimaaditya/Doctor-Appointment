import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient,withInterceptors } from '@angular/common/http';
import { NzConfig,provideNzConfig } from 'ng-zorro-antd/core/config';
import { authInterceptor } from './core/interceptors/auth.interceptor';
registerLocaleData(en);

const ngZorroConfig: NzConfig = {
  message: { nzMaxStack: 3, nzDuration: 3000 }, // Example global config
  notification: { nzMaxStack: 3 }
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), // Default
    provideRouter(routes), // Provide main routes
    provideHttpClient(withInterceptors([authInterceptor])), // Provide HttpClient with interceptor
    provideAnimationsAsync(), // For NgZorro animations
    provideNzI18n(en_US), // NgZorro internationalization
    provideNzConfig(ngZorroConfig) // Optional global NgZorro config
    // Add other global services if not using `providedIn: 'root'`
  ]
};
