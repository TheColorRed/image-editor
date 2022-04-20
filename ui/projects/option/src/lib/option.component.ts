import { Component, ElementRef, EventEmitter, HostListener, Inject, Input, OnDestroy, Optional, Output, ViewChild } from '@angular/core';
import { SelectComponent, SELECT_VALUE } from '@ui/ui/select';

@Component({
  selector: 'ui-option',
  template: `
    <div class="ui-option" #content><ng-content></ng-content></div>
  `
})
export class OptionComponent<T> implements OnDestroy {

  @Input() value?: T;
  @Output() selected = new EventEmitter<T | undefined>();
  isSelected = false;

  @ViewChild('content', { static: false })
  content!: ElementRef<HTMLDivElement>;

  constructor(
    @Optional() @Inject(SELECT_VALUE) private readonly selectValue?: SelectComponent<any>
  ) { }

  ngDoCheck(): void {
    this.isSelected = this.selectValue?._value === this.value;
    if (this.isSelected) {
      this.selectValue?.setDisplayText(this.content.nativeElement.textContent || '');
      console.log(this.isSelected, this.value, this.selectValue?._value);
    }
  }

  ngOnDestroy() {
    this.selected.unsubscribe();
  }

  @HostListener('click')
  selectOptionValue() {
    this.selectValue?.setValue(this.value);
    this.selectValue?.setDisplayText(this.content.nativeElement.textContent || '');
    this.selected.emit(this.value);
  }
}
