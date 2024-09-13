import { Map as olMap } from "ol";
import * as olProj from "ol/proj";
import WTMSTileGrid from "ol/tilegrid/WMTS";
import { getWidth, getTopLeft } from "ol/extent";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS";
import TileLayer from "ol/layer/Tile";
import WMTSCapabilities from "ol/format/WMTSCapabilities";

import { nanoid } from "nanoid";

import OlBase from "./base";
import { transformExtentTo3857 } from "./olTools";
import { earthExtent } from "../geoConstant";
import type { WMTSOptions } from "./wmtsLayersTypes";

export default class OpenLayersWMTS {
  public olBaseHandle: OlBase | null = null;
  public handle: olMap | null = null;
  private __layers: any = null;
  private __layerIdPrefix = "WMTS_";

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
    options: WMTSOptions = {
      url: "",
      id: "",
      name: "",
      zIndex: 0,
      extent: [],
      wrapX: true,
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

    const projection1 = olProj.get("EPSG:4326");
    const resolutions1 = new Array(21);
    const projectionExtent = projection1.getExtent();
    const matrixIds = new Array(21);
    const size = getWidth(projectionExtent) / 256;
    for (let z = 1; z < 22; ++z) {
      resolutions1[z] = size / Math.pow(2, z);
      matrixIds[z] = z;
    }
    const wmtsOptions = {
      url: options.url,
      // layer: 'vec',
      // layer: 'cva',
      layer: options.name,
      matrixSet: "c",
      format: "tiles",
      // format: 'image/png',
      style: "default",
      projection: projection1,
      tileGrid: new WTMSTileGrid({
        origin: getTopLeft(projectionExtent),
        resolutions: resolutions1,
        matrixIds: matrixIds,
      }),
      wrapX: options.wrapX,
    };
    const source = new WMTS(wmtsOptions);

    const zIndex = options.zIndex ? options.zIndex : this.olBaseHandle!.getCurrentzIndex();
    const layer = new TileLayer({
      source: source,
      extent: extent,
      zIndex: zIndex,
    });

    const name = options.name ? options.name : nanoid(10);
    layer.set("id", this.__Id(options.id));
    layer.set("name", this.__Name(name));

    const layerObj = {
      options,
      wmtsOptions,
      source,
      layer,
    };
    return layerObj;
  }

  public addLayer(options: WMTSOptions) {
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

  public fitToView(options: WMTSOptions) {
    if (this.olBaseHandle) {
      if (options.extent) {
        this.olBaseHandle.fitToExtent(options.extent);
        return true;
      }
    } else {
      return false;
    }
  }

  public hasLayer(options: WMTSOptions) {
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

  public removeLayer(options: WMTSOptions) {
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

  public setLayerOpacity(options: WMTSOptions, opacity: number) {
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
}
