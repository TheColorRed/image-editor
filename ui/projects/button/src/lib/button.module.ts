import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonGroupDirective } from './button-group.directive';
import { ButtonDirective } from './button.directive';
import { LinkDirective } from './link.directive';



@NgModule({
  declarations: [
    ButtonDirective,
    ButtonGroupDirective,
    LinkDirective
  ],
  imports: [CommonModule],
  exports: [
    ButtonDirective,
    ButtonGroupDirective,
    LinkDirective
  ]
})
export class ButtonModule { }
