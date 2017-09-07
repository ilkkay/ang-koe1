import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import 'rxjs/add/operator/switchMap';

import { Project } from './project';
import { ProjectsService } from './projects.service';

@Component({
  selector: 'app-projectsmain',
  templateUrl: './projects/projects.component.html',
  styleUrls: ['./projects/projects.component.css']
})

export class ProjectsmainComponent implements OnInit {

  personId: number;
  project: Project = new Project();
  projects: Project[] = [];
  successMessage = '';
  errorMessage = '';

  // http://www.concretepage.com/angular-2/angular-2-formgroup-example
  projectForm: FormGroup;
  nameControl = new FormControl();

  // https://stackoverflow.com/questions/40979640/setting-selected-option-of-select-control-in-an-angular-2-model-driven-form
  types = [
    'ISO8859_1', 'UTF_8'
  ];

  formats = [
    'PROPERTIES', 'XLIFF'
  ];

  constructor(
    private projectsService: ProjectsService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.personId = 1;
    this.registerFormControls();
  }

  ngOnInit(): void {
    console.log('Entering ProjectsComponent.ngOnInit(): ');

    this.getProjectByRouteId();
  }

  registerFormControls(): void {
    this.projectForm = this.formBuilder.group({
      format: [''],
      id: [],
      name: ['', Validators.compose([Validators.required,
      Validators.minLength(6), Validators.maxLength(20)])],
      personId: [],
      sourceLocale: ['', Validators.pattern('[a-z]{2}_[a-zA-Z]{2}')],
      type: [''],
    });

    this.nameControl.valueChanges.subscribe(value => {
      if (value.trim().length === 0) {
        this.errorMessage = 'Name is missing';
        this.nameControl.setErrors({
          name: this.errorMessage
        });
      }
    });
  }

  getProjectByRouteId(): any {
    this.route.params.subscribe(params => {
      const routeId = +params['id'];
      if (!isNaN(routeId) && (routeId !== 0)) {
        return this.projectsService.getProject(routeId)
          .then(project => {
            console.log('Entering getProjectByRouteId() with: ' + routeId);
            console.log('Got a project:' + JSON.stringify(project));

            this.project = project;
            this.refreshView();
          })
          .catch(error => {
            this.errorMessage = this.getErrorMessages(error);
            this.setDefaultProject();
            this.getProjects();
          });
      } else {
        this.setDefaultProject();
        this.getProjects();
      };
    })
  }

  getProjects(): Promise<any> {
    console.log('Entering getProjects(): ');
    return this.projectsService.getProjects().then(
      projects => {
        console.log('Project count: ' + projects.length);

        this.projects = projects;
        this.errorMessage = '';
      }).catch(error => {
        this.errorMessage = this.getErrorMessages(error);
      });
  }

  setDefaultProject(): void {
    this.project = <Project>{
      format: 'PROPERTIES', id: 0, name: 'Test project',
      personId: this.personId, sourceLocale: 'en_EN', type: 'UTF_8'
    };

    this.projectForm.reset(this.project);
  }

  delete(): void {
    this.projectsService
      .delete(this.project.id)
      .then(() => {
        this.loggingMsg('Deleted project: ' + this.project.name);
        this.setDefaultProject();
        this.refreshView();
      }).catch(error => {
        this.errorMessage = this.getErrorMessages(error);
      });
  }

  save(): void {
    this.project = <Project>this.projectForm.value;
    console.log('Saving project: ' + JSON.stringify(this.project));

    if (this.project.id === 0) {
      this.create();
    } else {
      this.update();
    }
  }

  update(): void {
    this.projectsService.update(this.project)
      .then(project => {
        this.loggingMsg('Updated project: ' + project.name);
        this.project = project;
        this.refreshView();
      }).catch(error => {
        this.errorMessage = this.getErrorMessages(error);
      });
  }

  create(): void {
    // prestine????

    this.projectsService.create(this.project)
      .then(project => {
        this.loggingMsg('Created project: ' + JSON.stringify(project.name));
        this.project = project;
        this.refreshView();
      }).catch(error => {
        this.errorMessage = this.getErrorMessages(error);
      });
  }

  refreshView(): void {
    this.projectForm.setValue(this.project);
    this.getProjects();
    this.updateBrowserPath(this.project);
    this.errorMessage = '';
  }

  updateBrowserPath(project: Project): void {
    const link = ['/projectsmain', project.id];
    this.router.navigate(link);
  }

  edit(project: Project): void {
    this.project = Object.assign({}, (project));
  }

  editProject(): void { }

  private loggingMsg(msg: string): void {
    console.log(msg);
  };

  private getErrorMessages(error: any): string {
    const obj = JSON.parse(error.text());
    const errorCode = obj['errorCode'];
    const errorMessage = obj['errorMessage'];
    const localizedErrorMessage = obj['localizedErrorMessage'];

    let msg = 'Error Code:' + errorCode + ' ';
    msg = msg + 'Message: ' + errorMessage[0] + ' ';
    msg = msg + 'Localized Message:' + localizedErrorMessage + ' ';

    return msg;
  };
}

