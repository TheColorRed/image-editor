import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BackdropModule } from '@ui/ui/backdrop';
import { DialogActionsComponent } from './actions/actions.component';
import { CloseDirective } from './close.directive';
import { DialogContentComponent } from './content/content.component';
import { DialogErrorDirective } from './dialog-error.directive';
import { DialogComponent } from './dialog.component';
import { DialogHeaderComponent } from './header/header.component';

@NgModule({
  declarations: [
    DialogComponent,
    DialogHeaderComponent,
    DialogContentComponent,
    DialogActionsComponent,
    CloseDirective,
    DialogErrorDirective
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    FontAwesomeModule,
    DragDropModule,
    BackdropModule
  ],
  exports: [
    DialogComponent,
    DialogHeaderComponent,
    DialogContentComponent,
    DialogActionsComponent,
    CloseDirective,
    DialogErrorDirective
  ]
})
export class DialogModule { }
