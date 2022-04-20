import { ComponentRef, Injectable } from '@angular/core';
import { BackdropComponent } from '@ui/ui/backdrop';
import { RefService } from '@ui/ui/core';
import { first, Observable, Subject } from 'rxjs';
import { DialogComponent } from './dialog.component';
import { DialogConfig } from './dialog.service';

@Injectable()
export class DialogRef extends RefService<DialogRef> {

  readonly _closed = new Subject<any>();
  readonly _opened = new Subject<DialogRef>();

  private _dialog!: ComponentRef<DialogComponent>;

  set dialog(value: ComponentRef<DialogComponent>) {
    this._dialog = value;
    value.instance.
      $dialogReady
      .pipe(first())
      .subscribe(() => this.open());
  }
  backdrop?: ComponentRef<BackdropComponent>;
  config: Partial<DialogConfig> = {};

  open() {
    this._opened.next(this);
  }

  close(data?: any) {
    this._dialog.destroy();
    this.backdrop?.destroy();
    this._closed.next(data);
  }

  opened() {
    return this._opened.asObservable().pipe(first());
  }

  closed<T = undefined>() {
    return (this._closed.asObservable() as Observable<T>).pipe(first());
  }

  backdropClicked() {
    return this._backdropClicked.asObservable();
  }
}