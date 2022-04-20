import { CdkFixedSizeVirtualScroll } from '@angular/cdk/scrolling';
import { AfterViewInit, Component, ElementRef, forwardRef, HostBinding, HostListener, InjectionToken, OnInit, ViewChild } from '@angular/core';
import { faArrowRotateLeft, faArrowRotateRight, faImage, faSliders } from '@fortawesome/free-solid-svg-icons';
import { fromEvent, Observable, tap } from 'rxjs';
import { AdjustService } from '../../../services/adjust.service';
import { SearchService } from '../../../services/search.service';
import { WorkspaceService } from '../../../services/workspace.service';
import { AdjustComponent } from '../../adjust/adjust.component';
import { CollectionActionStart, CollectionImageRetrieved, CollectionResultsDone, CollectionSelectionChanged, ManageLayout, ManageService } from '../manage.service';
import { OrganizerService } from './organizer.service';

export const ORGANIZER = new InjectionToken<OrganizerComponent>('OrganizerComponentToken');

@Component({
  selector: 'organizer',
  templateUrl: './organizer.component.html',
  styleUrls: ['./organizer.component.scss'],
  providers: [
    OrganizerService,
    {
      provide: ORGANIZER,
      useExisting: forwardRef(() => OrganizerComponent)
    }
  ]
})
export class OrganizerComponent implements OnInit, AfterViewInit {

  filter = '';
  images: FileInfo[] = [];
  displayImages: FileInfo[] | any[] = [];
  collection?: Collection;
  selectedImage?: FileInfo;

  rotateLeft = faArrowRotateLeft;
  rotateRight = faArrowRotateRight;
  edit = faSliders;
  picture = faImage;

  scrollDirection: 'vertical' | 'horizontal' = 'horizontal';

  organizerEl!: HTMLElement;
  private _layout!: ManageLayout;

  @ViewChild('scrollWrapper')
  virtualScroll!: CdkFixedSizeVirtualScroll;

  @ViewChild('scrollWrapper', { read: ElementRef })
  set cdkElement(value: ElementRef) {
    this.organizerEl = value.nativeElement;//.querySelector('.cdk-virtual-scroll-content-wrapper');
  }

  $filterKeyup!: Observable<Event>;
  @ViewChild('filterInput') set filterInput(value: ElementRef<HTMLInputElement>) {
    this.$filterKeyup = fromEvent(value.nativeElement, 'keyup');
  }

  @HostBinding('attr.layout')
  get layout() {
    return this._layout;
  }

  constructor(
    private readonly manage: ManageService,
    private readonly search: SearchService,
    private readonly organizer: OrganizerService,
    private readonly workspace: WorkspaceService,
    private readonly adjust: AdjustService
  ) { }

  @HostListener('wheel', ['$event'])
  wheelScroll(evt: WheelEvent) {
    if (this.scrollDirection === 'horizontal') {
      evt.preventDefault();
      this.organizerEl.scrollLeft += evt.deltaY;
    }
  }

  ngOnInit() {
    const images = { count: 0 };
    this.manage.$layout
      .pipe(
        tap(i => { if (i === 'film') this.scrollDirection = 'horizontal'; }),
        tap(i => { if (i === 'grid') this.scrollDirection = 'vertical'; }),
        tap(i => this._layout = i)
      )
      .subscribe();
    this.manage.$collectionEvents.subscribe(event => {
      if (event instanceof CollectionActionStart) {
        this.images = [];
      } else if (event instanceof CollectionSelectionChanged) {
        this.manage.getImages(event.collection);
        this.collection = event.collection;
        this.resetOrganizer();
      } else if (event instanceof CollectionImageRetrieved) {
        this.images.push(event.image);
        this.setImages(images);
      } else if (event instanceof CollectionResultsDone) {
        this.setImages(images, true);
      }
    });
  }

  setImages(images: { count: number; }, done = false) {
    images.count++;
    if (images.count === 50 || done) {
      if (this.layout === 'film') {
        this.displayImages = [...this.images];
        images.count = 0;
      }
      else if (this.layout === 'grid') {
        const chunkSize = Math.floor(this.organizerEl.clientWidth / 200);
        const chunks = [];
        for (let i = 0; i < this.images.length; i += chunkSize) {
          const chunk = this.images.slice(i, i + chunkSize);
          chunks.push(chunk);
        }
        this.displayImages = [...chunks];
        images.count = 0;
      }
    }
  }

  ngAfterViewInit() {
    // this.$filterKeyup
    //   .pipe(
    //     debounceTime(250),
    //     map(evt => (evt.target as HTMLInputElement).value),
    //     tap(query => { if (query.length === 0) this.displayImages = this.images; }),
    //     filter(query => query.length > 0),
    //     tap(() => this.resetScroll()),
    //     tap(query => this.displayImages = this.searchService.fuzzySearch<FileInfo>(query, this.images, ['name']))
    //   )
    //   .subscribe();
  }

  previewImage(image: FileInfo) {
    if (!this.collection) return;
    this.selectedImage = image;
    this.manage.selectImage(this.collection, image);
    console.log(image);
  }

  action(value: 'rotate-left' | 'rotate-right') {
    if (value === 'rotate-left' || value === 'rotate-right') {
      this.organizer.rotate(value);
    }
  }

  adjustImage() {
    if (!this.selectedImage) return;
    this.adjust.setImage(this.selectedImage);
    this.workspace.setWorkspace(AdjustComponent);
  }

  private resetScroll() {
    this.organizerEl.scrollLeft = 0;
  }

  private resetOrganizer() {
    this.resetScroll();
    this.filter = '';
  }

}
