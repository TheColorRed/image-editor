import { Injectable, Type } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AdjustmentComponent } from '../workspaces/adjust/adjustment.component';
import { ImageProcessorService } from './websockets/image-processor.service';

@Injectable({ providedIn: 'root' })
export class AdjustService {

  private activeAdjustment = new BehaviorSubject<Type<AdjustmentComponent> | undefined>(undefined);
  activeAdjustment$ = this.activeAdjustment.asObservable();

  private activeImage = new BehaviorSubject<FileInfo | undefined>(undefined);
  activeImage$ = this.activeImage.asObservable().pipe(
    filter((file): file is FileInfo => typeof file !== 'undefined' && !(file instanceof Event)),
  );

  constructor(
    private readonly imageProcessor: ImageProcessorService
  ) { }

  setAdjustmentActions(adjustment?: Type<AdjustmentComponent>) {
    this.activeAdjustment.next(adjustment);
  }

  setImage(image: FileInfo) {
    this.activeImage.next(image);
  }

  refreshImage() {
    this.activeImage.next(this.activeImage.value);
  }

  requestChange(action: string, path: string, data?: any) {
    if (action === 'load') {
      this.imageProcessor.loadImage(path);
    } else if (action === 'apply') {
      this.imageProcessor.applyImage(path);
    } else if (action === 'cancel') {
      this.imageProcessor.cancelImage(path);
    } else {
      this.imageProcessor.processImage(action, path, data);
    }
  }
}