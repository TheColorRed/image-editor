import { Component } from '@angular/core';
import { WorkspaceService } from './services/workspace.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  workspace$ = this.workspace.workspace$;

  constructor(
    private readonly workspace: WorkspaceService
  ) {
  }

}
