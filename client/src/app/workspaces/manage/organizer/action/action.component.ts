import { Component, Input, OnInit } from '@angular/core';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { ManageService, SelectedImageChanged } from '../../manage.service';

@Component({
  selector: '[icon-action]',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss']
})
export class ActionComponent implements OnInit {

  @Input('icon-action') icon!: IconDefinition;
  @Input() disabled = false;

  constructor(
    private readonly manageService: ManageService
  ) { }

  ngOnInit(): void {
    this.manageService.$collectionEvents.subscribe(event => {
      if (event instanceof SelectedImageChanged) {
        this.disabled = !event.image;
      }
    });
  }

}
