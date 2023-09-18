import { Map as olMap } from "ol";
import { getCenter } from "ol/extent";
import { transform, transformExtent, fromLonLat, getTransform, getPointResolution } from "ol/proj";
import { getDistance } from "ol/sphere";

import GeoImage from "ol-ext/source/GeoImage";
import GeoImageLayer from "ol-ext/layer/GeoImage";

import { nanoid } from "nanoid";

import OlBase from "./base";
import { transformExtentTo3857, transformRectCoordinatesTo3857, getAngleOfNorthFromCoordinates } from "./olTools";
import type { GeoImageBasicExtOptions } from "./imageGeoBasicExtLayersTypes";

import { earthExtent, isCustomizeFlag, customMeta } from "../geoConstant";
import { getRectangleFromExtent, getExtentFromRectCoords, getLbToRuCoordinates } from "../geoCommon";

export default class OlGeoImageBasicExtLayers {
  public olBaseHandle: OlBase | null = null;
  public handle: olMap | null = null;
  private __layers: any = null;
  private __layerIdPrefix = "IMAGE_GEO_BASIC_";

  constructor(mapBaseIns: OlBase) {
    this.olBaseHandle = mapBaseIns;
    this.handle = mapBaseIns.handle;
    this.__layers = new Map();
  }

  public destructor() {
    this.clearLayer();
    this.olBaseHandle = null;
    this.handle = null;
    this.__layers.clear();
    this.__layers = null;
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
    options: GeoImageBasicExtOptions = {
      url: "",
      id: "",
      name: "",
      zIndex: 0,
      extent: earthExtent,
      bbox: [],
      wrapX: true,
      opacity: 1,
    },
  ) {
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

    const meta = {
      [isCustomizeFlag]: true,
      [customMeta]: options,
    };

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
      zIndex: zIndex,
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
    };
    return layerObj;
  }

  public async addLayer(options: GeoImageBasicExtOptions) {
    if (this.handle) {
      const layerObj = await this.createLayer(options);
      if (layerObj) {
        this.handle.addLayer(layerObj.layer);
        this.__layers.set(this.__Id(options.id), layerObj);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public fitToView(options: GeoImageBasicExtOptions) {
    if (this.olBaseHandle) {
      if (options.extent) {
        this.olBaseHandle.fitToExtent(options.extent);
        return true;
      }
    } else {
      return false;
    }
  }

  public hasLayer(options: GeoImageBasicExtOptions) {
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

  public removeLayer(options: GeoImageBasicExtOptions) {
    return this.removeLayerByID(options.id);
  }

  public removeLayerByID(id: string) {
    if (this.handle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        this.handle.removeLayer(layerObj.layer);
        this.__layers.delete(this.__Id(id));
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
      });
      this.__layers.clear();
      return true;
    } else {
      return false;
    }
  }

  public setLayerOpacity(options: GeoImageBasicExtOptions, opacity: number) {
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

  public showHiddenLayer(options: GeoImageBasicExtOptions, isShow: boolean) {
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

  public getExtent(options: GeoImageBasicExtOptions) {
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

  public getCenter(options: GeoImageBasicExtOptions) {
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
