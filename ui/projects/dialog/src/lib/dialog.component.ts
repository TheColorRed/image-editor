import { Component, forwardRef, Inject, OnInit, Type } from '@angular/core';
import { Subject, timer } from 'rxjs';
import { DialogRef } from './dialog-ref.service';
import { DialogConfig } from './dialog.service';
import { DIALOG, DIALOG_COMP, DIALOG_CONFIG, DIALOG_REF } from './dialog.tokens';


@Component({
  selector: 'ui-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  providers: [
    {
      provide: DIALOG,
      useExisting: forwardRef(() => DialogComponent)
    },
    {
      provide: DialogRef,
      useFactory: (dialogComp: DialogComponent) => {
        return dialogComp.dialogRef;
      },
      deps: [forwardRef(() => DialogComponent)]
    }
  ]
})
export class DialogComponent implements OnInit {

  component?: Type<any>;

  private dialogReady = new Subject<void>();
  $dialogReady = this.dialogReady.asObservable();

  constructor(
    @Inject(DIALOG_COMP) private readonly userComponent: Type<any>,
    @Inject(DIALOG_CONFIG) readonly config: DialogConfig,
    @Inject(DIALOG_REF) readonly dialogRef: DialogRef
  ) { }

  ngOnInit(): void {
    this.component = this.userComponent;
    timer(100).subscribe(() => this.dialogReady.next());

    this.dialogRef._backdropClicked.subscribe(() => {
      if (this.config.disableClose === false) {
        this.dialogRef.close();
      }
    });
  }

}
