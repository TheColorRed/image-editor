import path from 'path';
import { Observable } from 'rxjs';
import { WebSocketServer } from 'ws';
import { executeNamespace } from '../helpers/namespace';
import { Server } from '../helpers/server';

// Create a web socket server
export function createWebsocketServer() {
  return new Observable<void>(sub => {
    Server.print(`Starting the socket server on port ${process.env.SERVER_WS_PORT}`);
    const wss = new WebSocketServer({
      port: Number(process.env.SERVER_WS_PORT)
    }, () => {
      Server.success(`Socket server started on port ${process.env.SERVER_WS_PORT}`);
      sub.complete();
    });

    // Create a websocket connection
    wss.on('connection', req => {
      Server.print('Client has connected to the server');
      req.send(JSON.stringify({
        separator: path.sep,
        isWindows: process.platform === 'win32',
        isUnix: process.platform !== 'win32'
      }));
      req.on('message', (message: any) => {
        let buffer: Message = JSON.parse(Buffer.from(message).toString());
        executeNamespace(req, buffer);
      });
      req.on('close', () => {
        Server.info('Client has disconnected from the server');
      });
    });

    wss.on('close', () => {
      Server.print('Server has shut down');
    });
  });
}