import OpenLayersBase from "@/utils/map/ol/base";
import xyzLayers from "@/utils/map/ol/xyzLayers";
import windLayers from "@/utils/map/ol/windLayers";
import xmlWmtsLayers from "@/utils/map/ol/xmlWmtsLayers";
import geojsonLayers from "@/utils/map/ol/geojsonLayers";
import { mapXYZUrl } from "@/utils/map/ol/sourceUrl";
import OpenLayersMapEvent from "@/utils/map/ol/mapEvent";
import OpenLayersViewEvent from "@/utils/map/ol/mapViewEvent";
import OpenLayerVueNodePopup from "@/utils/map/ol/vueNodePopupLayers";
import OpenLayersPopup from "@/utils/map/ol/popupLayers";

import { createIconImagePoint } from "@/utils/map/ol/style";
import { getCorrdinateLongitudeLatitude } from "@/utils/map/ol/olTools";

import { nanoid } from "nanoid";

import windData from "@/assets/json/windNew.json";

const windCloud = "windCloud";
const typhoon = "typhoon";
const meteorological = "meteorological";
const windField = "windField";
const location = "location";
const gaodeMap = "gaode";
const googleMap = "google";

export default class OlMapHelper extends OpenLayersBase {
  private __bgLayers: any = null;
  private __funcLayers: any = null;
  public XYZIns: xyzLayers | null = null;
  public WindIns: windLayers | null = null;
  public XMLWMTSIns: xmlWmtsLayers | null = null;
  public GeojsonIns: geojsonLayers | null = null;
  public AppPopupIns: OpenLayersPopup | null = null;
  public mapEventIns: OpenLayersMapEvent | null = null;
  public viewEventIns: OpenLayersViewEvent | null = null;
  private __mapEvents: any = null;
  private __viewEvents: any = null;
  private __popupIns: any = null;

  private __firePointImageUrl: any = null;
  private MapFirePointInfoVue: any = null;

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

  constructor(target: string, pixelRatio = 2) {
    super(target, pixelRatio);
    this.__bgLayers = new Map();
    this.__funcLayers = new Map();
    this.__mapEvents = new Map();
    this.__viewEvents = new Map();
    this.__popupIns = new Map();
    this.XYZIns = new xyzLayers(this);
    this.WindIns = new windLayers(this);
    this.XMLWMTSIns = new xmlWmtsLayers(this);
    this.GeojsonIns = new geojsonLayers(this);
    this.mapEventIns = new OpenLayersMapEvent(this);
    this.viewEventIns = new OpenLayersViewEvent(this);
    this.AppPopupIns = new OpenLayersPopup(this);
  }

  public destructor() {
    this.XYZIns!.destructor();
    this.WindIns!.destructor();
    this.XMLWMTSIns!.destructor();
    this.GeojsonIns!.destructor();
    this.AppPopupIns!.destructor();
    this.mapEventIns!.destructor();
    this.viewEventIns!.destructor();
    this.__bgLayers = null;
    this.__funcLayers = null;
    this.__mapEvents = null;
    this.__viewEvents = null;
    this.__popupIns = null;
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

  public setProperty(key, value) {
    console.log("setProperty", key, value);
    this[key] = value;
  }

  public hiddenAllXYZLayer() {
    if (this.__bgLayers && this.__bgLayers.size) {
      for (const key of this.__bgLayers.keys()) {
        this.XYZIns!.showHiddenLayerByID(key, false);
      }
      return true;
    } else {
      return false;
    }
  }

  public addBgXYZLayer(id: string) {
    // 先隐藏google map
    this.hiddenAllXYZLayer();
    switch (id) {
      case gaodeMap: {
        this.__addGaodeXYZLayer();
        break;
      }
      case googleMap: {
        this.__addGoogleXYZLayer();
        break;
      }
      default: {
        break;
      }
    }
  }

  public addWindLayer(options: WindOptions) {
    const wind = {
      data: windData,
      id: "windBg",
      name: "windBg",
      extent: [],
      windOptions: null,
    };
    const isAdded = this.WindIns!.addLayer(wind);
    const saveOption = {
      ...wind,
      data: null,
    };
    if (isAdded) {
      this.__funcLayers.set(saveOption, this.WindIns);
    }
  }

  public addWindCloudLayer(options: XMLWMTSOptions) {
    if (options) {
      options.id = options.mapFunc + "_" + nanoid(10);
      options.name = options.mapFunc;
      options.zIndex = 0;
      options.wrapX = true;
      options.opacity = 0.5;
      options.extent = [];
      const isAdded = this.XMLWMTSIns!.addLayer(options);
      const saveOption = {
        ...options,
        data: null,
      };
      if (isAdded) {
        this.__funcLayers.set(saveOption, this.XMLWMTSIns);
      }
    }
  }

  public addFuncXYZLayer(options: any) {
    if (options) {
      options.id = options.mapFunc + "_" + nanoid(10);
      options.name = options.mapFunc;
      options.wrapX = true;
      options.opacity = 0.5;
      options.minZoom = options.data.minzoom ? options.data.minzoom : 1;
      options.maxZoom = options.data.maxzoom;
      options.extent = options.data.bounds;
      const tileUrl = options.data.tiles ? options.data.tiles[0] : "";
      if (!tileUrl) {
        return;
      }
      options.url = tileUrl;
      const isAdded = this.XYZIns!.addLayer(options);
      const saveOption = {
        ...options,
        data: null,
      };
      if (isAdded) {
        this.__funcLayers.set(saveOption, this.XYZIns);
      }
    }
  }

  firePointStyleFunc = (feature) => {
    let featrueType = "grass";
    let imageUrl = "";
    featrueType = "grass";
    // if(feature.get('Grass')) {
    // 	featrueType = 'grass'
    // }
    if (feature.get("Forest")) {
      featrueType = "forest";
    } else if (feature.get("Cloud_edge")) {
      featrueType = "cloud";
    } else if (feature.get("Others")) {
      featrueType = "other";
    }
    imageUrl = this.__firePointImageUrl[featrueType];

    const styleOptions = {
      url: imageUrl,
      scale: 1.2,
    };
    return createIconImagePoint(styleOptions);
  };

  public removePopupInsById(id: any) {
    if (this.__popupIns.has(id)) {
      const firePopupIns = this.__popupIns.get(id);
      firePopupIns.destructor();
      this.__popupIns.delete(id);
    }
  }

  public removeFirePointLayerEvent() {
    const id = "pointermove_fire";
    if (this.__mapEvents.has(id)) {
      this.mapEventIns?.removeEventByID(id);
      this.__mapEvents.delete(id);
    }
  }

  public changeLocation() {
    const { longitude, latitude, zoom, rotate } = starwizConfig.map;
    this.setRotation(rotate);
    this.flyToZoomPosition(longitude, latitude, zoom);
  }

  public addFuncLayer(id: string, options: any) {
    if (options.isLoaded && id === location) {
      this.changeLocation();
      return;
    }
    // 清除所有 功能图层
    this.clearFuncLayer();
    // this.removeFirePointLayerEvent()
    this.clearMapEvent();
    const popupId = "firepoint_popup";
    // #ifdef APP-PLUS
    if (this.AppPopupIns) {
      this.AppPopupIns.removeLayerByID(popupId);
    }
    // #endif
    if (options.isLoaded) {
      switch (id) {
        case windCloud: {
          this.addFuncXYZLayer(options);
          break;
        }
        case typhoon: {
          break;
        }
        case meteorological: {
          this.addFuncXYZLayer(options);
          break;
        }
        case windField: {
          this.addWindLayer(options);
          break;
        }
        default: {
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

  public clearMapEvent() {
    if (this.__mapEvents && this.__mapEvents.size) {
      for (const [key, valueHandle] of this.__mapEvents.entries()) {
        this.mapEventIns.removeEventByID(key);
      }
      this.__mapEvents.clear();
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
          cb: (event) => {
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
