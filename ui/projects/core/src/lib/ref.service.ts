import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export abstract class RefService<T> {
  abstract close(): void;

  readonly _backdropClicked = new Subject<T>();
}