
import { DetectedObject } from '@tensorflow-models/coco-ssd';
import { Observable, of, Subject } from 'rxjs';
import { catchError, concatMap, endWith, filter, finalize, map, switchMap, takeWhile, tap } from 'rxjs/operators';
import { parentPort, workerData } from 'worker_threads';
import { detect } from '../../ai/detection';
import { Server } from '../../helpers/server';

const TIME_KEY = '- Object detection took';
const index = new Subject<string[]>();
let total = workerData.indexed.length;

console.time(TIME_KEY);

index.asObservable().pipe(
  switchMap(files => of(...files).pipe(endWith('done'))),
  takeWhile(i => i !== 'done'),
  concatMap<string, Observable<[DetectedObject[], string]>>(file => detect(file).pipe(
    catchError(() => of([])),
    map(result => [result, file]),
  )),
  filter(detectionInfo => detectionInfo.length > 0),
  tap(([detection, file]) => Server.print(`Detected ${detection?.length || 0} items in ${file}`, 1)),
  tap(([detection, file]) => parentPort.postMessage({ file, detection })),
  finalize(() => {
    Server.success(`Object detection completed on ${total} files`);
    console.timeEnd(TIME_KEY);
  }),
  // tap(([detection, file]) => files.updateJSONColumn(file, 'ai', '$.coco', detection)),
  // toArray(),
).subscribe();

index.next(workerData.indexed);