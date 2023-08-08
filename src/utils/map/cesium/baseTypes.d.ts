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
