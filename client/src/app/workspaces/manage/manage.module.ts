import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UIModule } from '../../ui/ui.module';
import { ManageComponent } from './manage.component';
import { BrowserComponent } from './navigator/browser/browser.component';
import { CollectionsComponent } from './navigator/collections/collections.component';
import { NavigatorComponent } from './navigator/navigator.component';
import { ActionComponent } from './organizer/action/action.component';
import { OrganizerComponent } from './organizer/organizer.component';
import { PreviewComponent } from './preview/preview.component';
import { InfoComponent } from './info/info.component';
import { TagsComponent } from './info/tags/tags.component';
import { GroupComponent } from './navigator/collections/group/group.component';
import { CollectionComponent } from './navigator/collections/collection/collection.component';
@NgModule({
  declarations: [
    ManageComponent,
    NavigatorComponent,
    CollectionsComponent,
    BrowserComponent,
    OrganizerComponent,
    PreviewComponent,
    ActionComponent,
    InfoComponent,
    TagsComponent,
    GroupComponent,
    CollectionComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    UIModule,
    ReactiveFormsModule,
    FormsModule,
    FontAwesomeModule,
    ScrollingModule
  ],
  exports: [ManageComponent]
})
export class ManageModule { }