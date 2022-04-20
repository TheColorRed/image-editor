import { Directive, DoCheck, Input, IterableDiffer, IterableDiffers, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({ selector: '[lazyFor]' })
export class LazyForDirective implements DoCheck, OnInit {

  lazyForContainer!: HTMLElement;

  itemWidth!: number;
  itemTagName!: string;

  @Input()
  set lazyForOf(list: any[]) {
    this.list = list;

    if (list) {
      this.differ = this.iterableDiffers.find(list).create();

      if (this.initialized) {
        this.update();
      }
    }
  }

  private templateElem!: HTMLElement;

  private beforeListElem!: HTMLElement;
  private afterListElem!: HTMLElement;

  private list: any[] = [];

  private initialized = false;
  private firstUpdate = true;

  private differ!: IterableDiffer<any>;

  private lastChangeTriggeredByScroll = false;

  constructor(
    private readonly vcr: ViewContainerRef,
    private readonly tpl: TemplateRef<any>,
    private readonly iterableDiffers: IterableDiffers
  ) { }

  ngOnInit() {
    this.templateElem = this.vcr.element.nativeElement;

    this.lazyForContainer = this.templateElem.parentElement as HTMLElement;

    // Adding an event listener will trigger ngDoCheck whenever the event fires so we don't actually need to call
    // update here.
    this.lazyForContainer.addEventListener('scroll', () => {
      this.lastChangeTriggeredByScroll = true;
    });

    this.initialized = true;
  }

  ngDoCheck() {
    if (this.differ && Array.isArray(this.list)) {
      if (this.lastChangeTriggeredByScroll) {
        this.update();
        this.lastChangeTriggeredByScroll = false;
      } else {
        const changes = this.differ.diff(this.list);

        if (changes !== null) {
          this.update();
        }
      }
    }
  }

  /**
   * List update
   *
   * @returns {void}
   */
  private update(): void {

    // Can't run the first update unless there is an element in the list
    if (this.list.length === 0) {
      this.vcr.clear();
      if (!this.firstUpdate) {
        this.beforeListElem.style.width = '0';
        this.afterListElem.style.width = '0';
      }
      return;
    }

    if (this.firstUpdate) {
      this.onFirstUpdate();
    }

    const listWidth = this.lazyForContainer.clientWidth;
    const scrollLeft = this.lazyForContainer.scrollLeft;

    // The width of anything inside the container but above the lazyFor content
    const fixedHeaderWidth =
      (this.beforeListElem.getBoundingClientRect().left - this.beforeListElem.scrollLeft) -
      (this.lazyForContainer.getBoundingClientRect().left - this.lazyForContainer.scrollLeft);

    // This needs to run after the scrollLeft is retrieved.
    this.vcr.clear();

    let listStartI = Math.floor((scrollLeft - fixedHeaderWidth) / this.itemWidth);
    listStartI = this.limitToRange(listStartI, 0, this.list.length);

    let listEndI = Math.ceil((scrollLeft - fixedHeaderWidth + listWidth) / this.itemWidth);
    listEndI = this.limitToRange(listEndI, -1, this.list.length - 1);

    for (let i = listStartI; i <= listEndI; i++) {
      this.vcr.createEmbeddedView(this.tpl, {
        $implicit: this.list[i],
        index: i
      });
    }

    this.beforeListElem.style.width = `${listStartI * this.itemWidth}px`;
    this.afterListElem.style.width = `${(this.list.length - listEndI - 1) * this.itemWidth}px`;
  }

  /**
   * First update.
   *
   * @returns {void}
   */
  private onFirstUpdate(): void {

    let sampleItemElem: HTMLElement | undefined = undefined;
    if (this.itemWidth === undefined || this.itemTagName === undefined) {
      this.vcr.createEmbeddedView(this.tpl, {
        $implicit: this.list[0],
        index: 0
      });
      sampleItemElem = <HTMLElement>this.templateElem.nextSibling;
    }

    if (sampleItemElem && this.itemWidth === undefined) {
      this.itemWidth = sampleItemElem.clientWidth;
    }

    if (sampleItemElem && this.itemTagName === undefined) {
      this.itemTagName = sampleItemElem.tagName;
    }

    this.beforeListElem = document.createElement(this.itemTagName);
    this.templateElem.parentElement?.insertBefore(this.beforeListElem, this.templateElem);

    this.afterListElem = document.createElement(this.itemTagName);
    this.templateElem.parentElement?.insertBefore(this.afterListElem, this.templateElem.nextSibling);

    this.firstUpdate = false;
  }

  /**
   * Limit To Range
   *
   * @param {number} num - Element number.
   * @param {number} min - Min element number.
   * @param {number} max - Max element number.
   *
   * @returns {number}
   */
  private limitToRange(num: number, min: number, max: number) {
    return Math.max(
      Math.min(num, max),
      min
    );
  }
}