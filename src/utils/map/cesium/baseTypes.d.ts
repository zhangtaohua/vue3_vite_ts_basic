export interface PskyboxSource {
  positiveX: String;
  negativeX: String;
  positiveY: String;
  negativeY: String;
  positiveZ: String;
  negativeZ: String;
}

export interface cesiumBasicOptions {
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
