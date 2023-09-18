import { Map as olMap } from "ol";
import { getCenter } from "ol/extent";
import Polygon from "ol/geom/Polygon.js";
import Feature from "ol/Feature";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { transform, transformExtent, fromLonLat, getTransform, getPointResolution } from "ol/proj";
import { getDistance } from "ol/sphere";

import GeoImage from "ol-ext/source/GeoImage";
import GeoImageLayer from "ol-ext/layer/GeoImage";

import { transparentPolygonStyle } from "./style";

import { nanoid } from "nanoid";

import OlBase from "./base";
import {
  transformExtentTo3857,
  transformRectCoordinatesTo3857,
  getAngleOfNorthFromCoordinates,
  getEastRadiansFromRectCoords,
} from "./olTools";

import { earthExtent, popupType, isCustomizeFlag, customMeta } from "../geoConstant";
import { getRectangleFromExtent, getExtentFromRectCoords, getLbToRuCoordinates } from "../geoCommon";

import type { GeoImageExtOptions } from "./imageGeoExtLayersTypes";

import OpenLayersMapEvent from "./mapEvent";
import type { EventOptions } from "./mapEventTypes";

import OpenLayerVueNodePopup from "./vueNodePopupLayers";
import type { VueNodeOptions } from "./vueNodePopupLayersTypes";

import OpenLayersPopup from "./popupLayers";

import { mapEventType } from "./olConstant";

export default class OlGeoImageExtLayers {
  public olBaseHandle: OlBase | null = null;
  public handle: olMap | null = null;

  public vuePopupIns: OpenLayerVueNodePopup | null = null;
  public normalPopupIns: OpenLayersPopup | null = null;
  public mapEventIns: OpenLayersMapEvent | null = null;

  private __mapEventsMap: any = null;
  private __popupInsMap: any = null;
  private __vuepopupInsMap: any = null;

  private __layers: any = null;
  private __layerIdPrefix = "IMAGE_GEO_";

  constructor(mapBaseIns: OlBase) {
    this.olBaseHandle = mapBaseIns;
    this.handle = mapBaseIns.handle;
    this.__layers = new Map();
    this.__mapEventsMap = new Map();
    this.__popupInsMap = new Map();
    this.__vuepopupInsMap = new Map();

    this.mapEventIns = new OpenLayersMapEvent(mapBaseIns);
    this.normalPopupIns = new OpenLayersPopup(mapBaseIns);
    this.vuePopupIns = new OpenLayerVueNodePopup(mapBaseIns);
  }

  public destructor() {
    this.normalPopupIns!.destructor();
    this.vuePopupIns!.destructor();
    this.mapEventIns!.destructor();

    this.clearLayer();
    this.olBaseHandle = null;
    this.handle = null;

    this.__layers.clear();
    this.__layers = null;
    this.__mapEventsMap = null;
    this.__popupInsMap = null;
    this.__vuepopupInsMap = null;
  }

  private __Id(id: string) {
    return `${this.__layerIdPrefix}${id}`;
  }

  private __Name(name: string) {
    return `${this.__layerIdPrefix}${name}`;
  }

  // 获取图片像素大小
  public checkPicurl = (url: string) => {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img");
      img.src = url;
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight }); //  2064,4608
      };
      img.onerror = function () {
        reject({ width: -1, height: -1 });
      };
    });
  };

  public async createLayer(
    options: GeoImageExtOptions = {
      url: "",
      id: "",
      name: "",
      zIndex: 0,
      extent: earthExtent,
      bbox: [],
      wrapX: true,
      opacity: 1,
      htmlString: "",
    },
  ) {
    if (!options.url || !options.id) {
      return null;
    }
    if (!options.url || !options.id) {
      return null;
    }
    if (options.bbox && !options.bbox.length) {
      return null;
    }
    // [left, bottom, right, top]
    let extent = earthExtent;
    if (options.extent && options.extent.length) {
      if (options.extent.length === 4) {
        extent = options.extent;
      } else if (options.extent.length === 1) {
        extent = getExtentFromRectCoords(options.extent);
      }
    } else {
      extent = getExtentFromRectCoords(options.bbox);
    }
    extent = transformExtentTo3857(extent);

    let name = options.name ? options.name : nanoid(10);
    name = this.__Name(name);
    const id = this.__Id(options.id);
    const zIndex = options.zIndex ? options.zIndex : this.olBaseHandle!.getCurrentzIndex();

    // const polygonPoints = getRectangleFromExtent(extent);
    const polygonPoints = transformRectCoordinatesTo3857(options.bbox);
    const PloygonOptions = {
      geometry: new Polygon(polygonPoints),
      name: name,
      id: id,
      wrapX: options.wrapX,
    };
    const feature = new Feature(PloygonOptions);
    feature.setStyle(transparentPolygonStyle);

    const meta = {
      [isCustomizeFlag]: true,
      [customMeta]: options,
    };

    feature.setProperties(meta);

    const sourceVector = new VectorSource({
      features: [feature],
      wrapX: options.wrapX,
    });
    sourceVector.setProperties(meta);

    const layerVector = new VectorLayer({
      source: sourceVector,
      zIndex: zIndex,
      declutter: true,
    });
    layerVector.setProperties(meta);

    layerVector.set("id", id + "_vector");
    layerVector.set("name", name + "_vector");

    const imgMeta = await this.checkPicurl(options.url);

    let rect: any;
    let imageMask: any;

    if (options.level) {
      if (String(options.level).includes("2") || String(options.level).includes("3")) {
        const rectExtent = getExtentFromRectCoords(options.bbox);
        const rectPoly = getRectangleFromExtent(rectExtent);

        if (rectPoly && rectPoly.length) {
          rect = rectPoly[0];
        }
        const imageMaskPoly = transformRectCoordinatesTo3857(options.bbox);
        if (imageMaskPoly && imageMaskPoly.length) {
          imageMask = imageMaskPoly[0];
        }
      }
    } else {
      rect = options.bbox[0];
    }

    let rotation = 0;
    if (options.isRotation) {
      if (options.rotationInDegree) {
        rotation = (options.rotationInDegree * Math.PI) / 180;
      } else {
        rotation = getAngleOfNorthFromCoordinates(options.bbox);
      }
    }

    // 由于元数据中给的中心点画图有偏移，所以需要根据polygon计算中心点
    const transCenter = getCenter(extent);
    const res = getPointResolution(this.handle.getView().getProjection(), 1, transCenter);
    const widthInMeters = getDistance(rect[0], rect[1]);
    const heigthInMeters = getDistance(rect[0], rect[3]);

    const wScale = widthInMeters / (imgMeta.width * res);
    const hScale = heigthInMeters / (imgMeta.height * res);

    const imageOptions = {
      url: options.url,
      projection: "EPSG:3857",
      imageExtent: extent,
      imageCenter: transCenter,
      imageRotate: rotation, //Number(10*Math.PI/180),
      imageScale: [wScale, hScale],
      // imageCrop: [xmin,ymin,xmax,ymax],
      imageMask: imageMask,
      wrapX: options.wrapX,
    };
    const source = new GeoImage(imageOptions);
    source.setProperties(meta);

    const opacity = options.opacity ? options.opacity : 1;
    const layer = new GeoImageLayer({
      source: source,
      extent: extent,
      zIndex: zIndex + 1,
      opacity: opacity,
    });
    layer.setProperties(meta);
    layer.set("id", id);
    layer.set("name", name);

    const layerObj = {
      options,
      imageOptions,
      source,
      layer,
      layerVector,
    };
    return layerObj;
  }

  public narmalPopupCb = (options: GeoImageExtOptions) => {
    return (event: any) => {
      console.log(`${options.id}_CB`);
      let pixel = event.pixel;
      // let coordinate = event.coordinate
      if (!pixel.length) {
        pixel = this.handle.getEventPixel(event.originalEvent);
      }
      // if(this.handle.hasFeatureAtPixel(pixel)) {}
      const feature = this.handle.forEachFeatureAtPixel(pixel, function (feature: any) {
        const isCustom = feature.get(isCustomizeFlag);
        const metadata = feature.get(customMeta);
        const id = metadata?.id;
        if (isCustom && id === options.id) {
          return feature;
        }
      });

      if (feature) {
        if (options.callback) {
          options.callback(feature, options);
        }
        const center = this.getCenterById(options.id);
        this.normalPopupIns?.showPopupByID(options.id, center, options.htmlString);
      } else {
        if (options.eventType == mapEventType.pointermove) {
          this.normalPopupIns?.hiddenPopupByID(options.id);
        }
      }
    };
  };

  public vNodePopupCb = (options: GeoImageExtOptions) => {
    return (event: any) => {
      let pixel = event.pixel;
      if (!pixel.length) {
        pixel = this.handle.getEventPixel(event.originalEvent);
      }
      const feature = this.handle.forEachFeatureAtPixel(pixel, function (feature: any) {
        const isCustom = feature.get(isCustomizeFlag);
        const metadata = feature.get(customMeta);
        const id = metadata?.id;
        if (isCustom && id === options.id) {
          return feature;
        }
      });

      if (feature) {
        if (options.callback) {
          options.callback(feature, options);
          this.vuePopupIns?.updateLayer(options as VueNodeOptions);
        }
        const center = this.getCenterById(options.id);
        this.vuePopupIns?.showPopupByID(options.id, center);
      } else {
        if (options.eventType == mapEventType.pointermove) {
          this.vuePopupIns?.hiddenPopupByID(options.id);
        }
      }
    };
  };

  public async addLayer(options: GeoImageExtOptions) {
    if (this.handle) {
      const layerObj = await this.createLayer(options);
      if (layerObj) {
        this.handle.addLayer(layerObj.layerVector);
        this.handle.addLayer(layerObj.layer);
        this.__layers.set(this.__Id(options.id), layerObj);
        const delay = options.delay ?? 300;
        const debounce = options.debounce ?? true;
        const debounceOption = options.debounceOption ?? {};
        if (options.isPopup) {
          // 采用普通的popup
          if (options.popupType == popupType.normal) {
            this.normalPopupIns!.addLayer(options);
            // if (isAdded) {
            //   this.__popupInsMap.set(options, this.normalPopupIns);
            // }

            if (options.eventType) {
              const eventOptions: EventOptions = {
                id: options.id,
                type: options.eventType,
                cb: this.narmalPopupCb(options),
                delay,
                debounce,
                debounceOption,
              };
              this.mapEventIns!.addEvent(eventOptions);
            }
          } else if (options.popupType == popupType.vnode) {
            this.vuePopupIns?.addLayer(options as VueNodeOptions);

            if (options.eventType) {
              const eventOptions: EventOptions = {
                id: options.id,
                type: options.eventType,
                cb: this.vNodePopupCb(options),
                delay,
                debounce,
                debounceOption,
              };
              this.mapEventIns!.addEvent(eventOptions);
            }
          }
        }
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public fitToView(options: GeoImageExtOptions) {
    if (this.olBaseHandle) {
      if (options.extent) {
        this.olBaseHandle.fitToExtent(options.extent);
        return true;
      }
    } else {
      return false;
    }
  }

  public hasLayer(options: GeoImageExtOptions) {
    if (this.olBaseHandle && this.__layers.size) {
      return this.__layers.has(this.__Id(options.id));
    }
    return false;
  }

  public hasLayerByID(id: string) {
    if (this.olBaseHandle && this.__layers.size) {
      return this.__layers.has(this.__Id(id));
    }
    return false;
  }

  public removeLayer(options: GeoImageExtOptions) {
    return this.removeLayerByID(options.id);
  }

  public removeLayerByID(id: string) {
    if (this.handle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        this.handle.removeLayer(layerObj.layer);
        this.handle.removeLayer(layerObj.layerVector);
        this.__layers.delete(this.__Id(id));
        if (layerObj.options && layerObj.options.isPopup) {
          if (layerObj.options.popupType == popupType.normal) {
            this.normalPopupIns!.removeLayerByID(id);
            this.mapEventIns!.removeEventByID(id);
          } else if (layerObj.options.popupType == popupType.vnode) {
            this.vuePopupIns!.removeLayerByID(id);
            this.mapEventIns!.removeEventByID(id);
          }
        }
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public clearLayer() {
    if (this.handle && this.__layers.size) {
      // for (let [key, layerObj] of this.__layers.entries()) {
      // 	this.handle.removeLayer(layerObj.layer)
      // }
      this.__layers.forEach((layerObj: any) => {
        this.handle.removeLayer(layerObj.layer);
        this.handle.removeLayer(layerObj.layerVector);
        if (layerObj.options && layerObj.options.isPopup) {
          const id = layerObj.options.id;
          if (layerObj.options.popupType == popupType.normal) {
            this.normalPopupIns!.removeLayerByID(id);
            this.mapEventIns!.removeEventByID(id);
          } else if (layerObj.options.popupType == popupType.vnode) {
            this.vuePopupIns!.removeLayerByID(id);
            this.mapEventIns!.removeEventByID(id);
          }
        }
      });
      this.__layers.clear();
      return true;
    } else {
      return false;
    }
  }

  public setLayerOpacity(options: GeoImageExtOptions, opacity: number) {
    return this.setLayerOpacityByID(options.id, opacity);
  }

  public setLayerOpacityByID(id: string, opacity: number) {
    if (this.olBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        layerObj.layer.setOpacity(opacity);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public showHiddenLayer(options: GeoImageExtOptions, isShow: boolean) {
    return this.showHiddenLayerByID(options.id, isShow);
  }

  public showHiddenLayerByID(id: string, isShow: boolean) {
    if (this.olBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        layerObj.layer.setVisible(isShow);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public getExtent(options: GeoImageExtOptions) {
    return this.getExtentById(options.id);
  }

  public getExtentById(id: string) {
    if (this.olBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        return layerObj.layer.getExtent();
      } else {
        return [];
      }
    } else {
      return [];
    }
  }

  public getCenter(options: GeoImageExtOptions) {
    return this.getCenterById(options.id);
  }

  public getCenterById(id: string) {
    if (this.olBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        const extent = layerObj.layer.getExtent();
        return getCenter(extent);
      } else {
        return [];
      }
    } else {
      return [];
    }
  }
}
