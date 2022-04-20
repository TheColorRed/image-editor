import { concat, concatMap, filter, map, Subject, take } from 'rxjs';
import { SqlDatabase } from './main.database';

class TagsDatabase extends SqlDatabase {

  get() {
    return this.query<{ tag: string; auto: number; }>(`select * from tags`)
      .pipe(map(tags => tags.map(tag => ({ tag: tag.tag, auto: !!tag.auto }))
      ));
  }

  fileTags(file: string) {
    return this.first<{ tags: string; }>(`select tags from files where path = ?`, file.toPath())
      .pipe(
        map(tags => JSON.parse(tags.tags) as string[]),
        take(1)
      );
  }

  add(tag: string) {
    return this.exists('select 1 from tags where tag = ?', tag).pipe(
      filter(i => i === false),
      concatMap(() => this.mutate(`insert into tags (tag) values (?)`, tag))
    );
  }

  addPathTag(tag: string, file: string) {
    const path = file.toPath();
    const sub = new Subject<boolean>();
    this.exists(`
      select 1 from files
      where exists
      (select 1 from json_each(tags) where lower(value) = lower(?)) AND files.path = ?
    `, tag, path)
      .pipe(
        filter(i => i === false),
        concatMap(() => {
          const change = this.mutate(`UPDATE files SET tags = json_insert(ifnull(tags, '[]'), '$[#]', ?) where path = ?`, tag, path);
          const tags = this.query<{ tags: string; }>(`select tags from files where path = ?`, path);

          return concat(change, tags)
            .pipe(
              filter<{ tags: string; }[]>(i => Array.isArray(i) && i.length > 0),
              map(i => JSON.parse(i[0].tags))
            );
        })
      ).subscribe(i => sub.next(i));
    return sub.asObservable().pipe(take(1));
  }

  removeTag(tag: string) {
    return this.mutate(`delete from tags where tag = ?`, tag);
  }

  removeTagFromFile(tag: string, path: string) {
    const change = this.mutate(`
      update files
      set tags = json_remove(tags, jr.fullkey)
      from json_each(files.tags) AS jr
      where jr.value = ? and files.path = ?
    `, tag, path);

    const tags = this.query<{ tags: string; }>(`select tags from files where path = ?`, path);

    return concat(change, tags)
      .pipe(
        filter<{ tags: string; }[]>(i => Array.isArray(i) && i.length > 0),
        map(i => JSON.parse(i[0].tags))
      );
  }

  removeTagFromAllFiles(tag: string) {
    return this.mutate(`
      update files
      set tags = json_remove(tags, jr.fullkey)
      from json_each(files.tags) AS jr
      where jr.value = ?
    `, tag);
  }
}

export const tags = new TagsDatabase();