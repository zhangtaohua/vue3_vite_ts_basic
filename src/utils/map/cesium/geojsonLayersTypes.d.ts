import { CsPopupOptions, CsScreenEventOptions, CsEntityLabelOptions } from "./baseTypes";

export interface GeojsonOneOptions {
  data: any;
  sourceUri?: string;
  describe?: any;
  markerSize?: number;
  markerSymbol?: string;
  markerColor?: any;
  stroke?: any;
  strokeWidth?: number;
  fill?: any;
  clampToGround?: boolean;
  credit?: any;
  isPointUseMarker?: boolean;
}

export interface GeojsonTopoJSONOptions {
  id: string;
  geojson: GeojsonOneOptions;
  name?: string;
  show?: boolean;
  label?: CsEntityLabelOptions;
  popup?: CsPopupOptions;
  event?: CsScreenEventOptions;
  styleFunction?: any;
  style?: any;
}
