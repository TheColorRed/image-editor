import { Component, EventEmitter, forwardRef, InjectionToken, Input, Output, Type } from '@angular/core';

export const TABS = new InjectionToken<TabsComponent>('TabsToken');

@Component({
  selector: 'tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  providers: [
    {
      provide: TABS,
      useExisting: forwardRef(() => TabsComponent)
    }
  ]
})
export class TabsComponent {

  @Output() tabChanged = new EventEmitter<Type<any>>();

  private _current?: Type<any>;

  @Input() set current(value: undefined | null | Type<any>) {
    this._current = value ?? undefined;
    value && this.tabChanged.next(value);
  }

  get current() {
    return this._current;
  }
}
