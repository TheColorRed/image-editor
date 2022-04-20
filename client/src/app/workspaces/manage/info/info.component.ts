import { Component, InjectionToken, OnInit } from '@angular/core';
import { WebSocketService } from '../../../services/websockets/web-socket.service';
import { ManageService, SelectedImageChanged } from '../manage.service';

export const INFO = new InjectionToken<InfoComponent>('InfoComponentToken');

@Component({
  selector: 'info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {

  image?: FileInfo;
  section: 'info' | 'training' = 'info';

  constructor(
    private readonly websocket: WebSocketService,
    private readonly manageService: ManageService
  ) { }

  ngOnInit(): void {
    this.manageService.$collectionEvents.subscribe(event => {
      if (event instanceof SelectedImageChanged) {
        this.image = event.image;
      }
    });
  }

  analyze() {
    if (this.image) {
      this.websocket.send('ai/classification/analyze', this.image?.file).subscribe(({ data }) => {
        console.table(data);
      });
    }
  }

  detect() {
    if (this.image) {
      this.websocket.send('ai/classification/objects', this.image?.file).subscribe(({ data }) => {
        console.table(data);
      });
    }
  }

}
