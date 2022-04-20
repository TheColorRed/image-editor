import * as coco from '@tensorflow-models/coco-ssd';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tfNode from '@tensorflow/tfjs-node';
import { Tensor3D } from '@tensorflow/tfjs-node';
import * as fs from 'fs-extra';
import { forkJoin, from, switchMap, take } from 'rxjs';
import { Server } from '../../helpers/server';
import { MessageService } from '../message';


export default class Classification extends MessageService {
  objects(path: string) {
    Server.print(`Finding objects in the image ${path}`);
    const load = from(coco.load({ base: 'mobilenet_v2' }));
    const image = this.readImage(path);
    return forkJoin([load, image]).pipe(
      switchMap(([mobilenetModel, image]) => mobilenetModel.detect(image)),
      take(1)
    ).subscribe((i) => this.done(i));
  }

  analyze(path: string) {
    Server.print(`Classifying the image ${path}`);
    const load = from(mobilenet.load());
    const image = this.readImage(path);
    return forkJoin([load, image]).pipe(
      switchMap(([mobilenetModel, image]) => mobilenetModel.classify(image, 10)),
      take(1)
    ).subscribe((i) => this.done(i));
  }

  private readImage(path: string) {
    const promise = new Promise<Tensor3D>(resolve => {
      fs.readFile(path).then(imageBuffer => {
        const tfImage = tfNode.node.decodeImage(imageBuffer) as Tensor3D;
        resolve(tfImage);
      });
    });
    return from(promise);
  };
}