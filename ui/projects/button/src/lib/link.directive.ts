import { Directive, HostBinding, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'a'
})
export class LinkDirective {

  @Input() follow = false;

  @HostBinding('class')
  get elementClass() {
    return {
      link: true
    };
  }

  @HostListener('click', ['$event'])
  onClick(e: MouseEvent) {
    if (this.follow === false) {
      e.preventDefault();
    }
  }
}
