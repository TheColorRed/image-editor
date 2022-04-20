import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WorkspaceComponent } from '../workspace.component';
import { ManageService, SelectedImageChanged } from './manage.service';

@Component({
  selector: 'manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss'],
  providers: [ManageService]
})
export class ManageComponent extends WorkspaceComponent implements OnInit, OnDestroy {

  imageSelected = false;
  displayMode: 'film' | 'grid' = 'film';

  private layoutSub?: Subscription;
  private collectionSub?: Subscription;

  constructor(
    private readonly manageService: ManageService
  ) {
    super();
  }

  ngOnInit(): void {
    this.layoutSub = this.manageService.$layout.subscribe(i => this.displayMode = i);

    this.collectionSub = this.manageService.$collectionEvents.subscribe(event => {
      if (event instanceof SelectedImageChanged) {
        this.imageSelected = true;
      }
    });
  }

  ngOnDestroy(): void {
    this.layoutSub?.unsubscribe();
    this.collectionSub?.unsubscribe();
  }

}
