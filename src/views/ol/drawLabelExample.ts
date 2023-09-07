import OlBase from "@/utils/map/ol/base";
import xyzLayers from "@/utils/map/ol/xyzLayers";
import type { XYZOptions } from "@/utils/map/ol/xyzLayersTypes";

import bingmapsLayers from "@/utils/map/ol/bingmapLayers";
import type { BingMapsOptions } from "@/utils/map/ol/bingmapLayersTypes";

import mapboxLayers from "@/utils/map/ol/mapboxLayers";
import type { MapboxOptions } from "@/utils/map/ol/mapboxLayersTypes";

import drawLabelLayers from "@/utils/map/ol/drawLabelLayers";
import type { DrawLabelOptions } from "@/utils/map/ol/drawLabelLayersTypes";

import OpenLayersMapEvent from "@/utils/map/ol/mapEvent";
import type { EventOptions } from "@/utils/map/ol/mapEventTypes";
import OpenLayersViewEvent from "@/utils/map/ol/mapViewEvent";

import OpenLayerVueNodePopup from "@/utils/map/ol/vueNodePopupLayers";
import type { VueNodeOptions } from "@/utils/map/ol/vueNodePopupLayersTypes";

import OpenLayersPopup from "@/utils/map/ol/popupLayers";
import type { PopupOption } from "@/utils/map/ol/popupLayersTypes";

import { mapXYZUrl, bingmapImagerySet, mapboxLocalStyle } from "@/utils/map/sourceUrl";
import { defaultMapOptions } from "@/utils/map/geoConstant";

import { gaodeMap, googleMap, bingMap, bingLightMap, mapboxBasic, mapboxAllBlue, popupType } from "./MapConst";

import { nanoid } from "nanoid";

export default class OlDrawHelper extends OlBase {
  private __bgLayers: any = null; // 底图
  private __funcLayers: any = null; // 功能图层
  public XYZIns: xyzLayers | null = null;
  public BingmapIns: bingmapsLayers | null = null;
  public DrawIns: drawLabelLayers | null = null;
  public mapboxLayerIns: mapboxLayers | null = null;

  public vuePopupIns: OpenLayerVueNodePopup | null = null;
  public AppPopupIns: OpenLayersPopup | null = null;
  public mapEventIns: OpenLayersMapEvent | null = null;
  public viewEventIns: OpenLayersViewEvent | null = null;

  private __mapEventsMap: any = null;
  private __viewEventsMap: any = null;

  private __popupInsMap: any = null;
  private __vuepopupInsMap: any = null;

  private __gaodeXYZOptions: XYZOptions = {
    url: mapXYZUrl.aMap_vec,
    id: gaodeMap,
    name: gaodeMap,
    zIndex: 1,
    extent: [],
    wrapX: true,
  };

  private __googleXYZOptions: XYZOptions = {
    url: mapXYZUrl.google_vec,
    id: googleMap,
    name: googleMap,
    zIndex: 1,
    extent: [],
    wrapX: true,
  };

  private __bingMapOptions = {
    [bingMap]: {
      id: `${bingMap}_Aerial`,
      name: `${bingMap}_Aerial`,
      imagerySet: bingmapImagerySet.Aerial,
      zIndex: 1,
      extent: [],
      wrapX: true,
    },
    [bingLightMap]: {
      id: `${bingMap}_CanvasLight`,
      name: `${bingMap}_CanvasLight`,
      imagerySet: bingmapImagerySet.CanvasLight,
      zIndex: 1,
      extent: [],
      wrapX: true,
    },
  };

  private __mapboxStyleOptions = {
    [mapboxBasic]: {
      id: "mapboxBasic",
      url: mapboxLocalStyle.basic,
      isRemoveOld: true,
    },
    [mapboxAllBlue]: {
      id: "mapboxAllBlue",
      url: mapboxLocalStyle.all_blue,
      isRemoveOld: true,
    },
  };

  constructor(target: string, pixelRatio = 2) {
    super(target, pixelRatio);
    this.__bgLayers = new Map();
    this.__funcLayers = new Map();
    this.__mapEventsMap = new Map();
    this.__viewEventsMap = new Map();
    this.__popupInsMap = new Map();
    this.__vuepopupInsMap = new Map();

    this.XYZIns = new xyzLayers(this);
    this.BingmapIns = new bingmapsLayers(this);
    this.DrawIns = new drawLabelLayers(this);
    this.mapboxLayerIns = new mapboxLayers(this);

    this.mapEventIns = new OpenLayersMapEvent(this);
    this.viewEventIns = new OpenLayersViewEvent(this);
    this.AppPopupIns = new OpenLayersPopup(this);
    this.vuePopupIns = new OpenLayerVueNodePopup(this);
  }

  public destructor() {
    this.AppPopupIns!.destructor();
    this.vuePopupIns!.destructor();
    this.mapEventIns!.destructor();
    this.viewEventIns!.destructor();

    this.mapboxLayerIns!.destructor();
    this.DrawIns!.destructor();
    this.BingmapIns!.destructor();
    this.XYZIns!.destructor();
    this.__bgLayers = null;
    this.__funcLayers = null;
    this.__mapEventsMap = null;
    this.__viewEventsMap = null;
    this.__popupInsMap = null;
    this.__vuepopupInsMap = null;
    super.destructor();
  }

  public __addGaodeXYZLayer() {
    if (this.__bgLayers.has(gaodeMap)) {
      this.XYZIns!.showHiddenLayerByID(gaodeMap, true);
    } else {
      const isAdded = this.XYZIns!.addLayer(this.__gaodeXYZOptions);
      if (isAdded) {
        this.__bgLayers.set(gaodeMap, this.__gaodeXYZOptions);
      }
    }
  }

  public __hiddenGaodeXYZLayer() {
    if (this.__bgLayers.has(gaodeMap)) {
      this.XYZIns!.showHiddenLayerByID(gaodeMap, false);
    }
  }

  public __addGoogleXYZLayer() {
    if (this.__bgLayers.has(googleMap)) {
      this.XYZIns!.showHiddenLayerByID(googleMap, true);
    } else {
      const isAdded = this.XYZIns!.addLayer(this.__googleXYZOptions);
      if (isAdded) {
        this.__bgLayers.set(googleMap, this.__googleXYZOptions);
      }
    }
  }

  public __hiddenGoogleXYZLayer() {
    if (this.__bgLayers.has(googleMap)) {
      this.XYZIns!.showHiddenLayerByID(googleMap, false);
    }
  }

  public __addBingmapLayer(bingType: string) {
    if (this.__bgLayers.has(bingType)) {
      const id = this.__bingMapOptions[bingType].id;
      this.BingmapIns!.showHiddenLayerByID(id, true);
    } else {
      const isAdded = this.BingmapIns!.addLayer(this.__bingMapOptions[bingType]);
      if (isAdded) {
        this.__bgLayers.set(bingType, this.__bingMapOptions[bingType]);
      }
    }
  }

  public __hiddenBingmapLayer(bingType: string) {
    if (this.__bgLayers.has(bingType)) {
      const id = this.__bingMapOptions[bingType].id;
      this.BingmapIns!.showHiddenLayerByID(id, false);
    }
  }

  public __addMapboxStyleLayer(mapboxType: string) {
    this.mapboxLayerIns!.addLayer(this.__mapboxStyleOptions[mapboxType]);
  }

  public __hiddenMapboxStyleLayer() {
    this.mapboxLayerIns?.clearLayer();
  }

  public addBgLayer(id: string) {
    // 先隐藏map
    this.__hiddenGaodeXYZLayer();
    this.__hiddenGoogleXYZLayer();
    this.__hiddenBingmapLayer(bingMap);
    this.__hiddenBingmapLayer(bingLightMap);
    this.__hiddenMapboxStyleLayer();
    switch (id) {
      case gaodeMap: {
        this.__addGaodeXYZLayer();
        break;
      }
      case googleMap: {
        this.__addGoogleXYZLayer();
        break;
      }
      case bingMap: {
        this.__addBingmapLayer(bingMap);
        break;
      }
      case bingLightMap: {
        this.__addBingmapLayer(bingLightMap);
        break;
      }
      case mapboxBasic: {
        this.__addMapboxStyleLayer(mapboxBasic);
        break;
      }
      case mapboxAllBlue: {
        this.__addMapboxStyleLayer(mapboxAllBlue);
        break;
      }
      default: {
        break;
      }
    }
  }

  public changeLocation() {
    const { longitude, latitude, zoom, rotate } = defaultMapOptions;
    this.setRotation(rotate);
    this.flyToPositionAndZoom(longitude, latitude, zoom);
  }

  public draw(options: DrawLabelOptions) {
    return this.DrawIns!.drawShape(options);
  }

  public clearDraw() {
    this.DrawIns!.clearAllDrawShape();
    this.DrawIns!.removeallInteraction();
  }

  public getGeojsonData() {
    const allGeojson = this.DrawIns!.getAllDrawData();
    console.log("getGeojsonData", allGeojson);
  }

  public saveGeojsonData() {
    this.DrawIns!.saveAllDrawData();
  }

  public addGeojsonData(options: any) {
    this.DrawIns!.addGeojsonData(options);
  }

  public removeGeojsonData(options: any) {
    this.DrawIns!.removeGeojsonData(options);
  }

  public removeDrawLayer(options: DrawLabelOptions) {
    if (options) {
      for (const [key, valueHandle] of this.__funcLayers.entries()) {
        if (options.id == key.id) {
          valueHandle.removeLayer(key);
          this.__funcLayers.delete(key);
          break;
        }
      }
    }
  }

  public clearFuncLayer() {
    if (this.__funcLayers && this.__funcLayers.size) {
      for (const [key, valueHandle] of this.__funcLayers.entries()) {
        valueHandle.removeLayer(key);
      }
      this.__funcLayers.clear();
      return true;
    } else {
      return false;
    }
  }

  public removePopupInsById(id: any) {
    if (this.__popupInsMap.has(id)) {
      const firePopupIns = this.__popupInsMap.get(id);
      firePopupIns.destructor();
      this.__popupInsMap.delete(id);
    }
  }

  public clearMapEvent() {
    if (this.__mapEventsMap && this.__mapEventsMap.size) {
      for (const [key, valueHandle] of this.__mapEventsMap.entries()) {
        this.mapEventIns!.removeEventByID(key);
      }
      this.__mapEventsMap.clear();
      return true;
    } else {
      return false;
    }
  }

  // end class
}
