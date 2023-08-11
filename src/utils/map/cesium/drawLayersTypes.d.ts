import { CsPopupOptions, CsScreenEventOptions, CsEntityLabelOptions } from "./baseTypes";

export interface DrawBasicOptions {
  shape: string;
  isClear?: boolean;
  needModify?: boolean;
  once?: boolean;
  callback?: any;
  isShowSegments?: boolean;
  isShowLngLat?: boolean;
  isShowLabel?: boolean;
  isShowAction?: boolean;
}
