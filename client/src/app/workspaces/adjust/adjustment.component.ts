import { Component } from '@angular/core';
import { auditTime, filter, pipe, switchMap, tap } from 'rxjs';
import { AdjustService } from '../../services/adjust.service';

interface DoChange<T> {
  value: T,
  action: string;
}

@Component({ template: '' })
export class AdjustmentComponent {

  protected doChange$ = <T extends DoChange<T>>() => pipe(
    filter((i): i is T => typeof i !== 'undefined'),
    auditTime(250),
    switchMap(value => this.adjust.activeImage$
      .pipe(
        tap(file => {
          if (value.action && value.value) {
            this.adjust.requestChange(value.action, file.file, value.value);
          }
        })
      ))
  );

  constructor(
    protected readonly adjust: AdjustService
  ) { }
}