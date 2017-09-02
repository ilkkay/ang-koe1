import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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
  selectedProject: Project = new Project();
  projects: Project[] = [];
  error: any;

  constructor(private projectsService: ProjectsService,
              private router: Router) {
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

  onSelect(project: Project): void {
    this.selectedProject = project;
  }

  detail(project: Project) {
    this.selectedId = project.id;
    this.selectedProject = project;
  }

  gotoDetail(): void {
    this.router.navigate(['/projects', this.selectedProject.id]);
  }
}
