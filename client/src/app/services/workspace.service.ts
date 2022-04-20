import { Injectable, Type } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WorkspaceComponent } from '../workspaces/workspace.component';

@Injectable({ providedIn: 'root' })
export class WorkspaceService {

  private workspace = new BehaviorSubject<Type<WorkspaceComponent> | undefined>(undefined);
  workspace$ = this.workspace.asObservable();

  setWorkspace(type: Type<WorkspaceComponent>) {
    this.workspace.next(type);
  }
}
