import type { WebMapTileServiceImageryProvider } from "cesium";

export interface WMTSOptions extends WebMapTileServiceImageryProvider.ConstructorOptions {
  id: string;
  url: string;
  name?: string;
  zIndex?: number;
  extent?: Array<number>;
  minZoom?: number;
  maxZoom?: number;
}
