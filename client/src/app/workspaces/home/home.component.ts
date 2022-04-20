import { Component, OnInit, Type } from '@angular/core';
import { WorkspaceComponent } from '../workspace.component';
import { GettingStartedComponent } from './getting-started/getting-started.component';
import { WorkspaceComponent as HomeWorkspace } from './workspace/workspace.component';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends WorkspaceComponent implements OnInit {

  selected?: Type<any>;

  gettingStarted: Type<GettingStartedComponent> = GettingStartedComponent;
  workSpace: Type<HomeWorkspace> = HomeWorkspace;
  whatsNew = false;
  learn = false;
  store = false;

  ngOnInit(): void {
    this.selected = GettingStartedComponent;
  }

  setContent(type: Type<any>) {
    this.selected = type;
  }

}
