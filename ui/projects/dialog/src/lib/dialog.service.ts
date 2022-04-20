import { ApplicationRef, Inject, Injectable, Injector, Optional, Type, ViewContainerRef } from '@angular/core';
import { BackdropComponent, COMPONENT_REF } from '@ui/ui/backdrop';
import { DialogRef } from './dialog-ref.service';
import { DialogComponent } from './dialog.component';
import { DIALOG_COMP, DIALOG_CONFIG, DIALOG_DATA, DIALOG_GLOBAL_CONFIG, DIALOG_REF } from './dialog.tokens';

export interface DialogConfig<T = object> {
  width: string;
  height: string;
  disableClose: boolean;
  hasBackdrop: boolean;
  data?: T;
}

@Injectable({ providedIn: 'root' })
export class DialogService {

  readonly defaultConfig: DialogConfig = {
    width: '50%',
    height: '400px',
    disableClose: false,
    hasBackdrop: true,
    data: undefined
  };

  constructor(
    @Optional() @Inject(DIALOG_GLOBAL_CONFIG) private readonly globalConfig: DialogConfig,
    private readonly app: ApplicationRef
  ) { }

  open<T>(component: Type<T>, config?: Partial<DialogConfig>) {
    const cfg = Object.assign({}, this.defaultConfig, this.globalConfig, config);

    const viewRef = this.app.components[0]?.injector.get(ViewContainerRef);
    const dialogRef = new DialogRef();

    const backdrop = cfg.hasBackdrop && viewRef?.createComponent(BackdropComponent, {
      injector: Injector.create({
        providers: [
          { provide: COMPONENT_REF, useValue: dialogRef },
          { provide: DIALOG_CONFIG, useValue: cfg }
        ]
      })
    }) || undefined;
    const dialog = viewRef?.createComponent(DialogComponent, {
      injector: Injector.create({
        providers: [
          { provide: DIALOG_DATA, useValue: cfg.data },
          { provide: DIALOG_COMP, useValue: component },
          { provide: DIALOG_CONFIG, useValue: cfg },
          { provide: DIALOG_REF, useValue: dialogRef }
        ]
      })
    });
    dialogRef.backdrop = backdrop;
    dialogRef.dialog = dialog;
    return dialogRef;
  }
}
