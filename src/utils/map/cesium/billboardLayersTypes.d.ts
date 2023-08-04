import { CsPopupOptions, CsScreenEventOptions, CsEntityLabelOptions } from "./baseTypes";

export interface BillboardOneOptions {
  image: string;
  imageSubRegion?: any;
  show?: boolean;
  pixelOffset?: Array<number>; // [0, 0]
  eyeOffset?: Array<number>; // [0, 0, 0]
  heightReference?: any;
  horizontalOrigin?: any;
  verticalOrigin?: any;
  scale?: number;
  color?: any;
  rotation?: number;
  alignedAxis?: Array<number>; // [0, 0, 0]
  width?: number;
  height?: number;
  scaleByDistance?: any;
  translucencyByDistance?: any;
  pixelOffsetScaleByDistance?: any;
  sizeInMeters?: any;
  distanceDisplayCondition?: any;
}

export interface BillboardsOptions {
  id: string;
  position: Array<number>; // [0, 0, 0]
  billboard: BillboardOneOptions;
  name?: string;
  show?: boolean;
  label?: CsEntityLabelOptions;
  popup?: CsPopupOptions;
  event?: CsScreenEventOptions;
}
