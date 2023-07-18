export interface SatelliteOrbitOptions {
  id: string;
  tle1: string;
  tle2: string;
  startTime: any;
  endTime: any;
  timeInterval: number;
  isShowSat?: boolean;
  satStyle?: any;
  satStyleFunction?: any;
  data?: any;
  name?: string;
  zIndex?: number;
  extent?: Array<number>;
  wrapX?: boolean;
  style?: any;
  styleFunction?: any;
  isPopup?: boolean;
  popupType?: string;
  htmlString?: string;
  popupIsCenter?: boolean;
  hasClose?: boolean;
  duration?: number;
  vNode?: any;
  vNodeData?: any;
  position?: Array<number>;
  customT?: any;
  eventType?: string;
  callback?: any;
  delay?: number;
  debounce?: boolean;
  debounceOption?: any; // 请参考 lodash 来设置。
}
