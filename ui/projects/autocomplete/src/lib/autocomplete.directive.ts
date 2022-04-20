import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { AfterContentInit, Directive, ElementRef, EventEmitter, HostListener, Input, Output, ViewContainerRef } from '@angular/core';
import { Observable, Subject, timer } from 'rxjs';
import { AutocompleteComponent } from './autocomplete.component';

@Directive({
  selector: '[autocomplete]',
})
export class AutocompleteDirective implements AfterContentInit {

  @Input() autocomplete!: AutocompleteComponent;
  @Output() ngModelChange = new EventEmitter();

  @HostListener('focus')
  focusInput() {
    this.show();
  }

  @HostListener('blur')
  blurInput() {
    timer(100).subscribe(() => {
      this.hide();
    });
  }

  @HostListener('keyup', ['$event'])
  typeIntoBox(event: KeyboardEvent) {
    const text = (event.target as any).value;
    this.search(text);
  }

  overlayRef?: OverlayRef;
  private options = new Subject<Observable<any>[]>();
  private get positions(): ConnectedPosition[] {
    return [
      // Vertical positioning
      { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
      { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
      // Horizontal positioning
      { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
      { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
    ];
  }

  constructor(
    public readonly elementRef: ElementRef,
    private readonly overlay: Overlay,
    private readonly viewRef: ViewContainerRef,
    private readonly host: ElementRef
  ) { }

  ngAfterContentInit() {
    this.autocomplete.itemsListChanged.subscribe(changes => {
      this.autocomplete.items.forEach(item => {
        item.selected.subscribe(i => {
          // this.elementRef.nativeElement.value = i;
          this.ngModelChange.emit(i);
        });
      });
    });

  }

  show() {
    this.overlayRef = this.overlay.create({
      disposeOnNavigation: true,
      hasBackdrop: false,
      backdropClass: 'ui-autocomplete-backdrop',
      minWidth: this.host.nativeElement.getBoundingClientRect().width + 'px',
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.host)
        .withPositions(this.positions),
      scrollStrategy: this.overlay.scrollStrategies.reposition()
    });

    const portal = new TemplatePortal(this.autocomplete.autocompleteItems, this.viewRef);
    this.overlayRef.attach(portal);

    // const options = this.autocomplete.items.map(item => item.selected);
    // this.options.next(options);
    // race(...options)
    //   .subscribe(v => console.log(v));
  }

  hide() {
    this.overlayRef?.dispose();
    // this.options.forEach(opt => opt.unsubscribe());
  }

  search(query: string) {
    const str = query.split('').join('.+?') + '.+?';
    const regExp = new RegExp(str, 'i');
    const items = this.autocomplete.items.filter(i => regExp.test(i.value));

  }
}