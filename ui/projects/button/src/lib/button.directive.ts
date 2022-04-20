import { Directive, HostBinding, HostListener, Inject, Input, Optional } from '@angular/core';
import { ButtonGroupDirective, BUTTON_GROUP } from './button-group.directive';

export type ButtonColor = 'primary' | 'secondary' | 'gray' | 'tertiary' | 'transparent';

@Directive({
  selector: '[ui-button-flat], [ui-button-icon], [ui-button-icon-basic]'
})
export class ButtonDirective {

  @Input() size: 'xs' | 'sm' | 'md' | 'lg' = 'md';
  @Input() value: any = '';
  @Input() color: ButtonColor = 'primary';
  @Input() round = false;
  @Input() stroked = false;
  @Input('ui-button-icon') isIcon?: string;
  @Input('ui-button-icon-basic') isBasicIcon?: string;

  @HostBinding('class')
  get elementClasses() {
    return {
      'ui-button': true,
      'ui-button-icon': typeof this.isIcon !== 'undefined' || typeof this.isBasicIcon !== 'undefined',
      'ui-button-icon-basic': typeof this.isBasicIcon !== 'undefined',
      'size-xs': this.size === 'xs',
      'size-sm': this.size === 'sm',
      'size-md': this.size === 'md',
      'size-lg': this.size === 'lg',
      'active': this.buttonGroup?.toggles && this.buttonGroup?.val === this.value,
      'ui-button-round': !!this.round,
      'ui-button-stroked': !!this.stroked
    };
  }

  @HostBinding('attr.color')
  get attributeColor() {
    if (this.buttonGroup) {
      return this.buttonGroup.color;
    }
    if (typeof this.isBasicIcon !== 'undefined') {
      return 'transparent';
    }
    return this.color;
  }

  @HostListener('click')
  onButtonClick() {
    if (this.buttonGroup) {
      this.buttonGroup.value = this.value;
    }
    this.buttonGroup?.selected.next(this.value);
  }

  constructor(
    @Optional() @Inject(BUTTON_GROUP) private readonly buttonGroup?: ButtonGroupDirective<any>
  ) { }

}
