import * as path from 'path';

export class Constants {

  static readonly APP_DATA = path.join(
    process.env.APPDATA || (
      process.platform == 'darwin' ?
        `${process.env.HOME}/Library/Preferences` :
        `${process.env.HOME}/.local/share`
    ),
    'PhotoEditor'
  );
}