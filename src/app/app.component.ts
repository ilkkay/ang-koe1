import { OnInit, Component } from '@angular/core';

import { Project } from './project';
import { PROJECTS } from './mock-projects';
import { ProjectsService } from './projects.service';

@Component({
  selector: 'my-app',
  templateUrl: 'app.component.html',
  providers: [ProjectsService]
})

export class AppComponent {
  title = 'Translate IT 2';

}

