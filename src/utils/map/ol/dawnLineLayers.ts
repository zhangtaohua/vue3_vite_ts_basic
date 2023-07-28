//晨昏线--根据客户端的时区和时间，计算出太阳分界线，并添加到地图上
import { Map as olMap } from "ol";
import * as olProj from "ol/proj";
import { Polygon } from "ol/geom";
import { Feature } from "ol";
import { Style } from "ol/style";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
// import moment from "moment";
import type { DawnLineOptions } from "./dawnLineLayersTypes";

import { nanoid } from "nanoid";

import { createFill, getColor } from "./style";

export default class OlDawnLineLayers {
  public olBaseHandle: any | null = null;
  public handle: olMap | null = null;

  private __layers: any = null;
  private __layerIdPrefix = "DAWNLINE_";

  private offsetX: any;
  private maxDimension = olProj.get("EPSG:3857").getExtent()[3];
  private minDimension = olProj.get("EPSG:3857").getExtent()[1];
  private declination: any;
  private dawnLineWidth = 667918;
  private dawnLineSteps = 13;
  private points = 288;
  private terminatorCurveSetCache = <any>{};

  constructor(mapBaseIns: any) {
    this.olBaseHandle = mapBaseIns;
    this.handle = mapBaseIns.handle;
    this.__layers = new Map();
  }

  public destructor() {
    this.clearLayer();
    this.handle = null;
    this.olBaseHandle = null;
    this.__layers = null;
  }

  private __resetCalcFactor() {
    this.offsetX = null;
    this.maxDimension = olProj.get("EPSG:3857").getExtent()[3];
    this.minDimension = olProj.get("EPSG:3857").getExtent()[1];
    this.declination = null;
    this.dawnLineWidth = 667918;
    this.dawnLineSteps = 13;
    this.points = 288;
    this.terminatorCurveSetCache = {};
  }

  private __Id(id: string) {
    return `${this.__layerIdPrefix}${id}`;
  }

  private __Name(name: string) {
    return `${this.__layerIdPrefix}${name}`;
  }

  public termFunction = (lon: any) => {
    const cosFactor = -Math.cos((lon + this.offsetX) * (Math.PI / this.maxDimension));
    return ((2 * this.maxDimension) / Math.PI) * Math.atan(cosFactor / Math.tan(this.declination));
  };

  public lonPrimeFunction = (t: any) => {
    return (this.maxDimension - this.minDimension) / this.points;
  };

  public latPrimeFunction = (t: any) => {
    const aFactor = (2 * this.maxDimension) / Math.PI;
    const bFactor = this.offsetX;
    const cFactor = Math.PI / this.maxDimension;
    const dFactor = Math.tan(this.declination);
    const cosOperand =
      (this.minDimension + ((this.maxDimension - this.minDimension) / this.points) * t + bFactor) * cFactor;
    return (
      ((aFactor / (1 + Math.pow(-Math.cos(cosOperand) / dFactor, 2))) *
        (Math.sin(cosOperand) / dFactor) *
        (cFactor * (this.maxDimension - this.minDimension))) /
      this.points
    );
  };

  public lonParallelFunction = (dist: any, t: any) => {
    const latP = this.latPrimeFunction(t);
    const lonP = this.lonPrimeFunction(t);
    return (dist * latP) / Math.sqrt(Math.pow(lonP, 2) + Math.pow(latP, 2));
  };

  public latParallelFunction = (dist: any, t: any) => {
    const latP = this.latPrimeFunction(t);
    const lonP = this.lonPrimeFunction(t);
    return (dist * lonP) / Math.sqrt(Math.pow(lonP, 2) + Math.pow(latP, 2));
  };

  public getTerminatorCurveSet = (dayOfYear: any) => {
    if (!(dayOfYear in this.terminatorCurveSetCache)) {
      this.terminatorCurveSetCache[dayOfYear] = this.generateTerminatorCurveSet(dayOfYear);
    }
    return Object.assign({}, this.terminatorCurveSetCache[dayOfYear]);
  };

  public getDayOfYear(now: any) {
    const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 0, 0, 0, 0));
    const nowSecons = now.getTime();
    const startSeconds = start.getTime();
    let dayOfYear = 0;
    if (nowSecons > startSeconds) {
      dayOfYear = Math.floor((nowSecons - startSeconds) / 1000 / 60 / 60 / 24);
    }
    return dayOfYear;
  }

  public setClock = (clock: any, nightFeatures: any) => {
    // 以下是用moment.js 方法
    // const now = moment.unix(clock / 1000 ).utc();
    // const baseCurveData = this.getTerminatorCurveSet(now.dayOfYear());
    // const dayFraction = (now.hour() * 3600 + now.minute() * 60 + now.second()) / 86400;

    // 以下是用原始库
    const now = new Date(clock);
    const hour = now.getUTCHours();
    const minutes = now.getUTCMinutes();
    const seconds = now.getUTCSeconds();
    const dayOfYear = this.getDayOfYear(now);

    const baseCurveData = this.getTerminatorCurveSet(dayOfYear);
    const dayFraction = (hour * 3600 + minutes * 60 + seconds) / 86400;
    let offsetX = dayFraction * 2 * this.maxDimension;
    offsetX = Math.round(offsetX / ((2 * this.maxDimension) / this.points)) * ((2 * this.maxDimension) / this.points);
    baseCurveData.curves.forEach((curve: any, k1: any) => {
      curve.forEach((coord: any, k2: any) => {
        curve[k2][0] -= offsetX;
      });
      let count = 0;
      while (true) {
        if (count > curve.length) {
          break;
        }
        if (curve[0][0] < this.minDimension) {
          const coord = curve.shift();
          coord[0] += this.maxDimension - this.minDimension;
          curve.push(coord);
        } else {
          break;
        }
        count++;
      }
      curve.push([curve[0][0] + (this.maxDimension - this.minDimension), curve[0][1]]);
      const nightCoords = curve.slice(0);
      nightCoords.push(
        [this.maxDimension, baseCurveData.nightShimCoord],
        [this.minDimension, baseCurveData.nightShimCoord],
        curve[0],
      );
      /*nightCoords.forEach((coord, i) => {                  //如果地图是4326坐标系，需要在这里转化
          nightCoords[i] = olProj.transform(nightCoords[i],'EPSG:3857','EPSG:4326')
      });*/
      const nightGeometry = new Polygon([nightCoords]);
      nightFeatures[k1].setGeometry(nightGeometry);
    });
  };

  public generateTerminatorCurveSet = (dayOfYear: any) => {
    this.offsetX = this.maxDimension;
    this.declination = 0.40927971 * Math.sin(((2 * Math.PI) / 365) * (dayOfYear - 81.5));
    const lineCoords = <any>[];
    for (let i = 0; i < this.dawnLineSteps; i++) {
      lineCoords.push([]);
    }
    for (let i = 0; i < this.points; i++) {
      const lon = this.minDimension + ((this.maxDimension - this.minDimension) / this.points) * i;
      const lat = this.termFunction(lon);
      lineCoords[0].push([lon, lat]);
      const latDeg = olProj.toLonLat([lon, lat])[1];
      const latRad = (latDeg * Math.PI) / 180;
      const baseDist = this.dawnLineWidth / (this.dawnLineSteps - 1) / Math.cos(latRad);
      const steps = (this.dawnLineSteps - 1) / 2;
      for (let j = 1; j <= steps; j++) {
        const dist = baseDist * j;
        const lonP = this.lonParallelFunction(dist, i);
        const latP = this.latParallelFunction(dist, i);
        lineCoords[j].push([lon + lonP, Math.max(lat - latP, this.minDimension)]);
        lineCoords[j + steps].push([lon - lonP, Math.min(lat + latP, this.maxDimension)]);
      }
    }
    const dayShimCoord = this.declination < 0 ? this.minDimension : this.maxDimension;
    const nightShimCoord = this.declination < 0 ? this.maxDimension : this.minDimension;
    return {
      curves: lineCoords,
      dayShimCoord: dayShimCoord,
      nightShimCoord: nightShimCoord,
    };
  };

  public toggleStyleFunction = (options: any) => {
    let fillColor = "rgba(0, 0, 0, 0.4)";
    let style = null;

    const metaStyle = options["style"];
    const metaStyleFunc = options["styleFunction"];
    if (metaStyle) {
      let fillColorTemp = metaStyle["fillColor"];
      if (fillColorTemp) {
        fillColorTemp = getColor(fillColorTemp);
        fillColor = fillColorTemp;
      }
    } else if (metaStyleFunc) {
      style = metaStyleFunc();
      return style;
    }

    const optionStyle = {
      fillColor: fillColor,
      color: fillColor,
    };

    return new Style({
      fill: createFill(optionStyle),
    });
  };

  public createLayer(
    options: DawnLineOptions = {
      id: "",
      timestamp: 0,
      wrapX: true,
    },
  ) {
    if (!options.id || !options.timestamp) {
      return null;
    }

    const nightFeatures = [];
    for (let i = 0; i < this.dawnLineSteps; i++) {
      nightFeatures.push(
        new Feature({
          type: "night",
        }),
      );
    }
    // this.setClock(Math.round(new Date(options.timestamp).getTime() / 1000), nightFeatures);//设置时间，不设置则为当前时间
    this.setClock(Math.round(options.timestamp), nightFeatures);
    const zIndex = options.zIndex ? options.zIndex : this.olBaseHandle!.getCurrentzIndex();
    const style = this.toggleStyleFunction(options);
    const layer = new VectorLayer({
      source: new VectorSource({
        features: [].concat(nightFeatures),
      }),
      opacity: 0.2,
      zIndex: zIndex,
      style: style,
    });

    const name = options.name ? options.name : nanoid(10);
    layer.set("id", this.__Id(options.id));
    layer.set("name", this.__Name(name));
    const layerObj = {
      options,
      layer,
    };
    this.__resetCalcFactor();
    return layerObj;
  }

  public addLayer(options: DawnLineOptions) {
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

  public hasLayer(options: DawnLineOptions) {
    if (this.handle && this.__layers.size) {
      return this.__layers.has(this.__Id(options.id));
    }
    return false;
  }

  public hasLayerByID(id: string) {
    if (this.handle && this.__layers.size) {
      return this.__layers.has(this.__Id(id));
    }
    return false;
  }

  public removeLayer(options: DawnLineOptions) {
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
      this.__layers.forEach((layerObj: any, key: any) => {
        this.handle.removeLayer(layerObj.layer);
      });
      this.__layers.clear();
      return true;
    } else {
      return false;
    }
  }

  public setLayerOpacity(options: DawnLineOptions, opacity: number) {
    return this.setLayerOpacityByID(options.id, opacity);
  }

  public setLayerOpacityByID(id: string, opacity: number) {
    if (this.handle) {
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

  public showHiddenLayer(options: DawnLineOptions, isShow: boolean) {
    return this.showHiddenLayerByID(options.id, isShow);
  }

  public showHiddenLayerByID(id: string, isShow: boolean) {
    if (this.handle) {
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
