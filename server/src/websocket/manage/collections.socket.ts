import { ExifTool } from 'exiftool-vendored';
import fs from 'fs-extra';
import iptc from 'node-iptc';
import path from 'path';
import { concat, defer, forkJoin, from, Observable, of, pipe } from 'rxjs';
import { concatMap, filter, finalize, map, mergeMap, switchMap, take, tap, toArray } from 'rxjs/operators';
import { collections } from '../../database/collection.database';
import { files } from '../../database/files.database';
import { tags } from '../../database/tags.database';
import { isFolderCollection, isTagCollection } from '../../helpers/collections';
import { FILE_PATTERNS } from '../../helpers/constants';
import { fileStat, getFiles } from '../../helpers/files';
import { isStringArray } from '../../helpers/isType';
import { Server } from '../../helpers/server';
import { runThread } from '../../processes/run-process';
import { MessageService } from '../message';

export default class Collections extends MessageService {

  get() {
    concat(
      tags.get().pipe(
        map(collections => collections.map(itm => {
          return {
            label: itm.tag,
            type: 'tag',
            auto: itm.auto
          };
        }))
      ),
      collections.get('all')
    )
      .subscribe({
        next: files => this.send(files),
        complete: () => this.done()
      });
  }

  create(data: FolderCollection | SmartCollection[]) {
    if (isFolderCollection(data)) {
      let depth = Infinity;
      if (!data.info.deep) depth = 1;
      collections.add(data.label, data.type, data.info)
        .pipe(
          tap(created => this.send({ status: created, message: !created ? 'folder exists' : '' })),
          switchMap(created => created && data.info.path && getFiles(data.info.path, FILE_PATTERNS, depth)),
          tap(file => this.saveFile(file))
        )
        .subscribe({
          complete: () => this.done()
        });
    }
  }
  /**
   * Deletes a collection
   * @param collection
   */
  delete(collection: Collection) {
    let del: Observable<boolean>;
    if (isFolderCollection(collection)) {
      del = of({}).pipe(
        concatMap(() => files.deleteFilesInCollection(collection.info.path)),
        concatMap(() => collections.delete(collection.info.path))
      );
      // del = collections.delete(collection.info.path);
    } else if (isTagCollection(collection)) {
      del = of({}).pipe(
        concatMap(() => tags.removeTag(collection.label)),
        concatMap(() => tags.removeTagFromAllFiles(collection.label)),
        concatMap(() => files.indexFiles())
      );
    }
    del.subscribe(deleted => this.done(deleted));
  }

  refresh(file?: string) {
    let collectionsSize = 0;
    const deleteNonExisting = defer(() => files.deleteNonExisting());
    const indexFiles = defer(() => files.indexFiles());
    const saveFiles = defer(() => collections.get<FolderCollection>(file, 'folder'))
      .pipe(
        tap(i => collectionsSize = i.length),
        switchMap(item => item),
        map<FolderCollection, [string, number]>(collection => [collection.info.path, collection.info.deep ? Infinity : 1]),
        mergeMap(([path, depth]) => getFiles(path, FILE_PATTERNS, depth)),
        tap(file => this.saveFile(file)),
        toArray(),
        take(1)
      );

    let deleted = 0;
    let indexed: string[] = [];
    concat(deleteNonExisting, saveFiles, indexFiles)
      .pipe(
        concatMap((i, idx) => {
          if (idx === 1 && isStringArray(i)) indexed = i;
          return of(i);
        }),
        finalize(() => {
          Server.success(`${deleted} files were removed from the filesystem`);
          Server.success(`Refreshed ${collectionsSize} collections`);
          Server.info('Running object detection');
          const thread = runThread(path.resolve(__dirname, '../../processes/ai/detect-object'), { indexed });
          thread.on('message', ({ file, detection }) => files.updateJSONColumn(file, 'ai', '$.coco', detection));
          thread.on('exit', () => this.done());
        })
      )
      .subscribe();
  }

  private saveFile(file: string) {
    const iptcData = from(fs.readFile(file))
      .pipe(concatMap(fileData => Promise.resolve<IPTCData>((iptc(fileData) || {}) as IPTCData)));
    // const exifData = from(new Promise<ExifData>(r => new ExifImage({ image: file }, (err, exif) => r((exif || {}) as ExifData))));
    const exifData = from(new ExifTool().read(file));
    const stat = from(fileStat(file));

    forkJoin({
      exifData, iptcData, stat
    })
      .pipe(
        tap(obj => files.add(file, obj.exifData, obj.iptcData, obj.stat)),
        filter(({ iptcData }) => iptcData.keywords?.length > 0),
        switchMap(({ iptcData }) => iptcData.keywords),
        pipe(
          concatMap(keyword => concat(tags.add(keyword), tags.addPathTag(keyword, file)).pipe(map(i => [i, keyword]))),
          filter(([added]) => added === true),
          tap(([, keyword]) => this.send(keyword, 'tags:new'))
        )
      ).subscribe();
  }

}