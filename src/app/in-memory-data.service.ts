import { InMemoryDbService, InMemoryBackendService } from 'angular-in-memory-web-api';
import { ResponseOptions, XSRFStrategy, BrowserXhr, XHRBackend, HttpModule } from '@angular/http';
import { Injector, NgModule } from '@angular/core';
import { environment } from 'environments/environment.prod';
import { Env } from './environments/env';
// https://stackoverflow.com/questions/40214211/disable-angular2-in-memory-web-api-for-production

export class InMemoryDataService implements InMemoryDbService {
  createDb() {

  const projects = [
      { format: 'PROPERTIES', id: 1, name: 'dotcms', personId: 10, sourceLocale: 'en_EN', type: 'UTF_8' },
      { format: 'XLIFF', id: 2, name: 'presta', personId: 10, sourceLocale: 'fi_FI', type: 'ISO8859_1' },
      { format: 'PROPERTIES', id: 3, name: 'liferay', personId: 10, sourceLocale: 'fr_FR', type: 'UTF_8' }
    ];
    return { projects };
  }
}

export function backendFactory(injector: Injector, browser: BrowserXhr,
  xsrf: XSRFStrategy, options: ResponseOptions): any {
  if (environment.production) {
    return new XHRBackend(browser, options, xsrf);
  } else {
    return new InMemoryBackendService(injector, new InMemoryDataService(), {
    });
  }
}

@NgModule({
  imports: [HttpModule],
  providers: [
    {
      provide: XHRBackend,
      useFactory: backendFactory,
      deps: [Injector, BrowserXhr, XSRFStrategy, ResponseOptions]
    }
  ]
})

export class AppHttpModule {
  constructor(private env: Env) {
    console.log('Production state is ' + environment.production);
    env.setProductionState(environment.production)
  }
}
