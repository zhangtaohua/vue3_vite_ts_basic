export interface StyleColorOptions {
  color: string | Array<number>;
  fillColor?: string | Array<number>;
  radius?: number;
}

export interface StyleStrokeOptions extends StyleColorOptions {
  width: number;
  lineDash?: string | Array<number>;
}

export interface StyleTextOptions extends StyleStrokeOptions {
  text: string;
  font?: string;
  padding?: Array<number>;
  textBaseline?: string;
  offsetX?: number;
  offsetY?: number;
  fontSize?: number;
  rotation?: number;
}

export interface StyleShapeOptions extends StyleStrokeOptions {
  radius: number;
  radius1?: number;
  radius2?: number;
  points?: number;
  angle?: number;
  scale?: Array<number>;
  rotation?: number;
}

export interface StyleIconOptions {
  url: any;
  scale?: number;
  offset?: Array<number>;
  radius?: number;
  radius2?: number;
  color?: string | Array<number>;
  fillColor?: string | Array<number>;
  iconAnchor?: Array<number>;
  iconOffset?: Array<number>;
  rotation?: number;
}
