import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common';

import 'rxjs/add/operator/switchMap';

import { Project } from './project';
import { ProjectsService } from './projects.service';

@Component({
  selector: 'app-projectsmain',
  templateUrl: './projectsmain.component.html',
  styleUrls: ['./projectsmain.component.css']
})

export class ProjectsmainComponent implements OnInit {

  project: Project = new Project();
  projects: Project[] = [];
  error: any;

  constructor(
    private projectsService: ProjectsService,
    private route: ActivatedRoute
  ) { this.setNew(); }

  getProjects(): Promise<any> {
    console.log('Entering getProjects(): ');
    return this.projectsService.getProjects().then(
      projects => {
        this.projects = projects;
        console.log('Project count: ' + projects.length);
      }).catch(error => this.error = error);
  }

  ngOnInit(): void {
    console.log('Entering ProjectsComponent.ngOnInit(): ');

    this.getProjects();

    this.route.paramMap
      .switchMap((params: ParamMap) =>
        this.projectsService.getProject(+params.get('id')))
      .subscribe(project => this.project = project);
  }

  edit(project: Project): void {
    this.project = Object.assign({}, (project));
  }

  editProject(): void { }

  setNew(): void {
    this.project = <Project>{
      format: 'PROPERTIES', id: 0, name: '',
      personId: 10, sourceLocale: 'en_EN', type: 'UTF_8'
    };

  }

  delete(): void {
    this.projectsService
      .delete(this.project.id)
      .then(() => {
        this.loggingMsg('Deleted project: ' + this.project.name);
        this.getProjects();
        this.setNew();
      });
  }

  save(): void {
    if (this.project.id === 0) {
      this.create();
    } else {
      this.update();
    }
    this.getProjects();
  }

  update(): void {
    this.projectsService.update(this.project)
      .then(() => this.loggingMsg('Updated project: ' + this.project.name));
  }

  create(): void {
    this.project.name = this.project.name.trim();
    if (!this.project.name) { return; }

    this.projectsService.create(this.project)
      .then(project => {
        this.loggingMsg('Created project: ' + this.project.name);
        this.project = project;
      });
  }

  private loggingMsg(msg: string): void {
    console.log(msg);
  };

}

