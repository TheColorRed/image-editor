declare interface ArrayCallback<T> {
  then(found: (value: T, index: number, obj: T[]) => void): ArrayCallback<T>;
  then(options: {
    found?: (value: T, index: number, obj: T[]) => void;
    none?: (obj: T[]) => void;
  }): ArrayCallback<T>;
}

declare interface Array<T> {
  lookup: (predicate: (value: T, index: number, obj: T[]) => boolean) => ArrayCallback<T>;
}

Array.prototype.lookup = function <T>(this: Array<T>, predicate: (value: T, index: number, obj: T[]) => boolean) {
  const index = this.findIndex(predicate);
  const result = this[index];
  const $this = this;
  return {
    then(options) {
      if (index > -1) {
        if (typeof options === 'function') {
          options(result, index, $this);
        } else {
          typeof options.found === 'function' && options.found(result, index, $this);
        }
      } else {
        if (typeof options !== 'function') {
          typeof options.none === 'function' && options.none($this);
        }
      }
    }
  } as ArrayCallback<T>;
};