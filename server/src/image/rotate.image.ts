import { ImageProcess } from '../image-management/image-processor';

export default class Rotate extends ImageProcess {
  apply(direction: 'rotate-left' | 'rotate-right' | number) {
    const width = this.width, height = this.height;
    this.canvas.width = height;
    this.canvas.height = width;

    this.ctx.translate(this.width / 2, this.height / 2);
    if (direction === 'rotate-left') {
      this.ctx.rotate(-(Math.PI / 2));
    } else if (direction === 'rotate-right') {
      this.ctx.rotate(Math.PI / 2);
    }

    this.ctx.drawImage(this.source as any, -width / 2, -height / 2, width, height);
    this.ctx.translate(-(this.width / 2), -(this.height / 2));

    this.image.toFile(this.image.path);
  }
}