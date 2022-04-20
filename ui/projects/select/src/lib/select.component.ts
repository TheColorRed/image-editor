import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Component, ElementRef, forwardRef, HostBinding, HostListener, InjectionToken, Input, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';

export const SELECT_VALUE = new InjectionToken('SelectValueToken');

@Component({
  selector: 'ui-select',
  templateUrl: './select.component.html',
  providers: [
    Overlay,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    },
    {
      provide: SELECT_VALUE,
      useExisting: forwardRef(() => SelectComponent)
    }
  ]
})
export class SelectComponent<T> implements ControlValueAccessor {

  faArrow = faAngleDown;
  @Input() placeholder = '';
  @Input() width: string = '100%';
  overlayRef?: OverlayRef;
  displayText = '';

  private get positions(): ConnectedPosition[] {
    return [
      // Vertical positioning
      { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
      { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
      // Horizontal positioning
      { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
      { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
    ];
  }

  @ViewChild('options') options!: TemplateRef<any>;
  // @ContentChildren(OptionComponent) optionC!: QueryList<any>;
  @HostBinding('class')
  get elementClasses() {
    return {
      'ui-select': true
    };
  }

  @HostListener('click')
  openDropdown() {
    this.overlayRef = this.overlay.create({
      disposeOnNavigation: true,
      hasBackdrop: true,
      backdropClass: 'ui-select-backdrop',
      minWidth: this.host.nativeElement.getBoundingClientRect().width + 'px',
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.host)
        .withPositions(this.positions),
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    });

    const portal = new TemplatePortal(this.options, this.viewRef);
    this.overlayRef.attach(portal);
    this.overlayRef.backdropClick().subscribe(() => this.overlayRef?.dispose());
  }

  constructor(
    private readonly overlay: Overlay,
    private readonly viewRef: ViewContainerRef,
    private readonly host: ElementRef
  ) { }

  onChange?: (val: T) => void;
  onTouch?: (val: T) => void;
  _value!: T;

  set value(val: T) {
    if (val !== undefined && this._value !== val) {
      this._value = val;
      this.onChange && this.onChange(val);
      this.onTouch && this.onTouch(val);
    }
  }

  writeValue(val: T) {
    this.value = val;
  }

  registerOnChange(fn: () => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouch = fn;
  }

  setValue(val: T) {
    this.value = val;
    this.overlayRef?.dispose();
  }

  setDisplayText(displayText: string) {
    this.displayText = displayText;
  }
}
