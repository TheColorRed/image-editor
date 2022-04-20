import { Component } from '@angular/core';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { DialogRef } from '../dialog-ref.service';

@Component({
  selector: 'ui-dialog-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class DialogHeaderComponent {

  faClose = faClose;

  constructor(
    private readonly dialogRef: DialogRef
  ) { }

  close() {
    this.dialogRef.close();
  }

}
