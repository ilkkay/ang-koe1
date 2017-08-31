// import { InMemoryDbService } from 'angular-in-memory-web-api';

import { InMemoryDbService, InMemoryBackendService } from 'angular-in-memory-web-api';
import { ResponseOptions, XSRFStrategy, BrowserXhr, XHRBackend, HttpModule } from "@angular/http";
import { Injector, NgModule } from '@angular/core';
import { environment } from 'environments/environment';
import { Env } from './environments/env';

export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const projects = [
      /*{ format: '', id: 0, name: 'Empty ', personId: 0, sourceLocale: '', type: '' },*/
      { format: 'PROPERTIES', id: 1, name: 'dotcms', personId: 10, sourceLocale: 'en_EN', type: 'UTF_8' },
      { format: 'PROPERTIES', id: 2, name: 'presta', personId: 10, sourceLocale: 'en_EN', type: 'UTF_8' },
      { format: 'PROPERTIES', id: 3, name: 'liferay', personId: 10, sourceLocale: 'en_EN', type: 'UTF_8' }
    ];
    return { projects };
  }
}

@NgModule({
  imports: [HttpModule],
  providers: [
    {
      provide: XHRBackend,
      useFactory: (injector: Injector, browser: BrowserXhr,
        xsrf: XSRFStrategy, options: ResponseOptions): any => {
        if (environment.production) {
          return new XHRBackend(browser, options, xsrf);
        } else {
          return new InMemoryBackendService(injector, new InMemoryDataService(), {
          });
        }
      },
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
