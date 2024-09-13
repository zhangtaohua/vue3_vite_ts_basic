export interface DrawOnlyGeoOptions {
  shape: string;
  isClear: boolean;
  isFreehand: boolean;
  needModify: boolean;
  once: boolean;
  callback?: any;
  isShowSegments?: boolean;
  isShowLngLat?: boolean;
  isShowLabel?: boolean;
  isShowTip?: boolean;
  isShowAction?: boolean;
}

export interface DrawOnlyGeoGeojsonOptions {
  id: string;
  data?: any;
  shape?: string;
  isClear?: boolean;
  isFreehand?: boolean;
  needModify?: boolean;
  once?: boolean;
  callback?: any;
  isShowSegments?: boolean;
  isShowLngLat?: boolean;
  isShowLabel?: boolean;
  isShowTip?: boolean;
  isShowAction?: boolean;
}
