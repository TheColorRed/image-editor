import { Component, forwardRef, InjectionToken, OnInit, Type, ViewChild } from '@angular/core';
import { TabsComponent } from '@ui/ui/tabs';
import { AdjustService } from '../../services/adjust.service';
import { WorkspaceService } from '../../services/workspace.service';
import { AdjustComponent } from '../adjust/adjust.component';
import { EditComponent } from '../edit/edit.component';
import { HomeComponent } from '../home/home.component';
import { HomeIconComponent } from '../home/icon/icon.component';
import { ManageComponent } from '../manage/manage.component';
import { WorkspaceComponent } from '../workspace.component';

export const WORKSPACE_TABS = new InjectionToken<WorkspaceTabsComponent>('WorkspaceTabsToken');

@Component({
  selector: 'workspace-tabs',
  templateUrl: './workspace-tabs.component.html',
  styleUrls: ['./workspace-tabs.component.scss'],
  providers: [
    {
      provide: WORKSPACE_TABS,
      useExisting: forwardRef(() => WorkspaceTabsComponent)
    }
  ]
})
export class WorkspaceTabsComponent implements OnInit {

  homeLabel: Type<HomeIconComponent> = HomeIconComponent;

  home: Type<HomeComponent> = HomeComponent;
  adjustWorkspace: Type<AdjustComponent> = AdjustComponent;
  editWorkspace: Type<EditComponent> = EditComponent;
  manageWorkspace: Type<ManageComponent> = ManageComponent;

  current$ = this.workspace.workspace$;

  @ViewChild(TabsComponent)
  private readonly tabs!: TabsComponent;

  constructor(
    private readonly workspace: WorkspaceService,
    private readonly adjust: AdjustService
  ) { }

  ngOnInit() {
    this.workspace.setWorkspace(AdjustComponent);
    const emu = require('../../temp/emu.json') as FileInfo;
    this.adjust.setImage(emu);
  }

  setWorkspace(type: Type<WorkspaceComponent>) {
    if (!this.tabs || typeof type === 'undefined') return;
    // this.tabs.current = type;
    this.workspace.setWorkspace(type);
  }

};
