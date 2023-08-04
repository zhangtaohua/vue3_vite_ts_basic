// import { SingleTileImageryProvider } from "cesium";
// export interface UrlTemplateOptions extends SingleTileImageryProvider.ConstructorOptions {

export interface SingleImageOptions {
  id: string;
  url: string;
  extent: Array<number>;
  name?: string;
  zIndex?: number;
  tileWidth?: number;
  tileHeight?: number;
  credit?: any;
  ellipsoid?: any;
}
