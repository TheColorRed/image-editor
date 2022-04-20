import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { UIModule } from '../ui/ui.module';
import { AdjustModule } from './adjust/adjust.module';
import { EditModule } from './edit/edit.module';
import { HomeModule } from './home/home.module';
import { ManageModule } from './manage/manage.module';
import { WorkspaceTabsComponent } from './workspace-tabs/workspace-tabs.component';
import { WorkspaceComponent } from './workspace.component';



@NgModule({
  declarations: [WorkspaceTabsComponent, WorkspaceComponent],
  exports: [WorkspaceTabsComponent],
  imports: [
    CommonModule, FlexLayoutModule, UIModule,
    HomeModule, EditModule, ManageModule, AdjustModule
  ]
})
export class WorkspaceTabsModule { }
