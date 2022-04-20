import { Injectable } from '@angular/core';
import { filter, interval, Observable, of, Subject, take, takeWhile, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Message<T> {
  namespace: string;
  id: string;
  key?: ServerResponseKey;
  done: boolean;
  data: T;
}

export interface ServerInfo {
  separator: string;
  isWindows: boolean;
  isUnix: boolean;
}

export interface SocketMessage {
  id: string;
  namespace: Namespace,
  sub: Subject<any>;
}

export interface SocketKeyWatcher {
  key: ServerResponseKey;
  sub: Subject<any>;
  ob: Observable<any>;
}

@Injectable({ providedIn: 'root' })
export class WebSocketService {

  private ws?: WebSocket;
  ready = false;
  info!: ServerInfo;

  private readonly pendingMessages: SocketMessage[] = [];
  private readonly keyWatchers: SocketKeyWatcher[] = [];

  constructor() {
    this.connect();
  }
  /**
   * Sends a message to the server
   * @param namespace The namespace of the request
   * @param data The data to send
   * @param interrupt Whether or not this request should interrupt a previous request with the same namespace
   * @returns
   */
  send<Data, Result = any>(namespace: Namespace, data?: Data, interrupt = false) {
    if (this.ready === false || !this.ws) return of();
    if (interrupt) {
      this.interrupt(namespace);
    }

    const message = this.messageBody(namespace, data);
    const sub = new Subject<Message<Result>>();

    this.pendingMessages.push({ id: message.id, sub, namespace });
    this.ws.send(message.body);

    return sub.asObservable()
      .pipe(
        tap(i => {
          if (i.done === true) {
            const idx = this.pendingMessages.findIndex(p => p.id === i.id);
            idx > -1 && this.pendingMessages.splice(idx, 1);
          }
        }),
        takeWhile(i => i.done === false)
      );
  }
  /**
   * Watches for incoming messages with a particular key.
   * @param key The key to watch for incoming messages
   */
  on<T>(key: ServerResponseKey) {
    const sub = new Subject<Message<T>>();
    const ob = sub.asObservable();
    this.keyWatchers.push({ key, sub, ob });
    return ob;
  }
  /**
   * Stops watching for a key
   * @param obj The subject to stop watching on
   */
  off<T>(obj: Subject<T>): void;
  /**
   * Stops watching for a key
   * @param obj The observable to stop watching on
   */
  off<T>(obj: Observable<T>): void;
  off<T>(obj: Observable<T> | Subject<T>) {
    const watcherIdx = obj instanceof Observable ?
      this.keyWatchers.findIndex(i => i.ob === obj) :
      this.keyWatchers.findIndex(i => i.sub === obj);
    if (watcherIdx > -1) {
      const watcher = this.keyWatchers[watcherIdx];
      watcher.sub.complete();
      this.keyWatchers.splice(watcherIdx, 1);
    }
  }

  interrupt(item?: Namespace | SocketId) {
    // Cancel all messages if item is undefined
    if (typeof item === 'undefined') {
      this.pendingMessages.forEach(msg => msg.sub.complete());
      this.pendingMessages.splice(0, this.pendingMessages.length);
      console.log(this.pendingMessages.length);
    }
    // Cancel by namespace or id
    else {
      let idx = -1;
      if (this.isNamespace(item)) {
        idx = this.pendingMessages.findIndex(i => i.namespace === item);
      } else if (this.isSocketId(item)) {
        idx = this.pendingMessages.findIndex(i => i.id === item);
      }
      if (idx > -1) {
        const message = this.pendingMessages[idx];
        message.sub.complete();
        this.pendingMessages.splice(idx, 1);

        const msg = this.messageBody(message.namespace, 'interrupt');
        this.ws?.send(msg.body);

        console.log(this.pendingMessages.length);
      }
    }

    // if (idx > -1 || typeof item === 'undefined') {
    //   const messages = [];
    //   if (typeof item === 'undefined') {
    //     this.pendingMessages.forEach(m => messages.push(m));
    //   } else {
    //     messages.push(this.pendingMessages[idx]);
    //   }
    //   for (let message of messages) {
    //     const blob = new Blob([JSON.stringify({
    //       namespace: message.namespace,
    //       id: message.id,
    //       data: 'interrupt'
    //     })], { type: 'application/json' });
    //     this.ws?.send(blob);
    //     message.sub.complete();
    //     this.pendingMessages.splice(idx, 1);
    //   }
    // }
  }

  private isNamespace(test: string): test is Namespace {
    return test.indexOf('/') > -1;
  }

  private isSocketId(test: string): test is SocketId {
    return test.indexOf('-') > -1 && test.indexOf('/') === -1;
  }

  private messageBody<T>(namespace: Namespace, data?: T) {
    const id = crypto.randomUUID();
    const message = { namespace, data, id };

    return {
      body: new Blob([JSON.stringify(message)], { type: 'application/json' }),
      id
    };
  }

  private connect() {
    const ws = new WebSocket(`ws://localhost:${environment.SERVER_WS_PORT}`);
    ws.addEventListener('open', () => {
      this.ready = true;
      this.ws = ws;
      console.log('Websocket Connected');
    });
    ws.addEventListener('message', msg => {
      if (typeof msg.data === 'string') {
        this.info = JSON.parse(msg.data) as ServerInfo;
      } else {
        new Blob([msg.data]).text().then(text => {
          const msg = JSON.parse(text) as Message<any>;
          const responseMsg = this.pendingMessages.find(i => i.id === msg.id);
          responseMsg?.sub.next(msg);
          if (msg.key) {
            const watchers = this.keyWatchers.filter(i => i.key === msg.key);
            watchers.forEach(i => {
              if (i.sub.closed) {
                const idx = this.keyWatchers.indexOf(i);
                idx > -1 && this.keyWatchers.splice(idx, 1);
              } else {
                i.sub.next(msg);
              }
            });
          }
        });
      }
    });
    ws.addEventListener('close', () => {
      this.ready = false;
      this.ws = undefined;
      interval(1000).pipe(
        filter(() => this.ready === false),
        take(1)
      ).subscribe(() => {
        this.connect();
        console.log('Websocket Reconnecting');
      });
    });
  }

  isFile(data: any): data is FileInfo {
    return 'file' in data
      && 'url' in data
      && 'tags' in data
      && 'exif' in data
      && 'iptc' in data
      && 'rating' in data
      && 'name' in data
      && 'stat' in data
      ;
  }

  private rxjsImageCallback(data: FileInfo) {
    return {
      ...data,
      stat: {
        ...data.stat,
        atime: new Date(data.stat.atime),
        ctime: new Date(data.stat.ctime),
        mtime: new Date(data.stat.mtime),
        birthtime: new Date(data.stat.birthtime)
      }
    } as FileInfo;
  }
}
