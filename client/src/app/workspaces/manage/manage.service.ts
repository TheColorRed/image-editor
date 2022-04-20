import { Injectable } from '@angular/core';
import { faAdd, faCompress, faExpand, faFolder, faLightbulb, faPencil, faRefresh, faStar, faTags, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { DialogService } from '@ui/ui/dialog';
import { BehaviorSubject, debounceTime, filter, map, pipe, Subject, tap } from 'rxjs';
import { SelectFolderComponent } from '../../dialogs/select-folder/select-folder.component';
import { isFolderCollection, isTagCollection } from '../../helpers/collections';
import { WebSocketService } from '../../services/websockets/web-socket.service';
import { CollectionIcon } from './navigator/collections/collection-actions.service';

export type ManageLayout = 'grid' | 'film';

export interface CollectionGroup {
  label: string;
  type: CollectionType;
  collections: Collection[];
  icon?: CollectionIcon;
  actions?: CollectionIcon[];
  collectionActions?: CollectionIcon[];
  displayState?: 'maximized' | 'minimized' | 'hidden' | 'restored';
}

export abstract class CollectionEvent<T = Collection> {
  constructor(public readonly collection: Collection<T>) { }
}
export class CollectionActionStart { }
export class CollectionsClear { }
export class CollectionsChanged { }
export class CollectionsList<T = Collection> {
  constructor(public readonly collections: Collection<T>[]) { }
}

export class CollectionSelectionChanged extends CollectionEvent { }
export class CollectionResultsDone extends CollectionEvent { }
export class CollectionImagesRetrieved extends CollectionEvent {
  constructor(
    collection: Collection,
    public readonly images: FileInfo[]
  ) {
    super(collection);
  }
}
export class CollectionImageRetrieved extends CollectionEvent {
  constructor(
    collection: Collection,
    public readonly image: FileInfo
  ) {
    super(collection);
  }
}
export class SelectedImageChanged extends CollectionEvent {
  constructor(
    collection: Collection,
    public readonly image: FileInfo
  ) {
    super(collection);
  }
}

export class CollectionAdded<T> extends CollectionEvent<T> { }
export class CollectionDeleted<T> extends CollectionEvent<T> { }

@Injectable({ providedIn: 'root' })
export class ManageService {

  private readonly layoutSubject = new BehaviorSubject<ManageLayout>('film');
  $layout = this.layoutSubject.asObservable();

  selectedCollection?: Collection;
  groups: CollectionGroup[] = [
    {
      label: 'Smart',
      actions: [
        { icon: faExpand, action: 'maximizeCollection' },
        { icon: faCompress, action: 'restoreCollection', active: false },
        { icon: faAdd, action: 'createSmartCollection' }
      ],
      icon: { icon: faLightbulb }, type: 'smart', collections: [],
      collectionActions: [
        { icon: faPencil, /* action: 'editCollection'  */ },
        { icon: faTrashCan, action: 'deleteCollection' }
      ]
    },
    {
      label: 'Folders',
      actions: [
        { icon: faExpand, action: 'maximizeCollection' },
        { icon: faCompress, action: 'restoreCollection', active: false },
        { icon: faRefresh, action: 'refreshFolders', shouldSpin: true },
        { icon: faAdd, action: 'addFolderToCollection' }
      ],
      icon: { icon: faFolder }, type: 'folder', collections: [],
      collectionActions: [
        { icon: faRefresh, action: 'refreshCollection', shouldSpin: true },
        { icon: faTrashCan, action: 'deleteCollection' },
      ]
    },
    {
      label: 'Tags',
      actions: [
        { icon: faExpand, action: 'maximizeCollection' },
        { icon: faCompress, action: 'restoreCollection', active: false },
      ],
      icon: { icon: faTags }, type: 'tag', collections: [],
      collectionActions: [
        { icon: faTrashCan, action: 'deleteCollection' },
      ]
    },
    {
      label: 'Ratings',
      actions: [
        { icon: faExpand, action: 'maximizeCollection' },
        { icon: faCompress, action: 'restoreCollection', active: false },
      ],
      icon: { icon: faStar }, type: 'folder', collections: []
    }
  ];

  private readonly collectionEvents = new Subject<CollectionEvent | CollectionActionStart | CollectionsClear | CollectionsChanged>();
  get $collectionEvents() { return this.collectionEvents.asObservable(); }

  private activeImage = new BehaviorSubject<FileInfo | null>(null);
  activeImage$ = this.activeImage.asObservable();

  private activeCollection = new BehaviorSubject<Collection | null>(null);
  activeCollection$ = this.activeCollection.asObservable();

  constructor(
    private readonly websocket: WebSocketService,
    private readonly dialog: DialogService
  ) {
    // Get the collections on startup
    this.rebuildCollections();

    // Watch for any collection events
    this.$collectionEvents
      .subscribe(event => {
        // if (event instanceof CollectionsClear) {
        //   this.clearCollections();
        // } else
        if (event instanceof CollectionAdded) {
          this.addCollection(event.collection);
        } else if (event instanceof CollectionsList) {
          event.collections.forEach(collection => this.collectionEvents.next(new CollectionAdded(collection)));
        } else if (event instanceof CollectionDeleted) {
          this.removeCollection(event.collection);
        }
      });

    // If no collection events have been triggered within 250 milliseconds,
    // Let the application know that the collection has been changed
    this.$collectionEvents
      .pipe(
        debounceTime(250),
        filter(i => !(i instanceof CollectionsChanged))
      )
      .subscribe(() => this.collectionEvents.next(new CollectionsChanged()));

    // this.websocket.on('tags:new')
    //   .pipe(
    //     tap(this.collectionEvents.next(new CollectionAdded<TagCollection>({ label: tag, type: 'tag' }));)
    //   )
    // this.websocket.on('tags:image')
    //   .pipe(
    //     tap(i => Array.isArray(i.data) && i.data.sort((a, b) => a.localeCompare(b)))
    //   );
  }

  setLayout(layout: 'film' | 'grid') {

  }

  addFolderToCollection() {
    this.dialog.open(SelectFolderComponent, { height: '600px' });
  }

  createFolderCollection(collection: FolderCollection) {
    return this.websocket.send<FolderCollection, CollectionAddResponse>('manage/collections/create', collection)
      .pipe(
        // tap(i => Array.isArray(i.data) && this.collectionEvents.next(new CollectionsList(i.data))),
        tap(i => i.data.status === true && this.rebuildCollections()),
        map(i => i.data.message),
      );
  }

  deleteFolderCollection(collection: Collection) {
    return this.websocket.send('manage/collections/delete', collection)
      .pipe(
        tap(i => i.data === true && this.collectionEvents.next(new CollectionDeleted(collection)))
      ).subscribe();
  }

  selectCollection(collection: Collection) {
    this.selectedCollection = collection;
    this.collectionEvents.next(new CollectionActionStart());
    this.collectionEvents.next(new CollectionSelectionChanged(collection));
  }

  rebuildCollections() {
    const collections: Collection[] = [];
    this.websocket.send<void, Collection[]>('manage/collections/get').subscribe({
      next: ({ data }) => data.forEach(collection => collections.push(collection)),
      complete: () => {
        // this.collectionEvents.next(new CollectionsClear());
        this.clearCollections();
        collections.forEach(collection => this.collectionEvents.next(new CollectionAdded(collection)));
      }
    });
  }

  selectImage(collection: Collection, path: FileInfo) {
    this.websocket.send<string, FileInfo>('manage/files/image', path.file).subscribe(({ data }) => {
      this.activeImage.next(data);
      this.activeCollection.next(collection);
    });
    // this.websocket.send<string, FileInfo>('manage/files/image', path.file).subscribe(({ data }) => {
    //   this.collectionEvents.next(new SelectedImageChanged(collection, data));
    // });
  }

  getImages(collection: Collection) {
    this.websocket.send<Collection, FileInfo>('manage/files/images', collection)
      .pipe(this.rxjsImageCallback())
      .subscribe({
        next: image => this.collectionEvents.next(new CollectionImageRetrieved(collection, image)),
        complete: () => this.collectionEvents.next(new CollectionResultsDone(collection))
      });
  }

  searchCollections(query: string, searchStyle: SearchStyle) {
    this.collectionEvents.next(new CollectionActionStart());
    const collection: Collection = { type: 'search', query, info: {}, label: '' };
    this.websocket.send<SearchRequest, FileInfo>('manage/files/search', { query, style: searchStyle }, true)
      .pipe(this.rxjsImageCallback())
      .subscribe({
        next: image => this.collectionEvents.next(new CollectionImageRetrieved(collection, image)),
        complete: () => this.collectionEvents.next(new CollectionResultsDone(collection))
      });
  }

  onTags() {
    return this.websocket.on<string[]>('tags:image').pipe(
      map(i => i.data)
    );
  }

  getTags() {
    return this.websocket.send<void, { tag: string; }[]>('manage/tags/get');
  }

  addImageTag(tag: string, file: FileInfo) {
    return this.websocket.send<FileTagsModify, string[]>('manage/tags/add', { tag, file: file.file });
  }

  removeImageTag(tag: string, file: FileInfo) {
    return this.websocket.send<FileTagsModify, string[]>('manage/tags/remove', { tag, file: file.file });
  }

  private rxjsImageCallback() {
    return pipe(
      map<any, FileInfo>(
        ({ data }) => {
          return {
            ...data,
            stat: {
              ...data.stat,
              atime: new Date(data.stat.atime),
              ctime: new Date(data.stat.ctime),
              mtime: new Date(data.stat.mtime),
              birthtime: new Date(data.stat.birthtime)
            }
          } as FileInfo;
        }
      )
    );
  }

  // addCollectionItem(collection?: Collection, reset = false) {
  //   if (!collection || !collection.type) return;
  //   const group = this.groups.find(i => i.type === collection.type);
  //   if (group) {
  //     group.collections.push(collection);
  //     group.collections.sort((a, b) => a.label.localeCompare(b.label));
  //   }
  // }

  private addCollection(collection: Collection) {
    if (isFolderCollection(collection)) {
      this.groups.lookup(i => i.type === 'folder').then(group => {
        group.collections.push(collection);
      });
    } else if (isTagCollection(collection)) {
      this.groups.lookup(i => i.type === 'tag').then(group => {
        group.collections.push(collection);
        group.collections.sort((a, b) => a.label.localeCompare(b.label));
      });
    }
  }

  private removeCollection(collection: Collection) {
    if (isFolderCollection(collection)) {
      this.groups.lookup(i => i.type === 'folder').then(group => {
        group.collections = group.collections
          .filter(i => isFolderCollection(i) && i.info.path !== collection.info.path);
      });
    } else if (isTagCollection(collection)) {
      this.groups.lookup(i => i.type === 'tag').then(group => {
        group.collections = group.collections
          .filter(i => isTagCollection(i) && i.label !== collection.label);
      });
    }
  }

  private clearCollections() {
    this.groups.forEach(group => group.collections = []);
  }
}