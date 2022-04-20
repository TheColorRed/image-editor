import { Component } from '@angular/core';
import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject } from 'rxjs';
import { AdjustmentComponent } from '../adjustment.component';

interface Change {
  value?: [string, number, number];
  action?: string;
}

@Component({
  selector: 'high-pass-sharpen',
  templateUrl: './high-pass-sharpen.component.html',
  styleUrls: ['./high-pass-sharpen.component.scss']
})
export class HighPassSharpenComponent extends AdjustmentComponent {

  iconReset = faArrowRotateLeft;

  radius = 10;
  strength = 70;
  blend: 'soft light' | 'hard light' | 'overlay' = 'hard light';

  requestChange = new BehaviorSubject<Change>({});
  changes$ = this.requestChange.pipe(this.doChange$());

  reset() {
    this.radius = 10;
    this.strength = 70;
    this.applyValues();
  }

  applyValues() {
    this.requestChange.next({ action: 'high_pass_sharpen', value: [this.blend, this.radius, this.strength] });
  }

}
