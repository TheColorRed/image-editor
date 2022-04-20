import glob from 'fast-glob';
import * as fs from 'fs-extra';
import * as path from 'path';
import { concat, concatMap, from, Observable, of, Subject, take, takeWhile, tap } from 'rxjs';
import { Database } from 'sqlite3';
import { Server } from '../helpers/server';

export abstract class SqlDatabase {

  private static db: Database;
  static connect(dbPath: string, runMigrations = true) {
    this.db = new Database(dbPath);
    return this.getVersion().pipe(
      tap(() => Server.success(`Connected to the database file ${dbPath}`)),
      tap(v => Server.info(`SQLite version ${v}`)),
      concatMap(() => {
        if (runMigrations) {
          return this.migrate('up');
        } else {
          Server.print('Skipping migrations');
          return of(undefined);
        }
      })
    );
  }

  private static getVersion() {
    return from(new Promise<string>(r => this.db.get('select sqlite_version() as v', (e, i) => r(i.v))));
  }

  private static migrate(direction: 'up' | 'down') {
    Server.print('Running migrations');
    const sub = new Subject<void>();
    const pattern = direction === 'up' ? '**/up.sql' : '**/down.sql';
    glob(pattern, { cwd: path.resolve(__dirname, '../../migrations'), absolute: true })
      .then(files => {
        const obFiles: Observable<boolean>[] = [];
        files.forEach(file => {
          Server.info(`${file} is being migrated`, 1);
          const fileSub = this.runFile(file);
          fileSub.subscribe({ complete: () => Server.success(`${file} has been migrated`, 2) });
          obFiles.push(fileSub);
        });
        concat(...obFiles).subscribe({ complete: () => sub.complete() });
      });
    return sub.asObservable();
  }

  static runFile(path: string, ...parameters: string[]) {
    const sub = new Subject<boolean>();
    let action: Promise<{ default: string; }>;
    try {
      if (path.endsWith('.sql')) {
        action = fs.readFile(path).then(i => ({ default: i.toString() }));
      } else {
        action = import(path);
      }
      action.then((str: { default: string; }) => {
        const queries = str.default.split(';').filter(itm => itm.trim().length > 0);
        const stmts: Observable<void>[] = [];
        for (let query of queries) {
          const o = new Observable<void>(subscriber => {
            const qMarks = query.match(/\?/g)?.length || 0;
            const params = parameters.splice(0, qMarks);
            const stmt = SqlDatabase.db.prepare(query);
            stmt.run(params, (err) => {
              if (err) {
                Server.error(err.message);
                subscriber.error(err);
              }
              subscriber.complete();
            });
            stmt.finalize();
          });
          stmts.push(o);
        }
        concat(...stmts).subscribe({
          complete: () => {
            sub.next(true);
            sub.complete();
          }
        });
      });
      return sub.asObservable();
    } catch (e) {
      return of();
    }
  }

  runFile(path: string, ...parameters: string[]) {
    return SqlDatabase.runFile(path, ...parameters);
  }

  query<T>(sql: string, ...parameters: string[]) {
    const sub = new Subject<T[]>();
    SqlDatabase.db.all(sql, parameters, (err, rows) => {
      err && Server.error(err.message);
      sub.next(rows);
    });
    return sub.asObservable().pipe(take(1));
  }

  first<T>(sql: string, ...parameters: string[]) {
    const sub = new Subject<T | undefined>();
    SqlDatabase.db.all(sql, parameters, (err, rows) => {
      err && Server.error(err.message);
      sub.next(rows[0]);
    });
    return sub.asObservable().pipe(take(1));
  }

  exists(sql: string, ...parameters: string[]) {
    const sub = new Subject<boolean>();
    SqlDatabase.db.all(sql, parameters, (err, rows) => {
      err && Server.error(err.message);
      sub.next(rows.length > 0);
    });
    return sub.asObservable().pipe(take(1));
  }

  stream<T>(sql: string, ...parameters: string[]) {
    const sub = new Subject<T | number>();
    SqlDatabase.db.each(sql, parameters, (err, row) => {
      err && Server.error(err.message);
      sub.next(row);
    }, (err, count) => {
      err && Server.error(err.message);
      sub.next(count);
    });
    return sub.asObservable().pipe(takeWhile<T>(i => typeof i === 'object'));
  }

  mutate(sql: string, ...parameters: string[]) {
    const sub = new Subject<boolean>();
    const stmt = SqlDatabase.db.prepare(sql);
    stmt.run(parameters, (err) => {
      err && Server.error(err.message);
      sub.next(!err);
    });
    stmt.finalize();
    return sub.asObservable().pipe(take(1));
  }
}
