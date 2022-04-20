import { Directive, HostListener } from '@angular/core';
import { DialogRef } from './dialog-ref.service';

@Directive({
  selector: '[ui-dialog-close]'
})
export class CloseDirective {

  constructor(
    private readonly dialogRef: DialogRef
  ) { }

  @HostListener('click')
  onClose() {
    this.dialogRef.close();
  }

}
