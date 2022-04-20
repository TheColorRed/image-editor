import { Directive, HostBinding } from '@angular/core';

@Directive({
  selector: '[ui-dialog-error]'
})
export class DialogErrorDirective {
  @HostBinding('class.error')
  error = true;
}