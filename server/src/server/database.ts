import path from 'path';
import { Observable } from 'rxjs';
import { SqlDatabase } from '../database/main.database';
import { Server } from '../helpers/server';
import { Constants } from './constants';

// Start the database service
export function startDatabase(runMigrations = true) {
  return new Observable<void>(sub => {
    const dbPath = path.join(Constants.APP_DATA, 'database.db');
    Server.print(`Starting the database file ${dbPath}`);
    SqlDatabase.connect(dbPath, runMigrations).subscribe({
      complete: () => sub.complete()
    });
  });
};