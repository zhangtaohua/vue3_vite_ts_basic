export interface StaticImageOptions {
  id: string;
  url: string;
  extent: any;
  name?: string;
  zIndex?: number;
  wrapX?: boolean;
  opacity?: number;
  isRotation?: boolean;
  rotationInDegree?: number;
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
