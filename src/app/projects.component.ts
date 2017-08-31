import { Component, OnInit } from '@angular/core';

import { Project } from './project';
import { PROJECTS } from './mock-projects';
import { ProjectsService } from './projects.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  projects: Project[] = [];

  constructor(private projectsService: ProjectsService) { }

  getProjects(): void {
    console.log('Entering getProjects(): ');
    this.projectsService.getProjects().then(
      projects => {
        this.projects = projects;
        console.log('Project count: ' + projects.length);
      });
  }

  ngOnInit(): void {
    console.log('Entering ProjectsComponent.ngOnInit(): ');

    this.getProjects();
/*
    this.projectsService.getProjects()
      .then(projects => this.projects = projects.slice(1, 5));
*/
  }
}
