import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockBackend, MockConnection } from '@angular/http/testing';

import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
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

// https://angular.io/guide/testing#simple-component-test

fdescribe('Projects Component: ', () => {
  let elementFixture: ComponentFixture<ProjectsComponent>;
  let projectsService: ProjectsService;
  let env: Env;
  let mockBackend: MockBackend;
  let projectsComponent: ProjectsComponent;
  let router: Router;

  const MockProjectsArray = PROJECTS;
  const mockProject: Project = <Project>{ format: 'PROPERTIES', id: 1, name: 'dotcms', personId: 10, sourceLocale: 'en_EN', type: 'Utf-8' };

  const loggingMsg = function (msg: string) {
    console.log(msg);
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProjectsService, Env,  // we should not be using real services,
        // but stubs, fakes, spies, or mocks instead
        MockBackend,
        BaseRequestOptions,
        {
          provide: Http,
          useFactory: (backend: MockBackend, options: BaseRequestOptions) =>
            new Http(backend, options),
          deps: [MockBackend, BaseRequestOptions]
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

    // this should be safer way to get the service
    /* projectsService = elementFixture.debugElement
      .injector.get(ProjectsService);
    env = elementFixture.debugElement
      .injector.get(Env);
    // or like this
    projectsService  = TestBed.get(ProjectsService );
    env = TestBed.get(Env);*/
  });

  // but we will inject the services so we can spy on them.
  // SIC! does not return services from component providers.
  beforeEach(inject([ProjectsService, Env, MockBackend, Router],
    (ps: ProjectsService, e: Env, mb: MockBackend, r: Router) => {
      projectsService = ps;
      env = e;
      router = r;
      projectsComponent = new ProjectsComponent(ps, r);
      mockBackend = mb;
    }));

  it('should initialize and call projectsComponent.getProjects() (done)', () => {
    spyOn(projectsComponent, 'getProjects');

    projectsComponent.ngOnInit();

    expect(projectsComponent.getProjects).toHaveBeenCalled();
    expect(projectsComponent.getProjects).toHaveBeenCalledTimes(1);

  });

  it('should set selected project to the project passed to onSelect ()', () => {
      projectsComponent.onSelect(mockProject);

      expect(projectsComponent.selectedProject).toBe(mockProject);
  });

  it('should call projectsService.getProjects() and return projects array (done)', (done) => {
    spyOn(projectsService, 'getProjects').and.callFake(() => {
      return Promise.resolve(MockProjectsArray);
    });

    projectsComponent.getProjects().then(() => {
      expect(projectsService.getProjects).toHaveBeenCalled();
      expect(projectsService.getProjects).toHaveBeenCalledTimes(1);
      expect(projectsComponent.projects.length).toBe(2);
      expect(projectsComponent.projects).toBe(MockProjectsArray);
      done();
    });

  });

  it('should call projectsService.getProjects() and return error message (done)', (done) => {
    const errorMsg = 'Some error';
    spyOn(projectsService, 'getProjects').and.callFake(() => {
      return Promise.reject(errorMsg);
    });

    elementFixture.detectChanges();

    projectsComponent.getProjects().then(() => {
      expect(projectsService.getProjects).toHaveBeenCalled();
      expect(projectsService.getProjects).toHaveBeenCalledTimes(2); // <= detectChanges()
      expect(projectsComponent.projects.length).toBe(0);
      expect(projectsComponent.error).toBe(errorMsg);
      done();
    });
  });

  it('should not call getProjects (async)', async(() => {
    // Setup spy on the 'getProjects' method
    const spy = spyOn(projectsService, 'getProjects').and
      .returnValue(Promise.resolve(MockProjectsArray));

    expect(spy.calls.any()).toBe(false);
    elementFixture.detectChanges();
    expect(spy.calls.any()).toBe(true, 'Already called getProjects()');

    // meanwhile in async test zone calls are intercepted, so we can
    elementFixture.whenStable().then(() => { // wait for promise to resolve
      elementFixture.detectChanges();        // and wait for update view
    });
  }));

  it('should navigate to detail page ()', () => {
      spyOn(router, 'navigate');

      projectsComponent.selectedProject = mockProject;
      projectsComponent.gotoDetail();

      expect(router.navigate).toHaveBeenCalledWith([ '/projects', mockProject.id ]);
  });

});
