export interface StaticImageOptions {
  id: string;
  url: string;
  extent: Array<number>;
  name?: string;
  zIndex?: number;
  wrapX?: boolean;
  opacity?: number;
  isPopup?: boolean;
  popupType?: string;
  htmlString?: string;
  vNode?: any;
  vNodeData?: any;
  position?: Array<number>;
  eventType?: string;
  customT?: any;
  callback?: any;
  delay?: number;
  debounce?: boolean;
  debounceOption?: any; // 请参考 lodash 来设置。
}
