// 使用此文件记得安装 ol-wind 库
// yarn add ol-wind
// https://github.com/sakitam-fdd/wind-layer
import { Map as olMap } from "ol";
import { WindLayer } from "ol-wind";
import { nanoid } from "nanoid";
import lodash from "lodash";

import OlBase from "./base";
import { transformExtentTo3857 } from "./olTools";
import { earthExtent } from "../geoConstant";
import type { WindLayerOptions } from "./windLayersTypes";

export default class OpenLayersWind {
  public olBaseHandle: OlBase | null = null;
  public handle: olMap | null = null;
  private __layers: any = null;
  private __layerIdPrefix = "WIND_";
  private __pixelRatio = 2;
  private __velocityScales = {
    0: 1 / 20,
    1: 1 / 20,
    2: 1 / 20,
    3: 1 / 30,
    4: 1 / 40,
    5: 1 / 50,
    6: 1 / 60,
    7: 0.003,
    8: 0.002,
    9: 0.001,
    10: 0.0005,
    11: 0.0003,
    12: 0.00015,
    13: 0.0001,
    14: 0.00005,
    15: 0.000025,
    16: 0.00001,
    17: 0.000005,
    18: 0.000002,
    19: 0.000001,
    20: 0.0000005,
    21: 0.0000002,
    22: 0.0000001,
  };

  constructor(mapBaseIns: OlBase) {
    this.olBaseHandle = mapBaseIns;
    this.handle = mapBaseIns.handle;
    this.__layers = new Map();
    this.__pixelRatio = mapBaseIns.pixelRatio;
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
    options: WindLayerOptions = {
      data: "",
      id: "",
      name: "",
      zIndex: 0,
      extent: [],
      windOptions: {},
    },
  ) {
    if (!options.data || !options.id) {
      return null;
    }

    let extent = earthExtent;
    if (options.extent && options.extent.length && options.extent.length === 4) {
      extent = options.extent;
    }
    extent = transformExtentTo3857(extent);

    let windOptions = options.windOptions;
    const zIndex = options.zIndex ? options.zIndex : this.olBaseHandle!.getCurrentzIndex();
    const name = options.name ? options.name : nanoid(10);
    if (lodash.isNull(windOptions) || lodash.isUndefined(windOptions) || !Object.keys(windOptions).length) {
      windOptions = {
        id: this.__Id(options.id),
        name: this.__Name(name),
        // forceRender: false,  // notice!!
        zIndex: zIndex,
        windOptions: {
          // globalAlpha: 0.9,
          // maxAge: 90,
          // velocityScale: 1 / 20,
          velocityScale: () => {
            const zoomValue = parseInt(this.olBaseHandle.getViewZoom());
            return this.__velocityScales[zoomValue] || 1 / 100;
          },
          // frameRate: 20,
          paths: 5000,
          lineWidth: 3 * this.__pixelRatio,
          // width: 3 * this.__pixelRatio,
          generateParticleOption: false,
          // colorScale: () => {
          // console.log(m);
          // 	return '#ff473c';
          // },
          // eslint-disable-next-line no-unused-vars
          colorScale: [
            "rgb(36,104, 180)",
            "rgb(60,157, 194)",
            "rgb(128,205,193 )",
            "rgb(151,218,168 )",
            "rgb(198,231,181)",
            "rgb(238,247,217)",
            "rgb(255,238,159)",
            "rgb(252,217,125)",
            "rgb(255,182,100)",
            "rgb(252,150,75)",
            "rgb(250,112,52)",
            "rgb(245,64,32)",
            "rgb(237,45,28)",
            "rgb(220,24,32)",
            "rgb(180,0,35)",
          ],
          // colorScale: scale,
        },
      };
    }
    // console.log("windOptions", windOptions)
    const layer = new WindLayer(options.data, windOptions);

    const layerObj = {
      options,
      windOptions,
      layer,
    };
    return layerObj;
  }

  public addLayer(options: WindLayerOptions) {
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

  public fitToView(options: WindLayerOptions) {
    if (this.olBaseHandle) {
      if (options.extent) {
        this.olBaseHandle.fitToExtent(options.extent);
        return true;
      }
    } else {
      return false;
    }
  }

  public hasLayer(options: WindLayerOptions) {
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

  // 解决移出 又加入 慢慢的越来越卡的问题
  public removeRender(windLayer: WindLayer) {
    const renderer = windLayer.getRenderer();
    if (renderer && renderer.oRender) {
      const executors = renderer.oRender.executors;
      Object.keys(executors).forEach((key) => {
        const wind = executors[key];
        if (wind) {
          wind.clearCanvas();
        }
      });
    }
  }

  public removeLayer(options: WindLayerOptions) {
    return this.removeLayerByID(options.id);
  }

  public removeLayerByID(id: string) {
    if (this.handle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        this.handle.removeLayer(layerObj.layer);
        this.removeRender(layerObj.layer);
        // layerObj.layer.wind.clearCanvas() // may be no need!!
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
        this.removeRender(layerObj.layer);
        // layerObj.layer.wind.clearCanvas() // may be no need!!
      });
      this.__layers.clear();
      return true;
    } else {
      return false;
    }
  }

  public setLayerOpacity(options: WindLayerOptions, opacity: number) {
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
