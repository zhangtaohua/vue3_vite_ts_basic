export interface EventOptions {
  id: string;
  type: string;
  element: HTMLCanvasElement;
  cb: any;
  modify?: string;
  delay?: number;
  debounce?: boolean;
  debounceOption?: any; // 请参考 lodash 来设置。
}
