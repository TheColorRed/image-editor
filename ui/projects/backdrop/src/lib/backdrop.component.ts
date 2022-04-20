import { Component, HostBinding, HostListener, Inject, Type } from '@angular/core';
import { RefService } from '@ui/ui/core';
import { COMPONENT_REF } from './backdrop.tokens';
// import { DialogComponent } from '../dialog.component';
// import { DialogConfig } from '../dialog.service';
// import { DIALOG_CONFIG } from '../dialog.tokens';
// import { COMPONENT_REF } from './backdrop.tokens';

export abstract class DialogEvent { }
export class DialogShouldCloseEvent extends DialogEvent { }

@Component({
  selector: 'ui-backdrop',
  templateUrl: './backdrop.component.html',
  styleUrls: ['./backdrop.component.scss']
})
export class BackdropComponent {

  component?: Type<any>;
  // wrapper: Type<DialogComponent> = DialogComponent;

  @HostBinding('class.ui-backdrop')
  backdropClass = true;

  constructor(
    @Inject(COMPONENT_REF) private readonly ref: RefService<any>
  ) { }

  @HostListener('click')
  backdropClick() {
    this.ref._backdropClicked.next(this.ref);
  }

}
