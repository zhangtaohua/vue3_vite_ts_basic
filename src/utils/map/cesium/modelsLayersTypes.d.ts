import { CsPopupOptions, CsScreenEventOptions, CsEntityLabelOptions } from "./baseTypes";

export interface ModelOneOptions {
  url: string;
  basePath?: string;
  show?: boolean;
  scale?: number;
  minimumPixelSize?: number;
  maximumScale?: number;
}

export interface ModelsOptions {
  id: string;
  position: Array<number>;
  model: ModelOneOptions;
  name?: string;
  show?: boolean;
  heading?: number;
  pitch?: number;
  roll?: number;
  label?: CsEntityLabelOptions;
  popup?: CsPopupOptions;
  event?: CsScreenEventOptions;
}
