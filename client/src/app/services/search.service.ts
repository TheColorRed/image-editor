import { Injectable } from '@angular/core';

type Items<T> = string | T;

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  fuzzySearch<T = string>(query: string, items: T[], keys?: string[]): T[] {
    query = query.toLowerCase();
    if (this.isStringArray(items)) {
      return items.filter(itm => typeof itm === 'string' && this.testString(itm, query));
    } else {
      return items.filter(itm => {
        return Object.entries(itm).some(([key, val]) => {
          if (keys && !keys.includes(key)) return false;
          return typeof val === 'string' && this.testString(val, query);
        });
      });
    }
  }

  private isStringArray(items: any[]): items is string[] {
    return Array.isArray(items) && items.every(i => typeof i === 'string');
  }

  private testString(itm: string, query: string) {
    let hay = itm.toLowerCase(), i = 0, n = -1, l;
    for (; l = query[i++];) if (!~(n = hay.indexOf(l, n + 1))) return false;
    return true;
  }
}
