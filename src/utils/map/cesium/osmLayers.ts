import * as Cesium from "cesium";
import type { OsmOptions } from "./osmLayersTypes";
import CesiumBase from "./base";
import { mapKeys } from "../geoConstant";

import { nanoid } from "nanoid";
import { bingmapImagerySet, OsmCsBaseUrl } from "../sourceUrl";

export default class CsOsmMapsLayers {
  public csBaseHandle: CesiumBase | null = null;
  public imageryLayers: any = null;

  private __layers: any = null;
  private __layerIdPrefix = "OSM_";

  constructor(mapBaseIns: CesiumBase) {
    this.csBaseHandle = mapBaseIns;
    this.imageryLayers = mapBaseIns.imageryLayers;
    this.__layers = new Map();
  }

  public destructor() {
    this.clearLayer();
    this.csBaseHandle = null;
    this.imageryLayers = null;
    this.__layers = null;
  }

  private __Id(id: string) {
    return `${this.__layerIdPrefix}${id}`;
  }

  private __Name(name: string) {
    return `${this.__layerIdPrefix}${name}`;
  }

  public async createLayer(
    options: OsmOptions = {
      id: "",
      name: "",
    },
  ) {
    if (!options.id) {
      return null;
    }
    const id = this.__Id(options.id);
    let name = options.name ? options.name : nanoid(10);
    name = this.__Name(name);

    const url = options.url; // OsmCsBaseUrl
    const fileExtension = options.fileExtension ?? "jpg";
    const zIndex = this.csBaseHandle!.getCurrentzIndex(options.zIndex);

    let osmOptions = {};
    if (url && fileExtension) {
      osmOptions = {
        url: url,
        fileExtension: fileExtension,
      };
    } else if (url) {
      osmOptions = {
        url: url,
      };
    }
    const provider = await new Cesium.OpenStreetMapImageryProvider(osmOptions);
    const layer = new Cesium.ImageryLayer(provider);
    layer.name = name;
    layer.id = id;

    const layerObj = {
      options,
      provider,
      layer,
      zIndex,
    };
    return layerObj;
  }

  public async addLayer(options: OsmOptions) {
    if (this.csBaseHandle) {
      const layerObj = await this.createLayer(options);
      if (layerObj) {
        this.imageryLayers.add(layerObj.layer);
        this.__layers.set(this.__Id(options.id), layerObj);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public flyToView(options: OsmOptions) {
    if (this.csBaseHandle) {
      if (options.extent) {
        this.csBaseHandle.fitToExtent(options.extent);
        return true;
      }
    } else {
      return false;
    }
  }

  public hasLayer(options: OsmOptions) {
    if (this.csBaseHandle && this.__layers.size) {
      return this.__layers.has(this.__Id(options.id));
    }
    return false;
  }

  public hasLayerByID(id: string) {
    if (this.csBaseHandle && this.__layers.size) {
      return this.__layers.has(this.__Id(id));
    }
    return false;
  }

  public removeLayer(options: OsmOptions, destroy = true) {
    return this.removeLayerByID(options.id, destroy);
  }

  public removeLayerByID(id: string, destroy: boolean) {
    if (this.csBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        this.imageryLayers.remove(layerObj.layer, destroy);
        this.__layers.delete(this.__Id(id));
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public clearLayer(destroy = true) {
    if (this.csBaseHandle && this.__layers.size) {
      this.__layers.forEach((layerObj: any) => {
        this.imageryLayers.remove(layerObj.layer, destroy);
      });
      this.__layers.clear();
      return true;
    } else {
      return false;
    }
  }

  public setLayerOpacity(options: OsmOptions, opacity: number) {
    return this.setLayerOpacityByID(options.id, opacity);
  }

  public setLayerOpacityByID(id: string, opacity: number) {
    if (this.csBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        layerObj.layer.alpha = opacity;
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public showHiddenLayer(options: OsmOptions, isShow: boolean) {
    return this.showHiddenLayerByID(options.id, isShow);
  }

  public showHiddenLayerByID(id: string, isShow: boolean) {
    if (this.csBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        layerObj.layer.show = isShow;
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
