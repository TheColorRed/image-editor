import { Directive, EventEmitter, forwardRef, HostBinding, InjectionToken, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ButtonColor } from './button.directive';

export const BUTTON_GROUP = new InjectionToken<ButtonGroupDirective<any>>('ButtonGroupToken');

@Directive({
  selector: '[ui-button-group]',
  providers: [
    {
      provide: BUTTON_GROUP,
      useExisting: forwardRef(() => ButtonGroupDirective)
    },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ButtonGroupDirective),
      multi: true
    }
  ]
})
export class ButtonGroupDirective<T> implements ControlValueAccessor {

  @Input() size: 'xs' | 'sm' | 'md' | 'lg' = 'md';
  @Input() fill = false;
  @Input() color: ButtonColor = 'primary';
  @Input() toggles = true;
  @Output() selected = new EventEmitter<any>();

  @HostBinding('class')
  get classes() {
    return {
      'button-group': true,
      'size-xs': this.size === 'xs',
      'size-sm': this.size === 'sm',
      'size-md': this.size === 'md',
      'size-lg': this.size === 'lg',
      fill: this.fill
    };
  }

  @HostBinding('attr.color')
  get attributeColor() {
    return this.color;
  }

  onChange?: (val: T) => void;
  onTouch?: (val: T) => void;
  val?: T;

  set value(val: T) {
    if (val !== undefined && this.val !== val) {
      this.val = val;
      this.onChange && this.onChange(val);
      this.onTouch && this.onTouch(val);
    }
  }

  writeValue(val: T): void {
    this.value = val;
  }
  registerOnChange(fn: () => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

}
