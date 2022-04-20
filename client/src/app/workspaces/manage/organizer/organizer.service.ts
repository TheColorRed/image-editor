import { Injectable } from '@angular/core';
import { WebSocketService } from '../../../services/websockets/web-socket.service';
import { ManageService, SelectedImageChanged } from '../manage.service';

@Injectable()
export class OrganizerService {

  private path = '';

  constructor(
    private readonly socketService: WebSocketService,
    private readonly manageService: ManageService
  ) {
    this.manageService.$collectionEvents.subscribe(event => {
      if (event instanceof SelectedImageChanged) {
        this.path = event.image.file;
      }
    });
  }

  rotate(direction: 'rotate-left' | 'rotate-right') {
    this.socketService.send('edit/actions', {
      path: this.path,
      actions: [{ action: 'rotate', args: [direction] }]
    }).subscribe(() => {
      console.log('done');
    });
  }

}
