// import { Image, loadImage } from 'canvas';
import { Tags } from 'exiftool-vendored';
import * as fs from 'fs-extra';
import path from 'path';
import { from, pipe, Subject } from 'rxjs';
import { finalize, map, mergeMap, take, tap, toArray } from 'rxjs/operators';
import { Server } from '../helpers/server';
import { SqlDatabase } from './main.database';

/**
 * A database file record
 */
export interface FileDBInfo {
  path: string;
  exif: string;
  tags: string;
  rating: number;
  stat: string;
  iptc: string;
  ai: string;
}

class FilesDatabase extends SqlDatabase {
  /**
   * Gets all images in a collection.
   * @param searchValue A collection folder path or a collection tag.
   * @param type The type of collection to get.
   * @returns
   */
  get(searchValue: string, type: CollectionType) {
    var query: string = '', params: string[] = [];
    if (type === 'folder') {
      var [query, params] = this.getImagesInFolderCollection(searchValue);
    } else if (type === 'tag') {
      var [query, params] = this.getImagesInTagCollection(searchValue);
    }
    return this.stream<FileDBInfo>(query, ...params)
      .pipe(this.formatDBResult());
  }
  /**
   * Gets a single file
   * @param path The file path
   * @returns
   */
  getFile(path: string) {
    return this.first('select * from files where path = ?', path.toPath())
      .pipe(this.formatDBResult());
  }
  /**
   * Searches the database for files matching the search phrase.
   * @param phrase The phrase to search for in the database
   * @param style The search style 'fuzzy' or 'text'
   * @returns
   */
  search(phrase: string, style: SearchStyle) {
    var query: string = '', params: string[] = [];
    if (style === 'text') {
      var [query, params] = this.getTextSearch(phrase);
    } else {
      var [query, params] = this.getFuzzySearch(phrase);
    }
    return this.stream<FileDBInfo>(query, ...params)
      .pipe(this.formatDBResult());
  }
  /**
   * Adds a file to the database.
   * @param path The path of the file.
   * @param exif The file's exif data.
   * @param iptc The file's iptc data.
   * @param stat The file's stat data.
   * @returns
   */
  add(path: string, exif: Tags, iptc: IPTCData, stat: ImageStat) {
    const exifJSON = JSON.stringify(exif);
    const iptcJSON = JSON.stringify(iptc);
    const statJSON = JSON.stringify(stat);
    return this.mutate(`
      insert into files (path, exif, iptc, stat)
      values (
        ?, json_insert(?), json_insert(?), json_insert(?)
      )
      on conflict(path) do update set
        exif = excluded.exif,
        iptc = excluded.iptc,
        stat = excluded.stat
    `, path.toPath(), exifJSON, iptcJSON, statJSON);
  }
  /**
   * Deletes one file in a collection or all files in a collection.
   * @param path The path of the file.
   * @param exact Whether to delete one file in a collection or all files in a collection.
   * @returns
   */
  delete(path: string, exact = true) {
    const sql = exact ?
      'delete from files where path = ?' :
      'delete from files where path like ?';
    const params = exact ? path.toPath() : `${path.toPath()}%`;
    return this.mutate(sql, params);
  }
  /**
   * Deletes files that are no longer on the filesystem.
   * @returns
   */
  deleteNonExisting() {
    const toDelete: string[] = [];
    return this.stream<{ path: string; }>('select path from files')
      .pipe(
        mergeMap(file => from(fs.pathExists(file.path)).pipe(map(i => [file.path, i]))),
        tap<[string, boolean]>(([file, exists]) => exists === false && toDelete.push(file)),
        toArray(),
        finalize(() => {
          if (toDelete.length > 0) {
            const q = new Array(toDelete.length).fill('?').join(',');
            this.mutate(`delete from files where path in (${q})`, ...toDelete);
          }
          console.log('done');
        })
      );
  }
  /**
   * Creates/updates the search index data for all files.
   * @returns
   */
  indexFiles() {
    Server.print('Rebuilding search index');
    const sub = new Subject<boolean>();
    this.runFile(path.resolve(__dirname, '../stored-procedures/create-files-search.sql'))
      .subscribe({
        next: i => {
          Server.success(`Search index rebuilt`);
          sub.next(i);
        }
      });
    return sub.asObservable().pipe(take(1));
  }
  /**
   * Updates a column in the database for a file
   * @param file The file to update
   * @param column The database column name
   * @param value The value to put in the column
   * @returns
   */
  updateColumn(file: string, column: string, value: string | number | object) {
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    return this.mutate(`
      update files set ${column} = ? where path = ?
    `, value.toString(), file);
  }
  /**
   * Updates a json field value for a file
   * @param file The file to update
   * @param dbColumn The database column name
   * @param field The json field, Example: $.field_a
   * @param value The value to put within the field
   * @returns
   */
  updateJSONColumn(file: string, dbColumn: string, field: string, value: string | number | object) {
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    return this.mutate(`
      update files set ${dbColumn} = json_insert(ifnull(${dbColumn}, '{}'), ?, json_extract(?, '$')) where path = ?
    `, field, value.toString(), file);
  }

  /**
   * Deletes all files in a folder and sub-folders unless the file is in another collection.
   * @param prefix The folder to be deleted
   */
  deleteFilesInCollection(prefix: string) {
    return this.mutate(`
      DELETE FROM files WHERE files.path in (
        SELECT files.path FROM files LEFT JOIN (
          SELECT json_extract(info, '$.path') AS path FROM collections
          WHERE json_extract(info, '$.path') LIKE ?
        ) AS c ON files.path LIKE c.path || '%'
        WHERE c.path IS NULL
      )
    ` , `${prefix}_%`);
  }
  /**
   * Query string for getting files that match a collection folder.
   * @param path The folder path of the collection.
   * @returns
   */
  private getImagesInFolderCollection(path: string): [string, string[]] {
    return [`select * from files where path like ?`, [`${path.toPath()}%`]];
  }
  /**
   * Query string for getting files with a particular tag.
   * @param tag The tag for the collection.
   * @returns
   */
  private getImagesInTagCollection(tag: string): [string, string[]] {
    return [`select * from files where exists (select 1 from json_each(tags) where value = ?)`, [tag]];
  }
  /**
   * Query string for getting files that match a fuzzy search.
   * @param phrase The phrase to search for.
   * @returns
   */
  private getFuzzySearch(phrase: string): [string, string[]] {
    const like = ''.concat('%', phrase.split('').join('%'), '%');
    const query = `
      SELECT files.* FROM files_search JOIN files ON files.path = files_search.path WHERE body LIKE ?;
    `;
    const matches = query.match(/like \?/ig).length;
    const likes: string[] = new Array(matches).fill(like);
    return [query, likes];
  }
  /**
   * Query string for getting files that match a full text search.
   * @param phrase The phrase to search for.
   * @returns
   */
  private getTextSearch(phrase: string): [string, string[]] {
    const query = `
      SELECT files.* FROM files_search JOIN files ON files.path = files_search.path WHERE body MATCH ? order by rank
    `;
    const matches = query.match(/match \?/ig).length;
    const matchParams: string[] = new Array(matches).fill(phrase);
    return [query, matchParams];
  }
  /**
   * Formats a returned database row from the `files` table.
   * @returns
   */
  private formatDBResult() {
    return pipe(
      map<FileDBInfo, FileInfo>((i) => {
        const exif = JSON.parse(i.exif) as Tags;
        const width = exif.ImageWidth;
        const height = exif.ImageHeight;

        const largeWidth = width > 200 ? 200 : width;
        const largeHeight = height > 200 ? 200 : height;

        const mediumWidth = width > 100 ? 100 : width;
        const mediumHeight = height > 100 ? 100 : height;

        const smallWidth = width > 50 ? 50 : width;
        const smallHeight = height > 50 ? 50 : height;

        const encPath = encodeURIComponent(i.path);
        const port = process.env.SERVER_HTTP_PORT;

        return {
          exif,
          stat: JSON.parse(i.stat),
          iptc: JSON.parse(i.iptc),
          tags: JSON.parse(i.tags),
          name: path.parse(i.path).base,
          file: i.path,
          rating: i.rating,
          size: {
            width: width,
            height: height
          },
          ai: JSON.parse(i.ai),
          url: {
            full: `http://localhost:${port}/file?path=${encPath}`,
            large: `http://localhost:${port}/file?path=${encPath}&width=${largeWidth}&height=${largeHeight}`,
            medium: `http://localhost:${port}/file?path=${encPath}&width=${mediumWidth}&height=${mediumHeight}`,
            small: `http://localhost:${port}/file?path=${encPath}&width=${smallWidth}&height=${smallHeight}`,
          }
        } as FileInfo;
      })
    );
  }
}

export const files = new FilesDatabase();
