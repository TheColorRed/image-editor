import { Component } from '@angular/core';
import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject } from 'rxjs';
import { AdjustmentComponent } from '../adjustment.component';

interface Change {
  value?: [type: string, red: number, green: number, blue: number];
  action?: string;
}

@Component({
  selector: 'color-adjust',
  templateUrl: './color-adjust.component.html',
  styleUrls: ['./color-adjust.component.scss']
})
export class ColorAdjustComponent extends AdjustmentComponent {

  type: 'rgb' | 'hsl' = 'rgb';

  red = 0;
  green = 0;
  blue = 0;

  hue = 0;
  saturation = 0;
  lightness = 0;

  iconReset = faArrowRotateLeft;

  requestChange = new BehaviorSubject<Change>({});
  changes$ = this.requestChange.pipe(this.doChange$());

  reset() {
    if (this.type === 'rgb') {
      this.red = 0;
      this.green = 0;
      this.blue = 0;
    } else if (this.type === 'hsl') {
      this.hue = 0;
      this.saturation = 0;
      this.lightness = 0;
    }
    this.adjustColor();
  }

  adjustColor() {
    this.requestChange.next({
      action: 'color_adjust',
      value: this.type == 'rgb' ?
        [this.type, this.red, this.green, this.blue] :
        [this.type, this.hue, this.saturation, this.lightness]
    });
  }

}
