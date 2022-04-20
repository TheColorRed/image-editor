import * as tfNode from '@tensorflow/tfjs-node';
import { Tensor3D } from '@tensorflow/tfjs-node';
import fs from 'fs-extra';
import { from } from 'rxjs';

export function readImage(path: string) {
  const promise = new Promise<Tensor3D>(resolve => {
    fs.readFile(path).then(imageBuffer => {
      try {
        const tfImage = tfNode.node.decodeImage(imageBuffer) as Tensor3D;
        resolve(tfImage);
      } catch {
        resolve(undefined);
      }
    });
  });
  return from(promise);
}