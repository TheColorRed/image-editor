import * as http from 'http';
import { Observable } from 'rxjs';
import { sendFile } from '../helpers/send-file';
import { Server } from '../helpers/server';

// Create an http server
export function createHttpServer() {
  return new Observable<void>(sub => {
    Server.print(`Starting the http server on port ${process.env.SERVER_HTTP_PORT}`);
    http.createServer((req, res) => {
      const url = new URL(`http://localhost${req.url}`);
      if (url.pathname.startsWith('/file')) {
        sendFile(url, res);
      }
    }).listen(process.env.SERVER_HTTP_PORT, async () => {
      Server.success(`Http server started on port ${process.env.SERVER_HTTP_PORT}`);
      sub.complete();
    });
  });
}