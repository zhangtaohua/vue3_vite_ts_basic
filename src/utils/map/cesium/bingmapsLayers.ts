import * as Cesium from "cesium";
import type { BingMapsOptions } from "./bingmapsLayersTypes";
import CesiumBase from "./base";
import { mapKeys } from "../geoConstant";

import { nanoid } from "nanoid";
import { bingmapImagerySet, bingMapCsBaseUrl } from "../sourceUrl";

export default class CsBingMapsLayers {
  public csBaseHandle: CesiumBase | null = null;
  public imageryLayers: any = null;

  private __layers: any = null;
  private __layerIdPrefix = "BINGMAPS_IMAGERY_";

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
    options: BingMapsOptions = {
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

    const url = options.url ?? bingMapCsBaseUrl;
    const key = options.key ?? mapKeys.bingmapKey;
    const mayStyle = options.mapStyle ?? Cesium.BingMapsStyle.AERIAL;

    // http://msdn.microsoft.com/en-us/library/hh441729.aspx
    // en-GB	English (United Kingdom)
    // en-US	English (United States)
    // zh-Hans	Chinese (Simplified)
    // zh-Hant	Chinese (Traditional)
    const culture = options.culture ?? "zh-Hans";

    const zIndex = this.csBaseHandle!.getCurrentzIndex(options.zIndex);

    const bingMapsOptions = {
      key: key,
      mapStyle: mayStyle,
      culture: culture,
    };
    let provider: any = null;
    if (options.useDefault) {
      try {
        if (options.mayStyle && options.mayStyle != Cesium.BingMapsStyle.AERIAL) {
          provider = await Promise.resolve(
            Cesium.createWorldImageryAsync({
              style: Cesium.IonWorldImageryStyle.ROAD,
            }),
          );
        } else {
          provider = await Promise.resolve(
            Cesium.createWorldImageryAsync({
              style: Cesium.IonWorldImageryStyle.AERIAL_WITH_LABELS,
            }),
          );
        }
      } catch (error) {
        console.log(`There was an error creating world imagery: ${error}`);
      }
    } else {
      provider = await Promise.resolve(Cesium.BingMapsImageryProvider.fromUrl(url, bingMapsOptions));
    }

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

  public async addLayer(options: BingMapsOptions) {
    if (this.csBaseHandle) {
      const layerObj = await this.createLayer(options);
      if (layerObj) {
        // this.imageryLayers.add(layerObj.layer, layerObj.zIndex);
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

  public flyToView(options: BingMapsOptions) {
    if (this.csBaseHandle) {
      if (options.extent) {
        this.csBaseHandle.fitToExtent(options.extent);
        return true;
      }
    } else {
      return false;
    }
  }

  public hasLayer(options: BingMapsOptions) {
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

  public removeLayer(options: BingMapsOptions, destroy = true) {
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

  public setLayerOpacity(options: BingMapsOptions, opacity: number) {
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

  public showHiddenLayer(options: BingMapsOptions, isShow: boolean) {
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
