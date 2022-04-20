import { Component, ElementRef, forwardRef, Input, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { map, tap, timer } from 'rxjs';

@Component({
  selector: 'slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SliderComponent),
      multi: true
    }
  ]
})
export class SliderComponent implements ControlValueAccessor {

  @Input() label = '';
  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  val = 0;
  inputVisible = false;

  onChange!: Function;
  onTouch!: Function;

  @ViewChild('textValue', { static: false })
  textInput?: ElementRef<HTMLInputElement>;

  get value() { return this.val; }
  set value(val: number | string) {
    this.writeValue(Number(val));
  }

  showInput() {
    this.inputVisible = true;
    if (this.inputVisible === true) {
      timer(100).pipe(
        map(() => this.textInput?.nativeElement),
        tap(input => input?.focus()),
        tap(input => input?.select())
      ).subscribe();
    }
  }

  hideInput() {
    this.inputVisible = false;
  }

  inputChanged() {
    this.value = Math.min(Math.max(this.val, this.min), this.max);
  }

  writeValue(value: number): void {
    if (typeof value !== 'undefined') {
      this.val = value;
      this.onChange && this.onChange(value);
      this.onTouch && this.onTouch(value);
    }
  }
  registerOnChange(fn: Function): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: Function): void {
    this.onTouch = fn;
  }

}
