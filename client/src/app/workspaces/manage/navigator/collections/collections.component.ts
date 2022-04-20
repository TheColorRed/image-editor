import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { debounceTime, filter, fromEvent, map, Observable, tap } from 'rxjs';
import { CollectionsChanged, ManageService } from '../../manage.service';
import { CollectionActionsService } from './collection-actions.service';
import { GroupComponent } from './group/group.component';

@Component({
  selector: 'collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss'],
  providers: [CollectionActionsService]
})
export class CollectionsComponent implements OnInit, AfterViewInit {

  @ViewChildren(GroupComponent)
  elementGroups!: QueryList<GroupComponent>;

  groups = this.manage.groups;
  faCog = faCog;
  searchStyle: SearchStyle = 'fuzzy';
  queryKeyup!: Observable<Event>;
  searchString = '';
  lastSearch = '';
  @ViewChild('q') set q(value: ElementRef<HTMLInputElement>) {
    this.queryKeyup = fromEvent(value.nativeElement, 'keyup');
  }

  constructor(
    private readonly manage: ManageService
  ) { }

  ngOnInit(): void {
    this.manage.$collectionEvents.subscribe(event => {
      if (event instanceof CollectionsChanged) {
        this.groups = this.manage.groups;
      }
    });
  }

  ngAfterViewInit() {
    this.queryKeyup.pipe(
      debounceTime(250),
      map(i => (i.target as HTMLInputElement).value),
      filter(i => i.length > 0 && this.lastSearch != i),
      tap(i => this.lastSearch = i),
      tap(q => this.manage.searchCollections(q, this.searchStyle))
    ).subscribe();
  }

  setSearchType(type: SearchStyle) {
    this.searchStyle = type;
    this.lastSearch = this.searchString;
    this.manage.searchCollections(this.searchString, this.searchStyle);
  }

  addFolderToCollection() {
    this.manage.addFolderToCollection();
  }

  // createSmartCollection() {
  //   this.dialog.open(AddSmartCollectionComponent, { height: '400px' });
  // }

  // deleteCollection(icon: Icon, collection: Collection) {
  //   this.manageService.deleteCollection(collection).subscribe(({ data }) => {
  //     if (data === true) {
  //       // this.removeCollection(collection);
  //     }
  //   });
  // }

}
