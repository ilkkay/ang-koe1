import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common';

import 'rxjs/add/operator/switchMap';

import { Project } from './project';
import { ProjectsService } from './projects.service';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css']
})
export class ProjectDetailComponent implements OnInit {


  @Input() project: Project;

  constructor(
    private projectsService: ProjectsService,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit() {

    this.loggingMsg('Entering ngOnInit()');

    this.route.paramMap
      .switchMap((params: ParamMap) =>
        this.projectsService.getProject(+params.get('id')))
      .subscribe(project => this.project = project);
  }

  setNew(): void {
    this.project = {
      format: 'PROPERTIES', id: 0, name: '',
      personId: 10, sourceLocale: 'en_EN', type: 'UTF_8'
    };

  }

  delete(): void {
    this.projectsService
      .delete(this.project.id)
      .then(() => this.loggingMsg('Deleted project: ' + this.project.name));
  }

  save(): void {
    if (this.project.id === 0) {
      this.create();
    } else {
      this.update();
    }
  }

  update(): void {
    this.projectsService.update(this.project)
      .then(() => this.loggingMsg('Updated project: ' + this.project.name));
  }

  create(): void {
    this.project.name = this.project.name.trim();
    if (!this.project.name) { return; }

    this.projectsService.create(this.project)
      .then(() => this.loggingMsg('Created project: ' + this.project.name));
  }

  private loggingMsg(msg: string): void {
    console.log(msg);
  };

}
