import OlBase from "@/utils/map/ol/base";
import xyzLayers from "@/utils/map/ol/xyzLayers";
import type { XYZOptions } from "@/utils/map/ol/xyzLayersTypes";

import bingmapsLayers from "@/utils/map/ol/bingmapLayers";
import type { BingMapsOptions } from "@/utils/map/ol/bingmapLayersTypes";

import mapboxLayers from "@/utils/map/ol/mapboxLayers";
import type { MapboxOptions } from "@/utils/map/ol/mapboxLayersTypes";

import OlStaticImageLayers from "@/utils/map/ol/imageBasicLayers";
// import OlStaticImageLayers from "@/utils/map/ol/imageLayers";
import type { StaticImageOptions } from "@/utils/map/ol/imageLayersTypes";

import OpenLayersMapEvent from "@/utils/map/ol/mapEvent";
import type { EventOptions } from "@/utils/map/ol/mapEventTypes";
import OpenLayersViewEvent from "@/utils/map/ol/mapViewEvent";

import OpenLayerVueNodePopup from "@/utils/map/ol/vueNodePopupLayers";
import type { VueNodeOptions } from "@/utils/map/ol/vueNodePopupLayersTypes";

import OpenLayersPopup from "@/utils/map/ol/popupLayers";
import type { PopupOption } from "@/utils/map/ol/popupLayersTypes";

import { mapXYZUrl, bingmapImagerySet, mapboxLocalStyle } from "@/utils/map/sourceUrl";
import { defaultMapOptions } from "@/utils/map/geoConstant";

import {
  gaodeMap,
  googleMap,
  bingMap,
  bingLightMap,
  mapboxBasic,
  mapboxAllBlue,
  popupType,
  tiandituVec,
  tiandituVecZhLabel,
  tiandituVecEnLabel,
  tiandituImg,
  tiandituImgZhLabel,
  tiandituImgEnLable,
  tiandituTer,
  tiandituTerLabel,
} from "./MapConst";

import { nanoid } from "nanoid";

export default class OlMapHelper extends OlBase {
  private __bgLayers: any = null; // 底图
  private __funcLayers: any = null; // 功能图层
  public XYZIns: xyzLayers | null = null;
  public BingmapIns: bingmapsLayers | null = null;
  public ImageMapIns: OlStaticImageLayers | null = null;
  public mapboxLayerIns: mapboxLayers | null = null;

  public vuePopupIns: OpenLayerVueNodePopup | null = null;
  public AppPopupIns: OpenLayersPopup | null = null;
  public mapEventIns: OpenLayersMapEvent | null = null;
  public viewEventIns: OpenLayersViewEvent | null = null;

  private __mapEventsMap: any = null;
  private __viewEventsMap: any = null;

  private __popupInsMap: any = null;
  private __vuepopupInsMap: any = null;

  private __tiandituVecXYZOptions: XYZOptions = {
    url: mapXYZUrl.tiandi_spm_vec,
    id: tiandituVec,
    name: tiandituVec,
    zIndex: 1,
    extent: [],
    wrapX: true,
  };

  private __tiandituVecZhXYZOptions: XYZOptions = {
    url: mapXYZUrl.tiandi_spm_vec_zh_label,
    id: tiandituVecZhLabel,
    name: tiandituVecZhLabel,
    zIndex: 2,
    extent: [],
    wrapX: true,
  };

  private __tiandituVecEnXYZOptions: XYZOptions = {
    url: mapXYZUrl.tiandi_spm_vec_en_label,
    id: tiandituVecEnLabel,
    name: tiandituVecEnLabel,
    zIndex: 2,
    extent: [],
    wrapX: true,
  };

  private __tiandituImgXYZOptions: XYZOptions = {
    url: mapXYZUrl.tiandi_spm_img,
    id: tiandituImg,
    name: tiandituImg,
    zIndex: 1,
    extent: [],
    wrapX: true,
  };

  private __tiandituImgZhXYZOptions: XYZOptions = {
    url: mapXYZUrl.tiandi_spm_img_zh_label,
    id: tiandituImgZhLabel,
    name: tiandituImgZhLabel,
    zIndex: 2,
    extent: [],
    wrapX: true,
  };

  private __tiandituImgEnXYZOptions: XYZOptions = {
    url: mapXYZUrl.tiandi_spm_img_en_label,
    id: tiandituImgEnLable,
    name: tiandituImgEnLable,
    zIndex: 2,
    extent: [],
    wrapX: true,
  };

  private __tiandituTerXYZOptions: XYZOptions = {
    url: mapXYZUrl.tiandi_spm_ter,
    id: tiandituTer,
    name: tiandituTer,
    zIndex: 1,
    extent: [],
    wrapX: true,
  };

  private __tiandituTerLabelXYZOptions: XYZOptions = {
    url: mapXYZUrl.tiandi_spm_ter_label,
    id: tiandituTerLabel,
    name: tiandituTerLabel,
    zIndex: 2,
    extent: [],
    wrapX: true,
  };

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
      imagerySet: bingmapImagerySet.AerialWithLabels,
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
    this.ImageMapIns = new OlStaticImageLayers(this);
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
    this.ImageMapIns!.destructor();
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

  public __addTiandituVecXYZLayer() {
    if (this.__bgLayers.has(tiandituVec)) {
      this.XYZIns!.showHiddenLayerByID(tiandituVec, true);
    } else {
      const isAdded = this.XYZIns!.addLayer(this.__tiandituVecXYZOptions);
      if (isAdded) {
        this.__bgLayers.set(tiandituVec, this.__tiandituVecXYZOptions);
      }
    }
  }

  public __hiddenTiandituVecXYZLayer() {
    if (this.__bgLayers.has(tiandituVec)) {
      this.XYZIns!.showHiddenLayerByID(tiandituVec, false);
    }
  }

  public __addTiandituVecZhLabelXYZLayer() {
    if (this.__bgLayers.has(tiandituVecZhLabel)) {
      this.XYZIns!.showHiddenLayerByID(tiandituVecZhLabel, true);
    } else {
      const isAdded = this.XYZIns!.addLayer(this.__tiandituVecZhXYZOptions);
      if (isAdded) {
        this.__bgLayers.set(tiandituVecZhLabel, this.__tiandituVecZhXYZOptions);
      }
    }
  }

  public __hiddenTiandituVecZhLabelXYZLayer() {
    if (this.__bgLayers.has(tiandituVecZhLabel)) {
      this.XYZIns!.showHiddenLayerByID(tiandituVecZhLabel, false);
    }
  }

  public __addTiandituVecEnLabelXYZLayer() {
    if (this.__bgLayers.has(tiandituVecEnLabel)) {
      this.XYZIns!.showHiddenLayerByID(tiandituVecEnLabel, true);
    } else {
      const isAdded = this.XYZIns!.addLayer(this.__tiandituVecEnXYZOptions);
      if (isAdded) {
        this.__bgLayers.set(tiandituVecEnLabel, this.__tiandituVecEnXYZOptions);
      }
    }
  }

  public __hiddenTiandituVecEnLabelXYZLayer() {
    if (this.__bgLayers.has(tiandituVecEnLabel)) {
      this.XYZIns!.showHiddenLayerByID(tiandituVecEnLabel, false);
    }
  }

  public __addTiandituImgXYZLayer() {
    if (this.__bgLayers.has(tiandituImg)) {
      this.XYZIns!.showHiddenLayerByID(tiandituImg, true);
    } else {
      const isAdded = this.XYZIns!.addLayer(this.__tiandituImgXYZOptions);
      if (isAdded) {
        this.__bgLayers.set(tiandituImg, this.__tiandituImgXYZOptions);
      }
    }
  }

  public __hiddenTiandituImgXYZLayer() {
    if (this.__bgLayers.has(tiandituImg)) {
      this.XYZIns!.showHiddenLayerByID(tiandituImg, false);
    }
  }

  public __addTiandituImgZhLabelXYZLayer() {
    if (this.__bgLayers.has(tiandituImgZhLabel)) {
      this.XYZIns!.showHiddenLayerByID(tiandituImgZhLabel, true);
    } else {
      const isAdded = this.XYZIns!.addLayer(this.__tiandituImgZhXYZOptions);
      if (isAdded) {
        this.__bgLayers.set(tiandituImgZhLabel, this.__tiandituImgZhXYZOptions);
      }
    }
  }

  public __hiddenTiandituImgZhLabelXYZLayer() {
    if (this.__bgLayers.has(tiandituImgZhLabel)) {
      this.XYZIns!.showHiddenLayerByID(tiandituImgZhLabel, false);
    }
  }

  public __addTiandituImgEnLabelXYZLayer() {
    if (this.__bgLayers.has(tiandituImgEnLable)) {
      this.XYZIns!.showHiddenLayerByID(tiandituImgEnLable, true);
    } else {
      const isAdded = this.XYZIns!.addLayer(this.__tiandituImgEnXYZOptions);
      if (isAdded) {
        this.__bgLayers.set(tiandituImgEnLable, this.__tiandituImgEnXYZOptions);
      }
    }
  }

  public __hiddenTiandituImgEnLabelXYZLayer() {
    if (this.__bgLayers.has(tiandituImgEnLable)) {
      this.XYZIns!.showHiddenLayerByID(tiandituImgEnLable, false);
    }
  }

  public __addTiandituTerXYZLayer() {
    if (this.__bgLayers.has(tiandituTer)) {
      this.XYZIns!.showHiddenLayerByID(tiandituTer, true);
    } else {
      const isAdded = this.XYZIns!.addLayer(this.__tiandituTerXYZOptions);
      if (isAdded) {
        this.__bgLayers.set(tiandituTer, this.__tiandituTerXYZOptions);
      }
    }
  }

  public __hiddenTiandituTerXYZLayer() {
    if (this.__bgLayers.has(tiandituTer)) {
      this.XYZIns!.showHiddenLayerByID(tiandituTer, false);
    }
  }

  public __addTiandituTerLabelXYZLayer() {
    if (this.__bgLayers.has(tiandituTerLabel)) {
      this.XYZIns!.showHiddenLayerByID(tiandituTerLabel, true);
    } else {
      const isAdded = this.XYZIns!.addLayer(this.__tiandituTerLabelXYZOptions);
      if (isAdded) {
        this.__bgLayers.set(tiandituTerLabel, this.__tiandituTerLabelXYZOptions);
      }
    }
  }

  public __hiddenTiandituTerLabelXYZLayer() {
    if (this.__bgLayers.has(tiandituTerLabel)) {
      this.XYZIns!.showHiddenLayerByID(tiandituTerLabel, false);
    }
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
    this.__hiddenTiandituVecXYZLayer();
    this.__hiddenTiandituVecZhLabelXYZLayer();
    this.__hiddenTiandituVecEnLabelXYZLayer();

    this.__hiddenTiandituImgXYZLayer();
    this.__hiddenTiandituImgZhLabelXYZLayer();
    this.__hiddenTiandituImgEnLabelXYZLayer();

    this.__hiddenTiandituTerXYZLayer();
    this.__hiddenTiandituTerLabelXYZLayer();

    this.__hiddenGaodeXYZLayer();
    this.__hiddenGoogleXYZLayer();
    this.__hiddenBingmapLayer(bingMap);
    this.__hiddenBingmapLayer(bingLightMap);
    this.__hiddenMapboxStyleLayer();
    switch (id) {
      case tiandituVecZhLabel: {
        this.__addTiandituVecXYZLayer();
        this.__addTiandituVecZhLabelXYZLayer();
        break;
      }
      case tiandituVecEnLabel: {
        this.__addTiandituVecXYZLayer();
        this.__addTiandituVecEnLabelXYZLayer();
        break;
      }
      case tiandituImgZhLabel: {
        this.__addTiandituImgXYZLayer();
        this.__addTiandituImgZhLabelXYZLayer();
        break;
      }
      case tiandituImgEnLable: {
        this.__addTiandituImgXYZLayer();
        this.__addTiandituImgEnLabelXYZLayer();
        break;
      }
      case tiandituTerLabel: {
        this.__addTiandituTerXYZLayer();
        this.__addTiandituTerLabelXYZLayer();

        // 下面的测试从图上显示看也可以，
        // 不知道官网为什么有个单独 terrain 的Label 但又不分中英文。
        // this.__addTiandituVecEnLabelXYZLayer();
        break;
      }
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

  public addImagesLayer(options: StaticImageOptions) {
    if (options) {
      const isAdded = this.ImageMapIns!.addLayer(options);
      if (isAdded) {
        this.__funcLayers.set(options, this.ImageMapIns);
      }
    }
  }

  public removeImagesLayer(options: StaticImageOptions) {
    if (options) {
      const funcLayersKeys = this.__funcLayers.keys();
      console.log(funcLayersKeys);
      for (const [key, valueHandle] of this.__funcLayers.entries()) {
        console.log("id", options.id, key.id);
        if (options.id == key.id) {
          valueHandle.removeLayer(key);
          this.__funcLayers.delete(key);
          break;
        }
      }
      console.log("removeImagesLayer", this.__funcLayers);
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

  public mapEventTest() {
    if (this.mapEventIns) {
      // const eventArray = ['singleclick', 'click', 'dblclick', 'moveend', 'movestart', 'pointerdrag', 'pointermove', 'error']
      const eventArray = [
        "change",
        "change:layerGroup",
        "change:size",
        "change:target",
        "change:view",
        "click",
        "dblclick",
        "error",
        "loadend",
        "loadstart",
        "moveend",
        "movestart",
        "pointerdrag",
        "pointermove",
        "postcompose",
        "postrender",
        "precompose",
        "propertychange",
        "rendercomplete",
        "singleclick",
      ];
      eventArray.forEach((eventname) => {
        const eventOptions: EventOptions = {
          id: eventname,
          type: eventname,
          cb: (event: any) => {
            // console.log(`${eventname} cb`, event.coordinate)
            // console.log(`${eventname} cb`, this.mapEventIns?.handle?.getInteractions())
            console.log(`${eventname} cb`);
          },
          debounce: false,
        };
        this.mapEventIns!.addEvent(eventOptions);
      });
    }
  }

  // // not work, event to reference!!!!
  // public addWindLayer(options:WindOptions) {
  // 	const windFieldOption = {
  // 		isAdded: false,
  // 		wind: {
  // 			data: windData,
  // 			id: "windBg",
  // 			name: "windBg",
  // 			extent: [],
  // 			windOptions: null
  // 		},
  // 		pointerdragEvent: {
  // 			id: "pointerdrag_wind",
  // 			type: 'pointerdrag',
  // 			cb: (event:any) => {
  // 				console.log(`pointerdrag_wind`)
  // 				this.removeWinderFieldLayer(windFieldOption.wind)
  // 			},
  // 			debounce: true,
  // 			delay: 300,
  // 			debounceOption: {
  // 				'leading': true,
  // 				'trailing': false
  // 			}
  // 		},
  // 		movestartEvent: {
  // 			id: "movestart_wind",
  // 			type: 'movestart',
  // 			cb: (event:any) => {
  // 				console.log(`movestart_wind`)
  // 			},
  // 			debounce: true,
  // 			delay: 10,
  // 			debounceOption: {
  // 				'leading': true,
  // 				'trailing': false
  // 			}
  // 		},
  // 		moveendEvent: {
  // 			id: "moveend_wind",
  // 			type: 'moveend',
  // 			cb: (event:any) => {
  // 				console.log(`moveend_wind`)
  // 			},
  // 			debounce: true,
  // 			delay: 10,
  // 			debounceOption: {
  // 				'leading': false,
  // 				'trailing': true
  // 			}
  // 		}
  // 	}

  // 	this.mapEventIns!.addEvent(windFieldOption.pointerdragEvent)
  // 	this.mapEventIns!.addEvent(windFieldOption.movestartEvent)
  // 	this.mapEventIns!.addEvent(windFieldOption.moveendEvent)
  // 	this.fixViewMoveendEvent(true)
  // 		this.fixViewMoveendEvent(false)
  // }

  // end class
}
