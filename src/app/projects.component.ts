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

  selectedId: number;
  projects: Project[] = [];
  error: any;

  constructor(private projectsService: ProjectsService) {
    this.selectedId = 1; // mock
  }

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

  }
}
