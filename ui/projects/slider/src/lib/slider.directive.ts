import { Directive, DoCheck, ElementRef, HostBinding, HostListener, OnInit } from '@angular/core';

@Directive({
  selector: '[ui-slider]'
})
export class SliderDirective implements OnInit, DoCheck {

  constructor(
    private readonly ref: ElementRef<HTMLInputElement>
  ) { }

  @HostBinding('class')
  get elementClass() {
    return {
      'ui-slider': true
    };
  }

  @HostBinding('type')
  elementType = 'range';

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    this.calculateGradient(event.target as HTMLInputElement);
  }

  @HostListener('mousedown')
  onMousedown() {
    this.ref.nativeElement.classList.add('grabbing');
  }

  @HostListener('mousewheel', ['$event'])
  onMouseWheel(event: WheelEvent) {
    const curr = Number(this.ref.nativeElement.value);
    const step = Number(this.ref.nativeElement.step);
    const multiplier = event.shiftKey && event.altKey ? 100 :
      event.shiftKey ? 10 :
        event.altKey ? 5 : 1;

    const newVal = event.deltaY < 0 ? curr + (step * multiplier) : curr - (step * multiplier);
    this.ref.nativeElement.value = newVal.toString();
    this.ref.nativeElement.dispatchEvent(new Event('input'));
  }

  @HostListener('mouseup')
  onMouseup() {
    this.ref.nativeElement.classList.remove('grabbing');
  }

  ngOnInit(): void {
    this.calculateGradient(this.ref.nativeElement);
  }

  ngDoCheck() {
    this.calculateGradient(this.ref.nativeElement);
  }

  private calculateGradient(el: HTMLInputElement) {
    const val = Number(el.value);
    const value = (val - Number(el.min)) / (Number(el.max) - Number(el.min)) * 100;
    const ref = this.ref.nativeElement;
    const color = 'var(--color-secondary)';
    ref.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${value}%, #fff ${value}%, white 100%)`;

  }

}
