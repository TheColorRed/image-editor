import { WebSocket } from 'ws';
import { Server } from './server';

export function executeNamespace(req: WebSocket, message: Message) {
  const [namespace, klass, method] = message.namespace.split('/') as [string, NamespacePrefix, string];
  import(`../websocket/${namespace}/${klass}.socket`).then(i => {
    const ns = new i.default(req, message);
    if (namespace === 'edit' && klass === 'actions') {
      // ns['apply'](message.data);
    } else {
      const camelMethod = camelCase(method);
      if (ns && typeof ns[camelMethod] === 'function') {
        ns[camelMethod](message.data);
      } else {
        Server.warn(`Could not find namespace ${klass}.${method}()`);
        ns.done();
      }
    }
  }).catch(e => console.error(e));
}

function camelCase(str: string) {
  return str.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
}