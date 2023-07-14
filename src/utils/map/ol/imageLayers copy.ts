import { Map as olMap } from "ol";
import StaticImage from "ol/source/ImageStatic";
import ImageLayer from "ol/layer/Image";
import { getCenter } from "ol/extent";
import Polygon from "ol/geom/Polygon.js";
import Feature from "ol/Feature";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { transparentPolygonStyle } from "./style";

import { nanoid } from "nanoid";

import OlBase from "./base";
import { transformExtentTo3857 } from "./olTools";
import { earthExtent } from "../geoConstant";
import { getRectangleFromExtent } from "../geoCommon";
import type { StaticImageOptions } from "./imageLayersTypes";

export default class OlStaticImageLayers {
  public olBaseHandle: OlBase | null = null;
  public handle: olMap | null = null;
  private __layers: any = null;
  private __layerIdPrefix = "IMAGE_";

  constructor(mapBaseIns: OlBase) {
    this.olBaseHandle = mapBaseIns;
    this.handle = mapBaseIns.handle;
    this.__layers = new Map();
  }

  public destructor() {
    this.clearLayer();
    this.olBaseHandle = null;
    this.handle = null;
    this.__layers = null;
  }

  private __Id(id: string) {
    return `${this.__layerIdPrefix}${id}`;
  }

  private __Name(name: string) {
    return `${this.__layerIdPrefix}${name}`;
  }

  public createLayer(
    options: StaticImageOptions = {
      url: "",
      id: "",
      name: "",
      zIndex: 0,
      extent: earthExtent,
      wrapX: true,
      opacity: 1,
    },
  ) {
    if (!options.url || !options.id) {
      return null;
    }
    // [left, bottom, right, top]
    let extent = earthExtent;
    if (options.extent && options.extent.length && options.extent.length === 4) {
      extent = options.extent;
    }
    extent = transformExtentTo3857(extent);
    let name = options.name ? options.name : nanoid(10);
    name = this.__Name(name);
    const id = this.__Id(options.id);
    const zIndex = options.zIndex ? options.zIndex : this.olBaseHandle!.getCurrentzIndex();

    const polygonPoints = getRectangleFromExtent(extent);
    const PloygonOptions = {
      geometry: new Polygon(polygonPoints),
      name: name,
      id: id,
      wrapX: options.wrapX,
    };
    const feature = new Feature(PloygonOptions);
    feature.setStyle(transparentPolygonStyle);
    const meta = {
      customize: true,
      customMeta: options,
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

    const imageOptions = {
      url: options.url,
      imageExtent: extent,
      interpolate: true,
      wrapX: options.wrapX,
    };
    const source = new StaticImage(imageOptions);
    source.setProperties({
      customize: true,
      customMeta: options,
    });

    const opacity = options.opacity ? options.opacity : 1;
    const layer = new ImageLayer({
      source: source,
      extent: extent,
      zIndex: zIndex + 1,
      opacity: opacity,
    });
    layer.setProperties({
      customize: true,
      customMeta: options,
    });
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

  public addLayer(options: StaticImageOptions) {
    if (this.handle) {
      const layerObj = this.createLayer(options);
      if (layerObj) {
        this.handle.addLayer(layerObj.layer);
        this.handle.addLayer(layerObj.layerVector);
        this.__layers.set(this.__Id(options.id), layerObj);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public fitToView(options: StaticImageOptions) {
    if (this.olBaseHandle) {
      if (options.extent) {
        this.olBaseHandle.fitToExtent(options.extent);
        return true;
      }
    } else {
      return false;
    }
  }

  public hasLayer(options: StaticImageOptions) {
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

  public removeLayer(options: StaticImageOptions) {
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
      this.__layers.forEach((layerObj, key) => {
        this.handle.removeLayer(layerObj.layer);
      });
      this.__layers.clear();
      return true;
    } else {
      return false;
    }
  }

  public setLayerOpacity(options: StaticImageOptions, opacity: number) {
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

  public showHiddenLayer(options: StaticImageOptions, isShow: boolean) {
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

  public getExtent(options: StaticImageOptions) {
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

  public getCenter(options: StaticImageOptions) {
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
