import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PipesModule } from '../../pipes/pipes.module';
import { UIModule } from '../../ui/ui.module';
import { GettingStartedComponent } from './getting-started/getting-started.component';
import { HomeComponent } from './home.component';
import { HomeIconComponent } from './icon/icon.component';
import { WorkspaceComponent } from './workspace/workspace.component';

@NgModule({
  declarations: [HomeComponent, HomeIconComponent, GettingStartedComponent, WorkspaceComponent],
  exports: [HomeComponent, HomeIconComponent],
  imports: [CommonModule, FlexLayoutModule, FontAwesomeModule, UIModule, PipesModule]
})
export class HomeModule { }