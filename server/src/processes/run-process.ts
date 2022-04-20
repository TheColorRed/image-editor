import { fork } from 'child_process';
import path from 'path';
import { Worker } from 'worker_threads';
import { Server } from '../helpers/server';

export function runProcess(file: string, ...args: any[]) {
  const cp = fork(file, { stdio: 'inherit' });
  cp.send(args);
  cp.on('message', (msg: [string, number | undefined]) => {
    Server.print(msg[0], msg[1] || 0);
  });
}

export function runThread(file: string, args: { [key: string]: any; }) {
  return new Worker(path.resolve(__dirname, './worker.ts'), {
    workerData: {
      aliasModule: file,
      ...args
    }
  });
}