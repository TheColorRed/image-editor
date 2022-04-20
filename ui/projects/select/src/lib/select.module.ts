import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SelectComponent } from './select.component';



@NgModule({
  declarations: [SelectComponent],
  imports: [CommonModule, OverlayModule, PortalModule, FlexLayoutModule, FontAwesomeModule],
  exports: [SelectComponent]
})
export class SelectModule { }
