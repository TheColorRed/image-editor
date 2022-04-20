/// <reference path="./src/collections.d.ts" />
/// <reference path="./src/websocket.d.ts" />

interface ImageStat {
  atime: Date | number;
  atimeMs: number;
  birthtime: Date | number;
  birthtimeMs: number;
  blksize: number;
  blocks: number;
  ctime: Date | number;
  ctimeMs: number;
  dev: number;
  gid: number;
  ino: number;
  mode: number;
  mtime: Date | number;
  mtimeMs: number;
  nlink: number;
  rdev: number;
  size: number;
  uid: number;
  file: string;
  name: string;
}

declare interface FileInfo {
  file: string,
  size: {
    width: number;
    height: number;
  };
  url: {
    full: string;
    large: string;
    medium: string;
    small: string;
  },
  ai: {
    coco: {
      bbox: number[],
      class: string;
      score: number;
    }[];
  };
  tags: string[];
  exif: import('exiftool-vendored/dist/Tags').Tags;
  iptc: IPTCData;
  rating: number;
  name: string;
  stat: ImageStat;
}

declare interface Crypto {
  randomUUID: () => string;
}

declare interface String {
  toPath(): string;
}
