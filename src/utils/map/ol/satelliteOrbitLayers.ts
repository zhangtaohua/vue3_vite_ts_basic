import { Map as olMap } from "ol";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Style } from "ol/style";
import { GeoJSON } from "ol/format";

import { nanoid } from "nanoid";

import OlBase from "./base";

import { transformExtentTo3857 } from "./olTools";

import type { SatelliteOrbitOptions } from "./satelliteOrbitLayersTypes";

import { createFill, createStroke, createCircle, createText, getColor, geojsonStyleFunction } from "./style";

import { isCustomizeFlag, customMeta } from "../geoConstant";
import OlGeojsonLayers from "./geojsonLayers";
import SatelliteOrbit from "../satellite/orbit";
import { GeojsonOptions } from "./geojsonLayersTypes";

export default class OlBasicGeoJson {
  public olBaseHandle: OlBase | null = null;
  public handle: olMap | null = null;
  public GeojsonMapIns: OlGeojsonLayers | null = null;

  private __layers: any = null;
  private __GeojsonLayers: any = null;
  private __layerIdPrefix = "SATELLITE_ORBIT_";

  constructor(mapBaseIns: OlBase) {
    this.olBaseHandle = mapBaseIns;
    this.handle = mapBaseIns.handle;

    this.GeojsonMapIns = new OlGeojsonLayers(mapBaseIns);
    this.__layers = new Map();
    this.__GeojsonLayers = new Map();
  }

  public destructor() {
    this.GeojsonMapIns?.destructor();
    this.clearLayer();
    this.olBaseHandle = null;
    this.handle = null;
    this.__layers.clear();
    this.__layers = null;
    this.__GeojsonLayers.clear();
    this.__GeojsonLayers = null;
  }

  private __Id(id: string) {
    return `${this.__layerIdPrefix}${id}`;
  }

  private __Name(name: string) {
    return `${this.__layerIdPrefix}${name}`;
  }

  public createLayer(options: SatelliteOrbitOptions) {
    if (!options.tle1 || !options.tle2 || !options.id) {
      return null;
    }
    // const id = this.__Id(options.id);
    // let name = options.name ? options.name : nanoid(10);
    // name = this.__Name(name);

    const orbitIns = new SatelliteOrbit(options.tle1, options.tle2);
    const lnglatDatas = orbitIns.getOrbitGeojson(options.startTime, options.endTime, options.timeInterval);
    const oribtOptions = {
      ...options,
      id: `${options.id}_orbit`,
      data: lnglatDatas,
      isPopup: false,
    };

    let satOptions = null;
    if (options.isShowSat) {
      const currentData = orbitIns.getCurrenPositionGeojson(options.startTime);
      satOptions = {
        ...options,
        id: `${options.id}_satellite`,
        data: currentData,
        isPopup: true,
        style: options.satStyle,
        styleFunction: options.satStyleFunction,
      };
    }

    const layerObj = {
      options,
      orbitIns,
      oribtOptions,
      satOptions,
    };

    console.log("layerObj", layerObj);
    return layerObj;
  }

  public addLayer(options: SatelliteOrbitOptions) {
    if (this.handle) {
      const layerObj = this.createLayer(options);
      if (layerObj) {
        // 增加轨道 by geojson
        let isAdded = this.GeojsonMapIns!.addLayer(layerObj.oribtOptions);
        // if (isAdded) {
        //   this.__GeojsonLayers.set(options, this.GeojsonMapIns);
        // }
        if (options.isShowSat) {
          isAdded = this.GeojsonMapIns!.addLayer(layerObj.satOptions as GeojsonOptions);
        }

        // 记录原始信息
        this.__layers.set(this.__Id(options.id), layerObj);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public fitToView(options: SatelliteOrbitOptions) {
    if (this.olBaseHandle) {
      if (options.extent) {
        this.olBaseHandle.fitToExtent(options.extent);
        return true;
      } else {
        this.olBaseHandle.fitToLayerSourceByID(this.__Id(options.id));
        return true;
      }
    } else {
      return false;
    }
  }

  public hasLayer(options: SatelliteOrbitOptions) {
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

  public removeLayer(options: SatelliteOrbitOptions) {
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
        this.handle!.removeLayer(layerObj.layer);
      });
      this.__layers.clear();
      return true;
    } else {
      return false;
    }
  }

  public setLayerOpacity(options: SatelliteOrbitOptions, opacity: number) {
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

  public showHiddenLayer(options: SatelliteOrbitOptions, isShow: boolean) {
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
