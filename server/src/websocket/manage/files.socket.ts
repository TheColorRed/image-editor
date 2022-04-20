import * as fs from 'fs-extra';
import * as path from 'path';
import { finalize, tap } from 'rxjs';
import { files } from '../../database/files.database';
import { isFolderCollection, isTagCollection } from '../../helpers/collections';
import { Server } from '../../helpers/server';
import { MessageService } from '../message';

export default class Files extends MessageService {
  /**
   * Streams all the images in a collection to the socket.
   * @param collection The collection of of images
   * @returns
   */
  images(collection: Collection) {
    let query: string | undefined = undefined;
    Server.print(`Getting images in ${collection.type} collection ${collection.label}`);
    if (isFolderCollection(collection)) {
      query = collection.info.path;
    } else if (isTagCollection(collection)) {
      query = collection.label;
    }
    if (typeof query === 'undefined') return this.send([]);
    let found = 0;
    files.get(query, collection.type)
      .pipe(
        tap(i => { found++; return i; }),
        tap(file => this.send(file)),
        finalize(() => {
          Server.print(`Found ${found} images in ${collection.type} collection ${collection.label}`);
          this.done();
        })
      )
      .subscribe();
  }
  /**
   * Gets an image from the database.
   * @param path The path of the image.
   */
  image(path: string) {
    Server.print(`Getting image ${path}`);
    files.getFile(path).subscribe(file => this.done(file));
  }
  /**
   * Gets a list of child folders in a path.
   * @param data Data for the current path.
   * @returns
   */
  folders(data: { path: string, showHidden: boolean; }) {
    let folderRoot = data.path;
    let showHidden = data.showHidden;
    if (!folderRoot) return this.send([]);
    if (process.platform === 'win32' && (folderRoot.startsWith('/') || folderRoot.startsWith('\\'))) {
      const formatted = folderRoot.replace(/^(\/|\\)/, '');
      folderRoot = `C:\\${formatted}`;
    }
    fs.readdir(folderRoot, { withFileTypes: true })
      .then(files => {
        const dirs = files.filter(i => {
          if (!i.isDirectory()) return false;
          if (showHidden === true) return true;
          return !(/(^|\/)\.[^\/\.]/g).test(i.name);
        })
          .map(i => ({ name: i.name, path: path.join(folderRoot, i.name) }));
        this.done(dirs);
      })
      .catch(() => this.done());
  }
  /**
   * Searches for files in the database.
   * @param query The search information.
   */
  search(query: SearchRequest) {
    if ((query.query || '').trim().length === 0) {
      Server.print(`Empty search string no results found`);
      return this.done();
    }
    Server.print(`Searching for "${query.query}" using ${query.style} search`);
    let fileCount = 0;
    files.search(query.query, query.style)
      .pipe(
        tap(file => this.send(file)),
        tap(() => fileCount++),
        finalize(() => {
          Server.print(`Found ${fileCount} files when searching for "${query.query}" using ${query.style} search`);
          this.done();
        })
      )
      .subscribe();
  }
}