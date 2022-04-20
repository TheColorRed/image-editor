import { AfterViewInit, Component, ElementRef, Type, ViewChild } from '@angular/core';
import { faCircle, faCircleHalfStroke, faCrop, faIcicles, faLightbulb, faPalette, faSun, faTv, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import { filter, first, fromEvent, interval, merge, of, switchMap, tap } from 'rxjs';
import { AdjustService } from '../../services/adjust.service';
import { ImageProcessorService, Quadrant } from '../../services/websockets/image-processor.service';
import { WorkspaceComponent } from '../workspace.component';
import { AdjustmentComponent } from './adjustment.component';
import { BrightnessContrastComponent } from './brightness-contrast/brightness-contrast.component';
import { ColorAdjustComponent } from './color-adjust/color-adjust.component';
import { HighPassSharpenComponent } from './high-pass-sharpen/high-pass-sharpen.component';
import { WhiteBalanceComponent } from './white-balance/white-balance.component';

@Component({
  selector: 'adjust',
  templateUrl: './adjust.component.html',
  styleUrls: ['./adjust.component.scss']
})
export class AdjustComponent extends WorkspaceComponent implements AfterViewInit {

  width = 0;
  height = 0;
  maxWidth = 'inherit';
  maxHeight = 'inherit';

  autoIcon = faWandMagicSparkles;
  contrastIcon = faCircleHalfStroke;
  whiteBalanceIcon = faCircle;
  colorAdjustIcon = faPalette;
  sharpenIcon = faIcicles;
  toneMappingIcon = faTv;
  fillLightClarityIcon = faLightbulb;
  vibrancyIcon = faIcicles;
  fadeCorrectionIcon = faSun;
  cropIcon = faCrop;

  adjustment$ = this.adjust.activeAdjustment$;

  BrightnessContrastComponent?: Type<AdjustmentComponent> = BrightnessContrastComponent;
  WhiteBalanceComponent?: Type<WhiteBalanceComponent> = WhiteBalanceComponent;
  ColorAdjustComponent?: Type<AdjustmentComponent> = ColorAdjustComponent;
  HighPassSharpenComponent?: Type<AdjustmentComponent> = HighPassSharpenComponent;

  imageElement?: HTMLImageElement;

  activeImage$ = merge(fromEvent(window, 'resize'), this.adjust.activeImage$)
    .pipe(
      switchMap(i => i instanceof Event ? this.adjust.activeImage$ : of(undefined)),
      filter((i): i is FileInfo => !(i instanceof Event)),
      tap(i => this.calculateSizes(i))
    );

  image$ = this.imageProcessor.image$.pipe(
    tap(i => this.drawCanvas(i))
  );

  canvas?: HTMLCanvasElement;
  ctx?: CanvasRenderingContext2D;
  previewArea?: HTMLDivElement;
  ready = false;

  @ViewChild('canvas', { static: false, read: ElementRef })
  set viewCanvas(element: ElementRef<HTMLCanvasElement>) {
    if (!element) return;
    this.canvas = element.nativeElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
  }

  @ViewChild('previewArea', { static: false, read: ElementRef })
  set canvasPreviewArea(div: ElementRef<HTMLDivElement>) {
    if (!div) return;
    this.previewArea = div.nativeElement;
  }

  constructor(
    private readonly adjust: AdjustService,
    private readonly imageProcessor: ImageProcessorService
  ) {
    super();
  }

  ngAfterViewInit() {
    interval(100).pipe(
      // filter(() => this.imageProcessor.ready),
      switchMap(() => this.adjust.activeImage$),
      tap(i => this.calculateSizes(i)),
      filter(() => !!this.canvas && this.canvas.width > 0),
      first(),
      tap(img => this.adjust.requestChange('load', img.file)),
      // switchMap(img => timer(2000).pipe(tap(() => this.adjust.requestChange('brightness', img.file)))),
      // tap(() => this.drawCanvas()),
    ).subscribe();
  }

  editAdjustment(adj: Type<AdjustmentComponent>) {
    this.adjust.setAdjustmentActions(adj);
  }

  whiteBalance(image?: FileInfo | null) {
    console.log(image);
    if (!image) return;
    console.log('wb');
    this.adjust.requestChange('white_balance', image.file);
  }

  private drawCanvas(image: HTMLImageElement | ImageData | Quadrant) {
    if (image instanceof HTMLImageElement) {
      this.ctx?.drawImage(image, 0, 0);
    } else if (image instanceof ImageData) {
      this.ctx?.putImageData(image, 0, 0);
    } else {
      this.ctx?.drawImage(image.img, image.x, image.y);
    }
    // console.log(image);
  }

  private calculateSizes(image: FileInfo) {
    if (!this.canvas || !this.previewArea) return;
    const previewRect = this.previewArea.getBoundingClientRect();
    const pWidth = previewRect.width;
    const pHeight = previewRect.height;
    const iWidth = image.exif.ImageWidth || pWidth;
    const iHeight = image.exif.ImageHeight || pHeight;

    this.maxWidth = (iWidth > pWidth ? pWidth : iWidth) + 'px';
    this.maxHeight = (iHeight > pHeight ? pHeight : iHeight) + 'px';

    this.width = iWidth;
    this.height = iHeight;
  }
}
