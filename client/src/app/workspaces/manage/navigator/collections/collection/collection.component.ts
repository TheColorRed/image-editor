import { Component, Input, OnInit } from '@angular/core';
import { CollectionGroup, CollectionSelectionChanged, ManageService } from '../../../manage.service';
import { CollectionActionsService, CollectionIcon } from '../collection-actions.service';

@Component({
  selector: 'collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent implements OnInit {

  @Input() collection!: Collection;
  @Input() group!: CollectionGroup;

  isSelected = false;

  constructor(
    private readonly manageService: ManageService,
    private readonly collections: CollectionActionsService
  ) { }

  ngOnInit(): void {
    this.manageService.$collectionEvents.subscribe(event => {
      if (event instanceof CollectionSelectionChanged) {
        this.isSelected = this.collection === event.collection;
      }
    });
  }

  selectCollection(collection: Collection) {
    this.manageService.selectCollection(collection);
  }

  performAction(event: Event, icon: CollectionIcon | undefined, collection: Collection) {
    this.collections.performAction(event, icon, collection);
  }

}
