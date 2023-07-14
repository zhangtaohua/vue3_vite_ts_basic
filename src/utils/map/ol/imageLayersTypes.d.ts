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
  $t?: any;
  callback?: any;
}
