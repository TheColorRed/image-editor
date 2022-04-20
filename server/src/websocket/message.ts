import { WebSocket } from 'ws';

export abstract class MessageService {
  constructor(
    protected readonly req: WebSocket,
    protected readonly message: Message
  ) { }

  protected send<T>(data?: T, key?: ServerResponseKey, isDone = false) {
    const msg = {
      namespace: this.message.namespace,
      id: this.message.id,
      key,
      data,
      done: typeof data === 'undefined' && isDone === true
    } as Message<T>;

    this.req.send(Buffer.from(JSON.stringify(msg)), () => {
      if (isDone && msg.done !== true) {
        msg.done = true;
        msg.data = undefined;
        this.req.send(Buffer.from(JSON.stringify(msg)));
      }
    });

  }

  protected done<T>(data?: T, key?: ServerResponseKey) {
    this.send<T>(data, key, true);
  }
}