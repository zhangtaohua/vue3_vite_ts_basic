import { UrlTemplateImageryProvider } from "cesium";

export interface UrlTemplateOptions extends UrlTemplateImageryProvider.ConstructorOptions {
  id: string;
  url: string;
  name?: string;
  zIndex?: number;
  extent?: Array<number>;
  minZoom?: number;
  maxZoom?: number;
}
