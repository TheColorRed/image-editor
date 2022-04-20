import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[ui-divider]',
})
export class DividerDirective {

  @Input() color: 'gray' | 'light-gray' | 'dark-gray' = 'gray';

  @HostBinding('class')
  get elementClass() {
    return {
      'ui-divider': true,
      'ui-gray': this.color === 'gray',
      'ui-gray-light': this.color === 'light-gray',
      'ui-gray-dark': this.color === 'dark-gray'
    };
  }

}
