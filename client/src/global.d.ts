// pywebview.api.action('load', 'C:/Users/untun/Documents/Corel PaintShop Pro/2022/Samples/Emu.jpg');

declare interface Window {
  pywebview: {
    api: {
      action(name: string, path: string, data?: any): Promise<string>;
      load(path: string): Promise<string>;
      loadSection(path: string, channel: 'r' | 'g' | 'b' | 'a', quad: number): Promise<string>;
      apply(path: string): Promise<string>;
      cancel(path: string): Promise<string>;
    };
  };
}