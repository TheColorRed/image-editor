import { Component } from '@angular/core';
import { faArrowRotateLeft, faCircleHalfStroke, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject } from 'rxjs';
import { AdjustmentComponent } from '../adjustment.component';

interface Change {
  value?: [number, number];
  action?: string;
}

@Component({
  selector: 'brightness-contrast',
  templateUrl: './brightness-contrast.component.html',
  styleUrls: ['./brightness-contrast.component.scss']
})
export class BrightnessContrastComponent extends AdjustmentComponent {

  brightness = 0;
  contrast = 0;

  iconReset = faArrowRotateLeft;
  iconBright = faSun;
  iconDark = faMoon;
  iconHighContrast = faCircleHalfStroke;
  iconLowContrast = faCircleHalfStroke;

  requestChange = new BehaviorSubject<Change>({});
  changes$ = this.requestChange.pipe(this.doChange$());

  applyValues() {
    this.requestChange.next({ action: 'brightness_contrast', value: [this.brightness, this.contrast] });
  }

  reset() {
    this.brightness = 0;
    this.contrast = 0;
    this.applyValues();
  }

  highBrightness() {
    this.brightness = 50;
    this.contrast = 0;
    this.applyValues();
  }

  lowBrightness() {
    this.brightness = -50;
    this.contrast = 0;
    this.applyValues();
  }

  highContrast() {
    this.brightness = 0;
    this.contrast = 60;
    this.applyValues();
  }

  lowContrast() {
    this.brightness = 0;
    this.contrast = -60;
    this.applyValues();
  }

}
