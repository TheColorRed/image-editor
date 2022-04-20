import * as coco from '@tensorflow-models/coco-ssd';
import { defer, forkJoin, Observable, of } from 'rxjs';
import { from } from 'rxjs/internal/observable/from';
import { catchError, concatMap, take, tap } from 'rxjs/operators';
import { readImage } from './read-image';

let cocoRef: coco.ObjectDetection | undefined = undefined;

export function detect(path: string): Observable<coco.DetectedObject[]> {
  const load = defer(() => from(loadCoco()));
  const image = defer(() => readImage(path));
  return forkJoin([load, image]).pipe(
    catchError(e => of()),
    concatMap(([mobilenetModel, image]) => mobilenetModel.detect(image)),
    catchError((err) => of()),
    take(1)
  );
}

function loadCoco() {
  if (typeof cocoRef !== 'undefined') {
    return of(cocoRef);
  }
  return from(coco.load()).pipe(tap(i => cocoRef = i));
}
