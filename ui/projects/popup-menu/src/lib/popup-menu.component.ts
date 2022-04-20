import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Component, ContentChildren, ElementRef, HostBinding, InjectionToken, QueryList, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { PopupMenuItemComponent } from './popup-menu-item.component';

export const UI_POPUP_MENU = new InjectionToken<PopupMenuComponent>('UiPopupMenuToken');

@Component({
  selector: 'ui-popup-menu',
  template: `
  <ng-template>
    <div fxLayout="column" class="ui-popup-menu-items">
      <ng-content select="[ui-popup-menu-item]"></ng-content>
    </div>
  </ng-template>
  `,
  providers: [
    Overlay,
    {
      provide: UI_POPUP_MENU,
      useExisting: PopupMenuComponent
    }
  ]
})
export class PopupMenuComponent {

  @ViewChild(TemplateRef) options!: TemplateRef<any>;
  overlayRef?: OverlayRef;
  private get positions(): ConnectedPosition[] {
    return [
      // Vertical positioning
      { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top' },
      { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom' },
      // Horizontal positioning
      { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top' },
      { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom' },
    ];
  }

  @HostBinding('class')
  get elementClasses() {
    return {
      'ui-popup-menu': true
    };
  }

  @ContentChildren(PopupMenuItemComponent)
  menuItems!: QueryList<PopupMenuItemComponent>;

  get items() {
    return this.menuItems.toArray();
  }

  get checked() {
    return this.menuItems.filter(itm => itm.toggles && itm.checked);
  }

  get unchecked() {
    return this.menuItems.filter(itm => itm.toggles && !itm.checked);
  }

  constructor(
    private readonly overlay: Overlay,
    private readonly viewRef: ViewContainerRef,
    private readonly host: ElementRef
  ) { }


  toggle() {
    typeof this.overlayRef === 'undefined' ? this.open() : this.close();
  }

  open() {
    this.overlayRef = this.overlay.create({
      disposeOnNavigation: true,
      hasBackdrop: true,
      backdropClass: 'ui-popup-menu-backdrop',
      minWidth: this.host.nativeElement.getBoundingClientRect().width + 'px',
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.host)
        .withPositions(this.positions),
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    });

    const portal = new TemplatePortal(this.options, this.viewRef);
    this.overlayRef.attach(portal);
    this.overlayRef.backdropClick().subscribe(() => this.close());
  }

  close() {
    this.overlayRef = this.overlayRef?.dispose() || undefined;
  }

  itemClicked() {
    this.close();
  }

  uncheckGroup(groupName: string) {
    this.menuItems
      .filter(itm => itm.toggleGroup === groupName)
      .forEach(itm => itm.checked = false);
  }

  checkGroupItem(groupName: string, item: PopupMenuItemComponent) {
    this.uncheckGroup(groupName);
    item.checked = true;
  }

}
