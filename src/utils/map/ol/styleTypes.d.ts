export interface StyleColorOptions {
  color: string | Array<number>;
  fillColor?: string | Array<number>;
  radius?: number;
}

export interface StyleStrokeOptions extends StyleColorOptions {
  width: number;
}

export interface StyleTextOptions extends StyleStrokeOptions {
  text: string;
  font?: string;
  padding?: Array<number>;
  textBaseline?: string;
  offsetX?: number;
  offsetY?: number;
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
  scale: number;
  offset?: Array<number>;
}
