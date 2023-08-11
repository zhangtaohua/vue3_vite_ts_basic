import {
  CsPopupOptions,
  CsScreenEventOptions,
  CsEntityLabelOptions,
  CsEntityEllipseOptions,
  CsEntityPolygonOptions,
  CsEntityPolylineptions,
  CsEntityRectangleOptions,
} from "./baseTypes";

export interface EllipseOptions {
  id: string;
  position: Array<number>; // [0, 0, 0]
  ellipse: CsEntityEllipseOptions;
  name?: string;
  show?: boolean;
  popup?: CsPopupOptions;
  event?: CsScreenEventOptions;
  label?: CsEntityLabelOptions;
}

export interface PolygonOptions {
  id: string;
  position: Array<number>; // [0, 0, 0]
  polygon: CsEntityPolygonOptions;
  name?: string;
  show?: boolean;
  popup?: CsPopupOptions;
  event?: CsScreenEventOptions;
  label?: CsEntityLabelOptions;
}

export interface PolylineOptions {
  id: string;
  position: Array<number>; // [0, 0, 0]
  polyline: CsEntityPolylineptions;
  name?: string;
  show?: boolean;
  popup?: CsPopupOptions;
  event?: CsScreenEventOptions;
  label?: CsEntityLabelOptions;
}

export interface RectangleOptions {
  id: string;
  position: Array<number>; // [0, 0, 0]
  rectangle: CsEntityRectangleOptions;
  name?: string;
  show?: boolean;
  popup?: CsPopupOptions;
  event?: CsScreenEventOptions;
  label?: CsEntityLabelOptions;
}

export interface LabelOptions {
  id: string;
  position: Array<number>; // [0, 0, 0]
  label: CsEntityLabelOptions;
  name?: string;
  show?: boolean;
  popup?: CsPopupOptions;
  event?: CsScreenEventOptions;
}
