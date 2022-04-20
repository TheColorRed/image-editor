import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'ui-dialog-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})
export class DialogContentComponent {
  @Input() scrollable = true;

  @HostBinding('attr.scrollable')
  get canScroll() {
    return this.scrollable.toString();
  }
}
