export interface GeoImageExtOptions {
  id: string;
  url: string;
  bbox: any;
  extent?: any;
  name?: string;
  level?: string | number;
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
