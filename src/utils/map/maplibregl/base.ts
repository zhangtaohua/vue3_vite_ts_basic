import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";

import { calibrateWrapLongitudeLatitude } from "../geoCommon.js";

// import DragZoom from "ol/interaction/DragZoom";

// 封装 map 的基础类
export default class OlBase {
  // map 基本实例
  public handle: any = null;

  // map 实例化的容器
  public container = "";

  public minLevel = 1; // 2.8657332708517589
  public maxLevel = 21;
  public pixelRatio = 1;

  // map 投影坐标系
  public projectionCode = "EPSG:3857";
  private __Is3857 = true;
  private __Is4326 = false;
  private __zIndex = 10;

  private __isMapLoaded = false;

  // 构造函数 传入参数分别为 容器ID, 屏幕的Ratio, 最小level 最大level
  constructor(target: string, pixelRatio: number, minLevel = 1, maxLevel = 21) {
    this.container = target;
    this.minLevel = minLevel;
    this.maxLevel = maxLevel;
    this.pixelRatio = pixelRatio || (window ? window.devicePixelRatio : 1);

    this.handle = new maplibregl.Map({
      container: target,
      style: {
        version: 8,
        sources: {
          MIERUNEMAP: {
            type: "raster",
            tiles: ["https://tile.mierune.co.jp/mierune_mono/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution:
              "Maptiles by <a href='http://mierune.co.jp/' target='_blank'>MIERUNE</a>, under CC BY. Data by <a href='http://osm.org/copyright' target='_blank'>OpenStreetMap</a> contributors, under ODbL.",
          },
        },
        layers: [
          {
            id: "MIERUNEMAP",
            type: "raster",
            source: "MIERUNEMAP",
            minzoom: 0,
            maxzoom: 18,
          },
        ],
      },
      center: [139.767, 35.681],
      zoom: 11,
    });

    this.handle.on("load", () => {
      this.__isMapLoaded = true;
    });
  }

  // 用于销毁实例
  public destructor() {
    if (this.handle) {
      this.handle = null;
      this.container = "";
    }
  }

  public getIsMapLoaded() {
    return this.__isMapLoaded;
  }

  public addControl() {
    if (this.handle) {
      this.handle.addControl(
        new maplibregl.NavigationControl({
          visualizePitch: true,
        }),
      );
    }
  }
}
