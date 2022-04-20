import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AdjustmentComponent } from '../adjustment.component';

interface Change {
  value?: number;
  action?: string;
}

@Component({
  selector: 'white-balance',
  templateUrl: './white-balance.component.html',
  styleUrls: ['./white-balance.component.scss']
})
export class WhiteBalanceComponent extends AdjustmentComponent {

  temperature = 0;

  requestChange = new BehaviorSubject<Change>({});
  changes$ = this.requestChange.pipe(this.doChange$());

  adjustValues() {
    this.requestChange.next({ action: 'white_balance', value: this.temperature });
  }

}
