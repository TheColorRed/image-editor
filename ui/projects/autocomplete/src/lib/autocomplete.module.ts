import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AutocompleteComponent } from './autocomplete.component';
import { AutocompleteDirective } from './autocomplete.directive';



@NgModule({
  declarations: [
    AutocompleteComponent,
    AutocompleteDirective
  ],
  imports: [
    CommonModule, FlexLayoutModule, OverlayModule
  ],
  exports: [
    AutocompleteComponent,
    AutocompleteDirective
  ]
})
export class AutocompleteModule { }
