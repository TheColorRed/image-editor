import { Canvas, createCanvas, Image as CanvasImage, JpegConfig, loadImage, PngConfig } from 'canvas';
import { ExifImage } from 'exif';
import * as fs from 'fs-extra';
import { concat, filter, interval, Observable, Subject, take } from 'rxjs';
import { ImageProcess, ImageProcessConstructor } from './image-processor';
const iptc = require('node-iptc');

export class Image {

  public image!: CanvasImage;
  public canvas!: Canvas;
  public ctx!: CanvasRenderingContext2D;

  private actions: Observable<any>[] = [];
  private ready = false;

  constructor(
    private readonly _path: string
  ) { }

  get path() { return this._path; }

  init() {
    const sub = new Subject<void>();
    loadImage(this._path).then(image => {
      this.image = image;
      this.canvas = createCanvas(this.image.width, this.image.height);
      this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
      // this.ctx.drawImage(this.image as any, 0, 0);
      new ExifImage(this._path, (err, info) => {
        if (err) {
          const file = fs.readFileSync(this._path);
          info = iptc(file);
        }
      });

      this.ready = true;
      sub.next();
    });
    return sub.asObservable().pipe(take(1));
  }

  addAction<T extends ImageProcess>(process: ImageProcessConstructor<T>, ...args: any[]) {
    this.actions.push(
      new Observable(sub => {
        const imageProcess = new process(this, this.canvas, this.ctx);
        const result = imageProcess.apply(...args);
        if (result instanceof Promise) {
          result.then(() => sub.complete());
        } else if (result instanceof Observable) {
          result.pipe(take(1)).subscribe(() => sub.complete());
        } else {
          sub.complete();
        }
      })
    );
  }

  setActions(actions: { action: ImageProcessConstructor<any>, args: any[]; }[]) {
    this.actions = [];
    actions.forEach(action => this.addAction(action.action, ...action.args));
  }

  applyActions() {
    interval(250)
      .pipe(
        filter(() => this.ready),
        take(1)
      )
      .subscribe(() => {
        concat(...this.actions).subscribe(() => {
          console.log('done');
          this.actions = [];
        });
      });
  }

  toPNG(config?: PngConfig) {
    return this.canvas.toBuffer('image/png', config);
  }

  toJPG(config?: JpegConfig) {
    return this.canvas.toBuffer('image/jpeg', config);
  }

  toPNGFile(path: string, config?: PngConfig) {
    const sub = new Subject<Buffer>();
    const image = this.toPNG(config);
    fs.writeFile(path, image).then(() => sub.next(image));
    return sub.asObservable().pipe(take(1));
  }

  toJPGFile(path: string, config?: JpegConfig) {
    const sub = new Subject<Buffer>();
    const image = this.toJPG(config);
    fs.writeFile(path, image).then(() => sub.next(image));
    return sub.asObservable().pipe(take(1));
  }

  toFile(path: string, config?: JpegConfig) {
    // const sub = new Subject<Buffer>();
    // const image = this.toJPG(config);
    // fs.writeFile(path, image).then(() => sub.next(image));
    // return sub.asObservable().pipe(take(1));
  }
}