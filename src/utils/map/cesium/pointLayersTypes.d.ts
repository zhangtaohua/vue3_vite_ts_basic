import { CsPopupOptions, CsScreenEventOptions, CsEntityLabelOptions } from "./baseTypes";

export interface PointOneOptions {
  show?: boolean;
  pixelSize?: number; // 1
  heightReference?: any; // HeightReference.NONE
  color?: any;
  outlineColor?: any;
  outlineWidth?: number; // 0
  scaleByDistance?: any;
  translucencyByDistance?: any;
  distanceDisplayCondition?: any;
  disableDepthTestDistance?: any;
}

export interface PointOptions {
  id: string;
  position: Array<number>; // [0, 0, 0]
  point: PointOneOptions;
  name?: string;
  show?: boolean;
  label?: CsEntityLabelOptions;
  popup?: CsPopupOptions;
  event?: CsScreenEventOptions;
}
