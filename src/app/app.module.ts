import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // <-- NgModel lives here
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';

import { AppHttpModule } from './in-memory-data.service';
import { Env } from './environments/env';

import { AppComponent } from './app.component';

import { ProjectsService } from './projects.service';
import { ProjectsComponent } from './projects.component';
import { ProjectDetailComponent } from './project-detail.component';
import { ProjectsmainComponent } from './projectsmain.component';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    AppHttpModule,
    RouterModule.forRoot([
      {
        path: 'projectsdetail/:id',
        component: ProjectDetailComponent
      },
      {
        path: 'projects/:id',
        component: ProjectsComponent
      },
      {
        path: 'projects',
        redirectTo: '/projects/1',
        pathMatch: 'full'
      },
      {
        path: 'projectsmain/:id',
        component: ProjectsmainComponent
      },
      {
        path: 'projectsmain',
        component: ProjectsmainComponent
      },
      {
        path: '',
        redirectTo: '/projectsmain',
        pathMatch: 'full'
      },
    ]),
    FormsModule // <-- import the FormsModule before binding with [(ngModel)]
  ],
  declarations: [
    AppComponent,
    ProjectsComponent,
    ProjectDetailComponent,
    ProjectsmainComponent
  ],
  providers: [
    ProjectsService,
    Env
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
 }
