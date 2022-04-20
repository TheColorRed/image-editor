String.prototype.toPath = function (this: string) {
  return this.replace(/\\/g, '/');
};