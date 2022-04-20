import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { CollectionGroup, ManageService } from '../../../manage.service';
import { CollectionActionsService, CollectionIcon } from '../collection-actions.service';

@Component({
  selector: 'group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit {

  @Input() group!: CollectionGroup;
  @Input() collection!: Collection;

  @Input() maximized = false;
  @Input() minimized = false;
  @Input() restored = false;

  @HostBinding('class.maximized')
  get isMaximized() { return this.maximized; }
  @HostBinding('class.minimized')
  get isMinimized() { return this.minimized; }
  @HostBinding('class.restored')
  get isRestored() { return this.restored; }

  constructor(
    private readonly manage: ManageService,
    private readonly collectionActions: CollectionActionsService
  ) { }

  ngOnInit(): void {
  }

  selectCollection(collection: Collection) {
    this.manage.selectCollection(collection);
  }

  performAction(event: Event, icon: CollectionIcon | undefined) {
    this.collectionActions.performAction(event, icon, this.group);
  }

}
