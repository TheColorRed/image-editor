import * as glob from 'fast-glob';
import * as fs from 'fs-extra';
import { concat, Observable, Subject, Subscriber, take, takeWhile } from 'rxjs';
import { Server } from './server';


export function getFiles(roots: string | string[], patterns: string[], deep = Infinity) {
  const sub = new Subject<string | undefined>();
  const arrRoots = typeof roots === 'string' ? [roots] : roots;
  const tasks: Observable<any>[] = [];

  // Create the observables to be executed
  for (let root of arrRoots) {
    const ob = new Observable((obSub: Subscriber<void>) => {
      Server.info(`Finding files within ${root}`);
      let imageCount = 0;
      glob.stream(patterns, { cwd: root, suppressErrors: true, onlyFiles: true, deep, absolute: true })
        .on('data', file => {
          Server.print(`Found ${file}`, 1);
          // file = path.join(root, file.replace(/\\/g, '/'));
          imageCount++;
          sub.next(file);
        })
        .on('end', () => { Server.print(`Found ${imageCount} files within ${root}`); obSub.complete(); });
    });
    tasks.push(ob);
  }

  // Run each observable one at a time
  concat(...tasks).pipe(
    take(arrRoots.length)
  ).subscribe({ complete: () => sub.next(undefined) });

  return sub.asObservable().pipe(
    takeWhile(i => typeof i === 'string')
  );
}

export function fileStat(file: string) {
  const sub = new Subject<ImageStat>();
  fs.stat(file, (err, stat) => sub.next(stat as unknown as ImageStat));
  return sub.asObservable().pipe(take(1));
}