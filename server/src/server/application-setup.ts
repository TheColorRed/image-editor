import * as fs from 'fs-extra';
import { Observable } from 'rxjs';
import { Server } from '../helpers/server';
import { Constants } from './constants';

export function applicationSetup() {
  return new Observable<void>(sub => {
    Server.print(`Creating ${Constants.APP_DATA}`);
    fs.mkdir(Constants.APP_DATA, { recursive: true })
      .then(() => {
        Server.success(`Created ${Constants.APP_DATA}`);
        sub.complete();
      });
  });
}