import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PopupMenuItemComponent } from './popup-menu-item.component';
import { PopupMenuComponent } from './popup-menu.component';



@NgModule({
  declarations: [
    PopupMenuComponent,
    PopupMenuItemComponent
  ],
  exports: [
    PopupMenuComponent,
    PopupMenuItemComponent
  ],
  imports: [CommonModule, FlexLayoutModule, FontAwesomeModule]
})
export class PopupMenuModule { }
