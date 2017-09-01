import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { FormsModule} from '@angular/forms';

import {
  Http,
  HttpModule,
  XHRBackend,
  ResponseOptions,
  Response,
  BaseRequestOptions,
  RequestOptions,
  RequestMethod
} from '@angular/http';

import { ProjectsComponent } from './projects.component';
import { ProjectDetailComponent } from './project-detail.component';
import { ProjectsService } from './projects.service';
import { PROJECTS } from './mock-projects';
import { Project } from './project';
import { Env } from './environments/env';

fdescribe('Projects Component: ', () => {
  let elementFixture: ComponentFixture<ProjectsComponent>;
  let projectsService: ProjectsService;
  let env: Env;
  let mockBackend: MockBackend;
  let projectsComponent: ProjectsComponent;
  let router: Router;

  const MockProjectsArray = PROJECTS;
  const mockProject: Project = <Project>{format: 'PROPERTIES', id: 1, name: 'dotcms', personId: 10, sourceLocale: 'en_EN', type: 'Utf-8' };

  const loggingMsg = function (msg: string) {
    console.log(msg);
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProjectsService,  Env,
        MockBackend,
        BaseRequestOptions,
        {
          provide: Http,
          useFactory: (backend: MockBackend, options: BaseRequestOptions) =>
            new Http(backend, options),
          deps: [ MockBackend, BaseRequestOptions ]
        }
      ],
      declarations: [
        ProjectsComponent,
        ProjectDetailComponent
      ],
      imports: [
        FormsModule,
        RouterTestingModule
      ]
    });
    elementFixture = TestBed.createComponent(ProjectsComponent);
  });

  beforeEach(inject([ ProjectsService, Env, MockBackend, Router ],
    (ps: ProjectsService, e: Env, mb: MockBackend, r: Router) => {
      projectsService = ps;
      env = e;
      router = r;
      projectsComponent = new ProjectsComponent(ps);
      mockBackend = mb;
    }));

  it('should initialize and call projectsComponent.getProjects()', () => {
      spyOn(projectsComponent, 'getProjects');

      projectsComponent.ngOnInit();

      expect(projectsComponent.getProjects).toHaveBeenCalled();
      expect(projectsComponent.getProjects).toHaveBeenCalledTimes(1);

  });

  it('should call projectsService.getProjects() and return projects array', (done) => {
      spyOn(projectsService, 'getProjects').and.callFake(() => {
        return Promise.resolve(MockProjectsArray);
      });

      projectsComponent.getProjects().then(() => {
        expect(projectsService.getProjects).toHaveBeenCalled();
        expect(projectsService.getProjects).toHaveBeenCalledTimes(1);
        expect(projectsComponent.projects).toBe(MockProjectsArray);
        done();
      });

  });

  it('should call projectsService.getProjects() and return error message', (done) => {
      const errorMsg = 'Some error';
      spyOn(projectsService, 'getProjects').and.callFake(() => {
        return Promise.reject(errorMsg);
      });

      projectsComponent.getProjects().then(() => {
        expect(projectsService.getProjects).toHaveBeenCalled();
        expect(projectsService.getProjects).toHaveBeenCalledTimes(1);
        expect(projectsComponent.projects.length).toBe(0);
        expect(projectsComponent.error).toBe(errorMsg);
        done();
      });

  });


});
