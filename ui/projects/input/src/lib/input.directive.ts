import { Directive, HostBinding } from '@angular/core';

@Directive({
  selector: '[ui-input]'
})
export class InputDirective {

  @HostBinding('class')
  get elementClass() {
    return {
      'ui-input': true
    };
  }

}
