export interface PskyboxSource {
  positiveX: String;
  negativeX: String;
  positiveY: String;
  negativeY: String;
  positiveZ: String;
  negativeZ: String;
}

export interface CesiumBasicOptions {
  language?: string;
  pixelRatio?: number;
  viewMode?: string;
  isShowtimeline?: boolean;
  isShowHelper?: boolean;
  isShowVr?: boolean;
  isShowModePicker?: boolean;
  isShowGeoSearch?: boolean;
  isShowDefHome?: boolean;
  isShowSkyAtmosphere?: boolean;
  isShowFullScreen?: boolean;
  isShowBaseLayerPicker?: boolean;
  isShowSelectionIndicator?: boolean;
  isShowinfoBox?: boolean;
  isShowAnimation?: boolean;
  mapProjection?: any;
  skyBox?: PskyboxSource;
  minZoom?: number;
  maxZoom?: number;
}

export interface CsPopupOptions {
  isPopup?: boolean;
  isUpdate?: boolean;
  popupType?: string;
  vNode?: any;
  vNodeData?: any;
  customT?: any;
  position?: Array<number>;
}

export interface CsScreenEventOptions {
  eventType: string;
  callback?: any;
  modify?: string;
  delay?: number;
  debounce?: boolean;
  debounceOption?: any; // 请参考 lodash 来设置。
}

export interface CsEntityLabelOptions {
  show?: boolean;
  text?: string;
  font?: any;
  style?: any;
  scale?: number;

  showBackground?: boolean;
  backgroundColor?: any;
  backgroundPadding?: any;

  pixelOffset?: any; // Property | Cartesian2
  eyeOffset?: any; // Property | Cartesian3
  horizontalOrigin?: any;
  verticalOrigin?: any;
  heightReference?: any;
  fillColor?: any;
  outlineColor?: any;
  outlineWidth?: any;
  translucencyByDistance?: any;
  pixelOffsetScaleByDistance?: any;
  scaleByDistance?: any;
  distanceDisplayCondition?: any;
  disableDepthTestDistance?: any;
}

export interface CsEntityEllipseOptions {
  show?: boolean;
  semiMajorAxis: number;
  semiMinorAxis: number;
  height?: number;

  heightReference?: any;
  extrudedHeight?: number;
  extrudedHeightReference?: any;

  rotation?: number;
  stRotation?: number;
  granularity?: any;

  fill?: any;
  color?: any;
  material?: any;
  outline?: any;
  outlineColor?: any;
  outlineWidth?: any;
  numberOfVerticalLines?: any;
  shadows?: any;
  distanceDisplayCondition?: any;
  classificationType?: any;
  zIndex?: any;
}

export interface CsEntityPolygonOptions {
  show?: boolean;
  hierarchy: any;
  height?: number;
  heightReference?: any;
  extrudedHeight?: number;
  extrudedHeightReference?: any;

  stRotation?: number;
  granularity?: any;

  fill?: any;
  color?: any;
  material?: any;
  outline?: any;
  outlineColor?: any;
  outlineWidth?: any;
  perPositionHeight?: any;
  closeTop?: any;
  closeBottom?: any;
  arcType?: any;
  shadows?: any;
  distanceDisplayCondition?: any;
  classificationType?: any;
  zIndex?: any;
  textureCoordinates?: any;
}

export interface CsEntityPolylineptions {
  show?: boolean;
  positions: any;
  width?: number;
  granularity?: any;

  color?: any;
  material?: any;
  depthFailMaterial?: any;
  arcType?: any;

  clampToGround?: any;
  shadows?: any;
  distanceDisplayCondition?: any;
  classificationType?: any;
  zIndex?: any;
}

export interface CsEntityRectangleOptions {
  show?: boolean;
  coordinates: any;
  height?: number;
  heightReference?: any;
  extrudedHeight?: number;
  extrudedHeightReference?: any;

  rotation?: number;
  stRotation?: number;
  granularity?: any;

  fill?: any;
  color?: any;
  material?: any;
  outline?: any;
  outlineColor?: any;
  outlineWidth?: any;
  shadows?: any;
  distanceDisplayCondition?: any;
  classificationType?: any;
  zIndex?: any;
}
