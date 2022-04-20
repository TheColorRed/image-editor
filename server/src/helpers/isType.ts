export function isStringArray(data: any): data is string[] {
  return Array.isArray(data) && data.every(i => typeof i === 'string');
}

export function isNumberArray(data: any): data is string[] {
  return Array.isArray(data) && data.every(i => typeof i === 'number');
}

export function isObjectArray(data: any): data is string[] {
  return Array.isArray(data) && data.every(i => typeof i === 'object');
}

export function isInterfaceArray<T>(data: any, ...objectKeys: string[]): data is T[] {
  return Array.isArray(data) && data.every(obj => typeof obj === 'object' && objectKeys.every(k => k in obj));
}