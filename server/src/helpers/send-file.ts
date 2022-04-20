import { createCanvas, loadImage } from 'canvas';
import * as fs from 'fs-extra';
import { ServerResponse } from 'http';

export function sendFile(url: URL, res: ServerResponse) {
  const path = url.searchParams.get('path');
  const width = Number(url.searchParams.get('width') || 0);
  const height = Number(url.searchParams.get('height') || 0);
  if (path.length > 0) {
    const decoded = decodeURIComponent(path);
    fs.readFile(decoded)
      .then(file =>
        width || height ? getThumbnail(file, width, height) : Promise.resolve(file)
      ).then(file => {
        res.write(file);
        res.end();
      });
  } else {
    res.write('');
    res.end();
  }
}

async function getThumbnail(origImage: string | Buffer, width = Infinity, height = Infinity) {
  try {
    const image = await loadImage(origImage);
    const ratio = Math.min(width / image.width, height / image.height);
    const newWidth = Math.round(image.width * ratio), newHeight = Math.round(image.height * ratio);
    const canvas = createCanvas(newWidth, newHeight);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(image, 0, 0, newWidth, newHeight);
    return canvas.toBuffer('image/png');
  } catch (e) {
    const canvas = createCanvas(1, 1);
    return canvas.toBuffer('image/png');
  }
}