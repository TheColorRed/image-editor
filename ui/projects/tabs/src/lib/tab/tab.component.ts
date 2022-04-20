import { Component, HostBinding, HostListener, Inject, Input, Type } from '@angular/core';
import { TABS, TabsComponent } from '../tabs.component';
// import { WorkspaceTabsComponent, WORKSPACE_TABS } from 'src/app/workspaces/workspace-tabs/workspace-tabs.component';

@Component({
  selector: '[tab]',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss']
})
export class TabComponent {

  @Input() label = '';
  @Input() labelComponent?: Type<any>;
  @Input() component?: Type<any>;
  @Input() set startActive(value: boolean) {
    if (value === true) {
      this.tabs.current = this.component;
    }
  }

  @HostBinding('class.ui-tab-selected')
  get classTabSelected() {
    return this.tabs.current === this.component;
  }

  @HostListener('click')
  onTabClick() {
    this.tabs.current = this.component;
  }

  constructor(
    @Inject(TABS) private readonly tabs: TabsComponent
  ) { }

}
