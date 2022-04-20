import { Canvas } from 'canvas';
import { Observable } from 'rxjs';
import { Image } from './image';


export type ImageProcessConstructor<T extends ImageProcess> = new (img: Image, canvas: Canvas, ctx: CanvasRenderingContext2D) => T;

export interface ActionProcess {
  action: ImageProcessConstructor<any>;
  args: any;
}

export abstract class ImageProcess {
  abstract apply(...args: any[]): Observable<void> | Promise<void> | undefined | void;

  public complete = false;

  get width() { return this.image.canvas.width; }
  get height() { return this.image.canvas.height; }
  get canvas() { return this.image.canvas; }
  get ctx() { return this.image.ctx; }
  get source() { return this.image.image; }

  constructor(
    protected readonly image: Image
  ) { }
}

export class ImageProcessor {

  private images: Image[] = [];

  addImage(image: Image | string) {
    if (typeof image === 'string') {
      image = new Image(image);
    }
    this.images.push(image);
    return image;
  }


}