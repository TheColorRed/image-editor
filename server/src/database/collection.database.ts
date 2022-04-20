import { map, switchMap, toArray } from 'rxjs/operators';
import { SqlDatabase } from './main.database';

class CollectionDatabase extends SqlDatabase {
  get<T extends FolderCollection | SmartCollection>(path: string | 'all', type?: CollectionType) {
    const where = type ? `type = ?` : '';
    const query = path === 'all' || typeof path === 'undefined' ?
      `select * from collections ${where ? `where ${where}` : ''}` :
      `select * from collections where json_extract(info, '$.path') like ? ${where ? `and ${where}` : ''}`;
    const params = [path === 'all' ? undefined : path, type].filter(i => typeof i !== 'undefined');

    return this.query<Collection<T>>(query, ...params)
      .pipe(
        switchMap(collections => collections),
        map(collection => ({ ...collection, info: JSON.parse(collection.info as unknown as string) })),
        toArray()
      );
  }

  add(label: string, type: CollectionType, info: any) {
    if ('path' in info) {
      info.path = info.path.toPath();
    }
    info = JSON.stringify(info);
    return this.mutate(`insert into collections (label, type, info) values (?, ?,json_insert(?))`, label, type, info);
  }

  delete(path: string) {
    return this.mutate(`delete from collections where json_extract(info, '$.path') = ?`, path.toPath());
  }
}

export const collections = new CollectionDatabase();