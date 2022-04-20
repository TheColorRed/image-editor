import { Injectable } from '@angular/core';
import { BehaviorSubject, filter } from 'rxjs';

export interface Quadrant {
  x: number;
  y: number;
  i: string;
  img: HTMLImageElement;
}

@Injectable({ providedIn: 'root' })
export class ImageProcessorService {

  // private ws?: WebSocket;
  ready = false;

  private image = new BehaviorSubject<HTMLImageElement | ImageData | Quadrant | undefined>(undefined);
  image$ = this.image.asObservable().pipe(
    filter((img): img is HTMLImageElement | ImageData =>
      img instanceof HTMLImageElement || img instanceof ImageData || this.isQuadrant(img))
  );

  constructor() {
    // this.connect();
  }

  private isQuadrant(data: any): data is Quadrant {
    return typeof data === 'object' && 'x' in data && 'y' in data && 'i' in data;
  }

  async loadImage(path: string) {
    const result = await window.pywebview.api.load(path);
    // const arr = new Uint8ClampedArray(result);
    // const imgData = new ImageData(arr, 4272, 2848);
    // this.updateImage(imgData);
    this.updateImage(result);
  }

  async processImage<T>(action: string, path: string, data?: T) {
    const result = await window.pywebview.api.action(action, path, data);
    this.updateImage(result);
  }

  async applyImage(path: string) {
    const result = await window.pywebview.api.apply(path);
    this.updateImage(result);
  }

  async cancelImage(path: string) {
    const result = await window.pywebview.api.cancel(path);
    this.updateImage(result);
  }

  private updateImage(data: string | ImageData | Quadrant) {
    if (typeof data === 'string') {
      const img = new Image();
      img.src = `data:image/webp;base64,${data}`;
      img.addEventListener('load', () => {
        this.image.next(img);
      });
    } else if (data instanceof ImageData) {
      this.image.next(data);
    } else if (Array.isArray(data)) {
      data.forEach(itm => {
        if (this.isQuadrant(itm)) {
          const img = new Image();
          img.src = `data:image/webp;base64,${itm.i}`;
          img.addEventListener('load', () => {
            itm.img = img;
            this.image.next(itm);
          });
        }
      });
    }
  }

  // private connect() {
  //   const ws = new WebSocket(`ws://localhost:${environment.IMAGE_WS_PORT}`);
  //   ws.addEventListener('open', () => {
  //     this.ready = true;
  //     this.ws = ws;
  //     console.log('Image Websocket Connected');
  //   });
  //   ws.addEventListener('message', msg => {
  //     const url = URL.createObjectURL(new Blob([msg.data]));
  //     const img = new Image();
  //     img.src = url;
  //     // img.addEventListener('load', () => this.image.next(img));
  //   });
  //   ws.addEventListener('close', () => {
  //     this.ready = false;
  //     this.ws = undefined;
  //     interval(1000).pipe(
  //       filter(() => this.ready === false),
  //       take(1)
  //     ).subscribe(() => {
  //       this.connect();
  //       console.log('Image Websocket Reconnecting');
  //     });
  //   });
  // }

  // private b64toBlob(b64Data: string, contentType = '', sliceSize = 512) {
  //   const byteCharacters = atob(b64Data);
  //   const byteArrays = [];

  //   for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
  //     const slice = byteCharacters.slice(offset, offset + sliceSize);

  //     const byteNumbers = new Array(slice.length);
  //     for (let i = 0; i < slice.length; i++) {
  //       byteNumbers[i] = slice.charCodeAt(i);
  //     }

  //     const byteArray = new Uint8Array(byteNumbers);
  //     byteArrays.push(byteArray);
  //   }

  //   const blob = new Blob(byteArrays, { type: contentType });
  //   return blob;
  // }
}