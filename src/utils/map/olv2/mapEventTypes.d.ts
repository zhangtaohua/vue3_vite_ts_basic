export interface EventOptions {
  id: string;
  type: string;
  cb: any;
  delay?: number;
  debounce?: boolean;
  debounceOption?: any; // 请参考 lodash 来设置。
}
