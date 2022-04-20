import { Injectable, OnInit } from '@angular/core';
import { Icon } from '@fortawesome/fontawesome-svg-core';
import { faCompress, faExpand, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { DialogService } from '@ui/ui/dialog';
import { Subject } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { AddSmartCollectionComponent } from '../../../../dialogs/add-smart-collection/add-smart-collection.component';
import { SelectFolderComponent } from '../../../../dialogs/select-folder/select-folder.component';
import { WebSocketService } from '../../../../services/websockets/web-socket.service';
import { CollectionActionStart, CollectionAdded, CollectionEvent, CollectionGroup, CollectionsClear, ManageService } from '../../manage.service';

export type IconAction = keyof Exclude<CollectionActionsService, 'performAction'>;

export interface CollectionIcon {
  icon: IconDefinition;
  active?: boolean;
  action?: IconAction;
  spin?: boolean;
  shouldSpin?: boolean;
}

/**
 * Performs collection actions.
 */
@Injectable()
export class CollectionActionsService implements OnInit {

  private readonly events = new Subject<CollectionEvent | CollectionActionStart | CollectionsClear>();
  readonly $events = this.events.asObservable();

  constructor(
    private readonly websocket: WebSocketService,
    private readonly manage: ManageService,
    private readonly dialog: DialogService
  ) { }

  ngOnInit() {
    this.manage.$collectionEvents.subscribe();
  }

  performAction(this: any, event: Event, icon: CollectionIcon | undefined, ...vars: any[]) {
    event.stopPropagation();
    if (!icon) return;
    if (icon.action && typeof this[icon.action] === 'function') {
      if (icon.shouldSpin) icon.spin = true;
      this[icon.action](icon, ...vars);
    }
  }

  deleteCollection(icon: Icon, collection: Collection) {
    this.manage.deleteFolderCollection(collection);
  }

  addFolderToCollection() {
    const addFolderRef = this.dialog.open(SelectFolderComponent, { height: '600px' });
    // addFolderRef.closed<Collection>().subscribe(result => {
    //   this.manage.addCollectionItem(result);
    // });
  }

  createSmartCollection() {
    this.dialog.open(AddSmartCollectionComponent, { height: '400px' });
  }

  refreshCollection(icon: CollectionIcon, collection: Collection<FolderCollection>) {
    this.refreshCollections(collection).subscribe({
      complete: () => {
        icon.spin = false;
      }
    });
  }

  refreshFolders(icon: CollectionIcon) {
    this.websocket.send('manage/collections/refresh', 'all').subscribe({
      complete: () => {
        icon.spin = false;
      }
    });
  }

  maximizeCollection(icon: CollectionIcon, group: CollectionGroup) {
    this.manage.groups.forEach(group => group.displayState = 'hidden');
    group.displayState = 'maximized';

    // Get the icon action index
    const expandIdx = group.actions?.findIndex(i => i.icon === faExpand) ?? -1;
    const collapseIdx = group.actions?.findIndex(i => i.icon === faCompress) ?? -1;

    // Set the proper icon to active/inactive
    if (group.actions && expandIdx > -1 && collapseIdx > -1) {
      group.actions[expandIdx].active = false;
      group.actions[collapseIdx].active = true;
    }
  }

  minimizeCollection(icon: CollectionIcon, group: CollectionGroup) {
  }

  restoreCollection(icon: CollectionIcon, group: CollectionGroup) {
    this.manage.groups.forEach(group => group.displayState = 'restored');

    // Get the icon action index
    const expandIdx = group.actions?.findIndex(i => i.icon === faExpand) ?? -1;
    const collapseIdx = group.actions?.findIndex(i => i.icon === faCompress) ?? -1;

    // Set the proper icon to active/inactive
    if (group.actions && expandIdx > -1 && collapseIdx > -1) {
      group.actions[expandIdx].active = true;
      group.actions[collapseIdx].active = false;
    }
  }

  refreshCollections(collection: Collection<FolderCollection>) {
    return this.websocket.send('manage/collections/refresh', collection.info.path)
      .pipe(
        tap(i => {
          if (i.key === 'tags:new' && typeof i.data === 'string') {
            this.events.next(new CollectionAdded<TagCollection>({ label: i.data, type: 'tag' }));
          }
        }),
        filter(i => i.key !== 'tags:new')
      );
  }
}