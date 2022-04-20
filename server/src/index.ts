
import { concat } from 'rxjs';
import './globals/paths';
import { applicationSetup } from './server/application-setup';
import { startDatabase } from './server/database';
import { createHttpServer } from './server/http';
import { createWebsocketServer } from './server/socket';

concat(
  applicationSetup(),
  startDatabase(),
  createHttpServer(),
  createWebsocketServer()
).subscribe();