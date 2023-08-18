import { CsPopupOptions, CsScreenEventOptions, CsEntityLabelOptions } from "./baseTypes";
export interface SatelliteOrbitOptions {
  id: string;
  tle1: string;
  tle2: string;
  startTime: any;
  endTime: any;
  timeInterval: number;
  name?: string;
  zIndex?: number;
  extent?: Array<number>;
  wrapX?: boolean;
  style?: any;
  styleFunction?: any;
  isShowSat?: boolean;
  satStyle?: any;
  satStyleFunction?: any;
  oldOrbitStyle?: any;
  oldOribtStyleFunction?: any;
  multiplier?: number;
  model?: any;
  scan?: any;
  popup?: CsPopupOptions;
  event?: CsScreenEventOptions;
}
