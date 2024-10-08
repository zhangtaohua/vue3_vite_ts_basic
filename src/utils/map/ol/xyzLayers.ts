import { Map as olMap } from "ol";
import XYZ from "ol/source/XYZ";
import TileLayer from "ol/layer/Tile";
import { nanoid } from "nanoid";

import OlBase from "./base";
import { transformExtentTo3857 } from "./olTools";
import { earthExtent } from "../geoConstant";
import type { XYZOptions } from "./xyzLayersTypes";

export default class OlXYZLayers {
  public olBaseHandle: OlBase | null = null;
  public handle: olMap | null = null;
  private __layers: any = null;
  private __layerIdPrefix = "XYZ_";

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
    options: XYZOptions = {
      url: "",
      id: "",
      name: "",
      zIndex: 0,
      extent: [],
      wrapX: true,
      opacity: 1,
      minZoom: 0,
      maxZoom: 21,
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
    const opacity = options.opacity ? options.opacity : 1;
    const minZoom = options.minZoom ? options.minZoom : 1;
    const maxZoom = options.maxZoom ? options.maxZoom : 21;

    const xyzOptions = {
      url: options.url,
      wrapX: options.wrapX,
      minZoom: minZoom,
      maxZoom: maxZoom,
      // crossOrigin: "anonymous",
      crossOrigin: null,
    };
    const source = new XYZ(xyzOptions);

    const zIndex = options.zIndex ? options.zIndex : this.olBaseHandle!.getCurrentzIndex();
    const layer = new TileLayer({
      source: source,
      zIndex: zIndex,
      opacity: opacity,
      // 这里设置 是用来控制图层显示的层级范围
      // minZoom: minZoom,
      // maxZoom: maxZoom
    });

    const name = options.name ? options.name : nanoid(10);
    layer.set("id", this.__Id(options.id));
    layer.set("name", this.__Name(name));

    const layerObj = {
      options,
      xyzOptions,
      source,
      layer,
    };
    return layerObj;
  }

  public addLayer(options: XYZOptions) {
    if (this.handle) {
      const layerObj = this.createLayer(options);
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

  public fitToView(options: XYZOptions) {
    if (this.olBaseHandle) {
      if (options.extent) {
        this.olBaseHandle.fitToExtent(options.extent);
        return true;
      }
    } else {
      return false;
    }
  }

  public hasLayer(options: XYZOptions) {
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

  public removeLayer(options: XYZOptions) {
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

  public setLayerOpacity(options: XYZOptions, opacity: number) {
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

  public showHiddenLayer(options: XYZOptions, isShow: boolean) {
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
}
