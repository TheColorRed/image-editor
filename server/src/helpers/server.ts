export type LogLevel = 'none' | 'verbose';

export class Server {
  static print(logLevel: string, message: string, indent: number): void;
  static print(logLevel: string, message: string): void;
  static print(message: string, indent: number): void;
  static print(message: string): void;
  static print(...args: [string, string, number] | [string, number] | [string, string] | [string]) {
    const logLevel = '';
    let message =
      // [logLevel, message, indent]
      args.length === 3 ?
        args[1] :
        // [message, indent]
        args.length === 2 && typeof args[1] === 'number' ?
          args[0] :
          // [logLevel, message]
          args.length === 2 && typeof args[1] === 'string' ?
            args[1] :
            // [message]
            args[0]
      ;
    const indent = (args.find(i => typeof i === 'number') || 0) as number;
    if (this.getLogLevel() === 'verbose') {
      message = '- ' + new Array(indent * 2).fill(' ').join('') + message;
      console.log(message);
    }
  }

  static warn(message: string, indent: number = 0) {
    message = '- ' + new Array(indent * 2).fill(' ').join('') + message;
    console.warn('\x1b[33m%s\x1b[0m', message);
  }

  static error(message: string, indent: number = 0) {
    message = '- ' + new Array(indent * 2).fill(' ').join('') + message;
    console.warn('\x1b[31m%s\x1b[0m', message);
  }

  static success(message: string, indent: number = 0) {
    message = '- ' + new Array(indent * 2).fill(' ').join('') + message;
    console.warn('\x1b[32m%s\x1b[0m', message);
  }

  static info(message: string, indent: number = 0) {
    message = '- ' + new Array(indent * 2).fill(' ').join('') + message;
    console.warn('\x1b[36m%s\x1b[0m', message);
  }

  static getLogLevel() {
    return Object.entries(process.env)
      .find(([key, value]) => key === 'SERVER_LOG_LEVEL')
      ?.[1] as LogLevel || 'none';
  }
}