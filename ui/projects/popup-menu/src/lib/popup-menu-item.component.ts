import { Component, EventEmitter, HostBinding, HostListener, Inject, Input, Output } from '@angular/core';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { PopupMenuComponent, UI_POPUP_MENU } from './popup-menu.component';

@Component({
  selector: '[ui-popup-menu-item]',
  template: `
    <div fxLayout="row" fxLayoutAlign="flex-start center" fxLayoutGap="5px">
      <div fxFlex="20px">
        <fa-icon *ngIf="(toggles || toggleGroup) && checked" [icon]="faCheck" [fixedWidth]="true"></fa-icon>
      </div>
      <div class="ui-popup-menu-item-content">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class PopupMenuItemComponent {

  @Input() toggles = false;
  @Input() toggleGroup?: string;
  @Input() checked = false;
  @Input() value = '';
  @Output() toggled = new EventEmitter<boolean>();
  faCheck = faCheck;

  @HostBinding('class')
  get elementClasses() {
    return {
      'ui-popup-menu-item': true
    };
  }

  @HostListener('click')
  itemClick() {
    this.toggle();
    this.popupMenu.itemClicked();
  }

  constructor(
    @Inject(UI_POPUP_MENU) private readonly popupMenu: PopupMenuComponent
  ) { }

  toggle() {
    if (typeof this.toggleGroup === 'string') {
      this.popupMenu.checkGroupItem(this.toggleGroup, this);
      this.toggled.next(this.checked);
    } else if (this.toggles) {
      this.checked = !this.checked;
      this.toggled.next(this.checked);
    }
  }

}
