import type { StaticImageOptions } from "@/utils/map/ol/imageLayersTypes";

export interface MapImageOptions extends StaticImageOptions {
  isPopup?: boolean;
  popupType?: string;
  htmlString: string;
  vNode?: any;
  vNodeData?: any;
  position?: Array<number>;
  eventType?: string;
  $t?: any;
}
