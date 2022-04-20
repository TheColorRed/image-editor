import { Component, DoCheck, ElementRef, HostListener, ViewChild } from '@angular/core';
import { filter, switchMap, tap } from 'rxjs';
import { ManageService } from '../manage.service';

@Component({
  selector: 'preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements DoCheck {

  image?: FileInfo;
  collection?: Collection;
  width = 0;
  height = 0;
  maxWidth = 'inherit';
  maxHeight = 'inherit';

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  @ViewChild('canvas', { static: false })
  set canvasElement(value: ElementRef<HTMLCanvasElement>) {
    if (!value) return;
    this.canvas = value.nativeElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
  }

  @HostListener('window:resize')
  onResize() {
    this.calculateMaxWidth();
  }

  image$ = this.manageService.activeImage$.pipe(
    filter((img): img is FileInfo => !!img),
    tap(img => this.image = img),
    switchMap(itm => this.manageService.activeCollection$.pipe(
      filter((collection): collection is Collection => !!collection),
      tap(collection => this.collection = collection),
      tap(() => {
        const htmlImage = new Image();
        htmlImage.src = itm.url.full;
        htmlImage.addEventListener('load', () => {
          this.drawObjects(htmlImage);
        });
      })
    ))
  );

  constructor(
    private readonly manageService: ManageService,
    private readonly elementRef: ElementRef<HTMLElement>
  ) { }

  ngDoCheck() {
    this.calculateMaxWidth();
  }

  private drawObjects(img: HTMLImageElement) {
    if (!this.image) return;
    const image = this.image;

    // console.log(image.ai?.coco);

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(img, 0, 0);

    const boxColor = 'green';

    image.ai?.coco?.forEach(item => {
      let [x, y, width, height] = item.bbox;
      x = x < 0 ? 0 : x;
      y = y < 0 ? 0 : y;
      const text = this.capitalize(item.class);
      const fontInitialSize = 14;
      const strokeInitialSize = 2;

      const fontRatio = fontInitialSize / Number(this.maxWidth.replace(/[^0-9]/g, ''));
      const strokeRatio = strokeInitialSize / Number(this.maxWidth.replace(/[^0-9]/g, ''));
      const fontSize = this.canvas.width * fontRatio;
      const strokeSize = this.canvas.width * strokeRatio;

      this.ctx.beginPath();
      this.ctx.strokeStyle = boxColor;
      this.ctx.lineWidth = strokeSize;
      this.ctx.font = `${fontSize}px Arial`;

      this.ctx.strokeRect(x, y, width, height);
      const measure = this.ctx.measureText(text);
      this.ctx.fillStyle = boxColor;
      this.ctx.fillRect(x, y, measure.width + 20, fontSize + 10);

      this.ctx.fillStyle = '#fff';

      this.ctx.fillText(text, x + 10, y + fontSize);
    });
  }

  private capitalize(text: string) {
    return text.split(' ').map(i => i[0].toUpperCase() + i.slice(1)).join(' ');
  }

  private calculateMaxWidth() {
    if (!this.canvas || !this.image) return;
    const previewRect = this.elementRef.nativeElement.getBoundingClientRect();
    const pWidth = previewRect.width;
    const pHeight = previewRect.height;
    const iWidth = this.image.exif.ImageWidth || pWidth;
    const iHeight = this.image.exif.ImageHeight || pHeight;

    this.maxWidth = (iWidth > pWidth ? pWidth : iWidth) + 'px';
    this.maxHeight = (iHeight > pHeight ? pHeight : iHeight) + 'px';

    this.width = iWidth;
    this.height = iHeight;
  }

}
