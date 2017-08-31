import { Observable } from 'rxjs/Rx';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/if';

import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import { Env } from './environments/env';

import 'rxjs/add/operator/toPromise';

import { Project } from './Project';
import { PROJECTS } from './mock-projects';

@Injectable()
export class ProjectsService {

  private projectsUrl = 'http://localhost:8080/api/projects'; //api/projects';

  results: Project[];

  constructor(private http: Http, private env: Env) { }

  getProjects(): Promise<Project[]> {
    return this.http.get(this.projectsUrl)
      .toPromise()
      .then(response => {
        console.log('Response data: ' + response.text());
        if (this.env.isInProduction()) {
          return response.json().projects as Project[];
        } else {
          return response.json().data as Project[];
        }
      })
      .catch(this.handleError);
  }

  getProject(id: number): Promise<Project> {
    console.log('Entering ProjectsService.getProject() with id ' + id);

    const url = `${this.projectsUrl}/${id}`;
    return this.http.get(url)
      .toPromise()
      .then(response => {
        console.log('Response data: ' + response.text());
        if (this.env.isInProduction()) {
          return response.json() as Project[];
        } else {
          return response.json().data as Project[];
        }
      })
      .catch(this.handleError)
  }

  update(project: Project): Promise<Project> {
    const url = `${this.projectsUrl}/${project.id}`;
    const headers = new Headers({ 'Content-Type': 'application/json' });

    return this.http
      .put(url, JSON.stringify(project), { headers: headers })
      .toPromise()
      .then(() => project)
      .catch(this.handleError);
  }

  delete(id: number): Promise<void> {
    const url = `${this.projectsUrl}/${id}`;
    const headers = new Headers({ 'Content-Type': 'application/json' });

    return this.http.delete(url, { headers: headers })
      .toPromise()
      .then(() => null)
      .catch(this.handleError);
  }

  // http://www.concretepage.com/angular-2/angular-2-http-post-example#post
  create(project: Project): Promise<Project> {
    // const url = `${this.projectsUrl}/0`;
    const headers = new Headers({ 'Content-Type': 'application/json' });

    return this.http
      .post(this.projectsUrl,
      JSON.stringify({
        name: project.name,
        format: project.format,
        type: project.type,
        sourceLocale: project.sourceLocale
      }),
      { headers: headers })
      .toPromise()
      .then(res => res.json().data as Project)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}

