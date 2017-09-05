import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
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

  project: Project = new Project();
  projects: Project[] = [];
  error: any;

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
    private formBuilder: FormBuilder
  ) {
    this.registerFormControls();
    this.setDefault();
  }

  ngOnInit(): void {
    console.log('Entering ProjectsComponent.ngOnInit(): ');

    this.getProjects();

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
        this.error = 'Name is missing';
        this.nameControl.setErrors({
          name: this.error
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

            this.project = project;
            this.projectForm.setValue(this.project);
/*
            this.nameControl.setValue(this.project.name, { onlySelf: true });
*/
          }
          ).catch(error => this.error = error);
      } else { this.setDefault() };
    })
  }

  getProjects(): Promise<any> {
    console.log('Entering getProjects(): ');
    return this.projectsService.getProjects().then(
      projects => {
        this.projects = projects;
        console.log('Project count: ' + projects.length);
      }).catch(error => this.error = error);
  }

  edit(project: Project): void {
    this.project = Object.assign({}, (project));
  }

  editProject(): void { }

  setDefault(): void {
    this.project = <Project>{
      format: 'PROPERTIES', id: 0, name: 'Test project',
      personId: 10, sourceLocale: 'en_EN', type: 'UTF_8'
    };

   this.projectForm.reset(this.project);
  }

  delete(): void {
    this.projectsService
      .delete(this.project.id)
      .then(() => {
        this.loggingMsg('Deleted project: ' + this.project.name);
        this.getProjects();
        this.setDefault();
      })
      .catch(error => this.error = error);
  }

  save(): void {
    this.project = this.projectForm.value;
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
        this.loggingMsg('Updated project: ' + this.project.name);
        this.project = project;
        this.getProjects();
      }).catch( error => {
        console.log('Update error: ' +  error);
        this.error = error;
      });

  }

  create(): void {
    // prestine????
    this.project.name = this.project.name.trim();
    if (!this.project.name) { return; }

    this.projectsService.create(this.project)
      .then(project => {
        this.loggingMsg('Created project: ' + this.project.name);
        this.project = project;
        this.getProjects();
      }).catch(error => this.error = error);
  }

  private loggingMsg(msg: string): void {
    console.log(msg);
  };

}

