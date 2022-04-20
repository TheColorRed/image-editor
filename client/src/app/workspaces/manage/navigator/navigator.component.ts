import { Component, OnInit, Type } from '@angular/core';
import { BrowserComponent } from './browser/browser.component';
import { CollectionsComponent } from './collections/collections.component';

@Component({
  selector: 'navigator',
  templateUrl: './navigator.component.html',
  styleUrls: ['./navigator.component.scss']
})
export class NavigatorComponent implements OnInit {

  browsing: Type<CollectionsComponent> | Type<BrowserComponent> = CollectionsComponent;
  readonly collections: Type<CollectionsComponent> = CollectionsComponent;
  readonly computer: Type<BrowserComponent> = BrowserComponent;

  constructor(
  ) { }

  ngOnInit(): void {
  }

}
