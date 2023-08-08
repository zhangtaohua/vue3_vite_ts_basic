import { CsPopupOptions, CsScreenEventOptions, CsEntityLabelOptions } from "./baseTypes";

export interface Drawptions {
  id: string;
  geojson: any;
  name?: string;
  show?: boolean;
  label?: CsEntityLabelOptions;
  popup?: CsPopupOptions;
  event?: CsScreenEventOptions;
  styleFunction?: any;
  style?: any;
}
