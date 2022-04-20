import { Overlay } from '@angular/cdk/overlay';
import { AfterViewInit, Component, ContentChildren, EventEmitter, forwardRef, InjectionToken, Output, QueryList, TemplateRef, ViewChild } from '@angular/core';
import { OptionComponent } from '@ui/ui/option';
import { filter } from 'rxjs';

export const AUTO_COMPLETE = new InjectionToken<AutocompleteComponent>('AutocompleteToken');

@Component({
  selector: 'ui-autocomplete',
  exportAs: 'autocomplete',
  templateUrl: './autocomplete.component.html',
  providers: [
    Overlay,
    {
      provide: AUTO_COMPLETE,
      useExisting: forwardRef(() => AutocompleteComponent)
    }
  ]
})
export class AutocompleteComponent implements AfterViewInit {

  @ContentChildren(OptionComponent)
  items!: QueryList<OptionComponent<any>>;

  @ViewChild('autocompleteItems')
  autocompleteItems!: TemplateRef<any>;

  @Output() itemsListChanged = new EventEmitter<void>();

  ngAfterViewInit() {
    this.items.changes
      .pipe(filter(() => this.items.length > 0))
      .subscribe((i) => this.itemsListChanged.emit(i));
  }
}
