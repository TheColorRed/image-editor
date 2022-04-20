const lit = (s: TemplateStringsArray, ...args: any[]) => s.map((ss, i) => `${ss}${args[i] || ''}`).join('');

// (global as any).css = lit;
// (global as any).html = lit;
// global.sql = lit;

// console.log('here', `asdf`);