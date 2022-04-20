import { Component, EventEmitter, Input, Output, Type } from '@angular/core';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { AdjustmentComponent } from '../adjustment.component';

@Component({
  selector: 'action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss']
})
export class ActionComponent {
  @Input() icon?: IconDefinition;
  @Input() label?: string;
  @Input() component?: Type<AdjustmentComponent>;
  @Output() click = new EventEmitter<Type<AdjustmentComponent>>();

  onClick() {
    if (this.component) {
      this.click.next(this.component);
    }
  }
}
