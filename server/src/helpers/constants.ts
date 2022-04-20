export const FILES = 'jpg,jpeg,gif,png';
export const FILES_ARR = FILES.split(',');
export const FILE_PATTERNS = FILES_ARR.map(i => `**/*.${i}`);