import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // <-- NgModel lives here
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';

// https://stackoverflow.com/questions/40214211/disable-angular2-in-memory-web-api-for-production
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService } from './in-memory-data.service';
import { AppHttpModule } from './in-memory-data.service';
import { Env } from './environments/env';

import { AppComponent } from './app.component';

import { ProjectsService } from './projects.service';
import { ProjectsComponent } from './projects.component';
import { ProjectDetailComponent } from './project-detail.component';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    // InMemoryWebApiModule.forRoot(InMemoryDataService),
    AppHttpModule,
    RouterModule.forRoot([
      {
        path: 'projects/:id',
        component: ProjectDetailComponent
      },
      {
        path: 'projects',
        component: ProjectsComponent
      },
      /*{
        path: '',
        redirectTo: '/projects',
        pathMatch: 'full'
      },*/
    ]),
    FormsModule // <-- import the FormsModule before binding with [(ngModel)]
  ],
  declarations: [
    AppComponent,
    ProjectsComponent,
    ProjectDetailComponent
  ],
  providers: [
    ProjectsService,
    Env
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
 }
