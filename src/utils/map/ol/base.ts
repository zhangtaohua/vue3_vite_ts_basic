import { Map as olMap, View, Feature } from "ol";
import * as olControl from "ol/control";
import { defaults as defaultInteractions, MouseWheelZoom } from "ol/interaction";

import { Geometry } from "ol/geom";
import { Extent, getCenter } from "ol/extent";
import { transformLongitudeLatitude, transformExtentTo3857, transformTo4326, transformExtentTo4326 } from "./olTools";
import SimpleGeometry from "ol/geom/SimpleGeometry.js";
import { calibrateWrapLongitudeLatitude } from "../geoCommon.js";

// import DragZoom from "ol/interaction/DragZoom";

// 封装openlayers 的基础类
export default class OlBase {
  // openlayers 基本实例
  public handle: olMap | null = null;
  // openlayers 基本实例的观测层实例
  public viewHandle: View | null = null;
  // openlayers 实例化的容器
  public container = "";

  public minLevel = 1; // 2.8657332708517589
  public maxLevel = 21;
  public pixelRatio = 1;

  // openlayers 投影坐标系
  public projectionCode = "EPSG:3857";
  private __Is3857 = true;
  private __Is4326 = false;
  private __zIndex = 10;

  // 构造函数 传入参数分别为 容器ID, 屏幕的Ratio, 最小level 最大level
  constructor(target: string, pixelRatio: number, minLevel = 1, maxLevel = 21) {
    this.container = target;
    this.minLevel = minLevel;
    this.maxLevel = maxLevel;
    this.pixelRatio = pixelRatio || (window ? window.devicePixelRatio : 1);

    const controls = olControl
      .defaults({
        attribution: false,
        zoom: false,
        rotate: false,
      })
      .extend([]);

    const interactions = defaultInteractions({
      doubleClickZoom: false, //屏蔽双击放大事件
      pinchRotate: false,
      altShiftDragRotate: false,
      // pinchZoom: false,
      // dragPan: false,
      // mouseWheelZoom: false
    });
    // .extend([new DragZoom()])

    // 一定要在 new 之前调用，请不要调整位置
    this.__removeOpenLayersViewport(this.container);

    this.handle = new olMap({
      pixelRatio: pixelRatio,
      moveTolerance: 5 * pixelRatio,
      controls: controls,
      target: this.container,
      // interactions: interactions,
      view: new View({
        // extent: mapExtent,  // 用来限制显示区域
        // projection: 'EPSG:4326',
        center: transformLongitudeLatitude([116, 40]),
        zoom: this.minLevel,
        minZoom: this.minLevel,
        maxZoom: this.maxLevel,
        // enableRotation: false,
      }),
    });

    // setTimeout(() => {
    // 	this.handle!.updateSize()
    // }, 500)
    // 一定要在new 之后调用
    // this.__removeMoreOpenLayerViewport(targetStr)

    this.viewHandle = this.handle.getView();
    this.projectionCode = this.viewHandle.getProjection().getCode();
    this.__Is3857 = this.projectionCode === "EPSG:3857";
    this.__Is4326 = this.projectionCode === "EPSG:4326";

    // 禁止 DragZoom 控制 为解决移动端拖动放大的问题，实际不起作用
    // this.setActiveInteraction(DragZoom, false)
  }

  // 用于解决 openlayers 多创建出dom 的bug
  private __removeOpenLayersViewport(target: string) {
    const olTargetDom = document.getElementById(target);
    if (olTargetDom) {
      const olViewports = olTargetDom!.getElementsByClassName("ol-viewport");
      while (olViewports.length) {
        const needRemoveViewport = olViewports[0];
        olTargetDom?.removeChild(needRemoveViewport);
      }
    }
  }

  // 用于解决 openlayers 多创建出dom 的bug
  private __removeMoreOpenLayerViewport(target: string) {
    const olTargetDom = document.getElementById(target);
    if (olTargetDom) {
      const olViewports = olTargetDom!.getElementsByClassName("ol-viewport");
      if (olViewports.length > 1) {
        const needRemoveViewport = olViewports[0];
        olTargetDom?.removeChild(needRemoveViewport);
      }
    }
  }

  // 用于销毁实例
  public destructor() {
    if (this.handle) {
      this.handle.dispose();
      this.handle = null;
      this.viewHandle = null;
      this.container = "";
    }
  }

  public getMap() {
    return this.handle;
  }

  public getView() {
    return this.viewHandle;
  }

  // 获取当前地图层级
  getViewZoom() {
    if (this.viewHandle) {
      return this.viewHandle.getZoom();
    }
    return this.minLevel;
  }

  getViewExtent() {
    if (this.viewHandle) {
      const mapExtent = this.viewHandle.calculateExtent(this.handle.getSize());
      const arr = transformExtentTo4326(mapExtent);
      const lngLat1 = calibrateWrapLongitudeLatitude(arr[0], arr[1]);
      const lngLat2 = calibrateWrapLongitudeLatitude(arr[2], arr[3]);
      return [lngLat1.longitude, lngLat1.latitude, lngLat2.longitude, lngLat2.latitude];
    }
    return [];
  }

  computedCenter = (arr: any) => {
    const centerX = arr[0] + (arr[2] - arr[0]) / 2;
    const centerY = arr[1] + (arr[3] - arr[1]) / 2;
    return [centerX, centerY];
  };

  getViewCenter() {
    if (this.viewHandle) {
      const extent = this.getViewExtent();
      if (extent.length) {
        return this.computedCenter(extent);
      } else {
        return [];
      }
    }

    return [];
  }

  getCanvasImage = () => {
    const mapCanvas = document.getElementById(this.container).querySelector("canvas");
    if (mapCanvas) {
      return mapCanvas.toDataURL("image/png");
    } else {
      return null;
    }
  };

  // 获取当前地图层级
  public getResolution() {
    if (this.viewHandle) {
      return this.viewHandle.getResolution();
    }
    return 0;
  }

  public getScale() {
    if (this.viewHandle) {
      const currentResolution = this.viewHandle.getResolution();
      return "1:" + (currentResolution * 3779.5275590551).toFixed(0);
    }
    return "1:1";
  }

  // 生成一个新增layer 的zindex级别
  public getCurrentzIndex() {
    return this.__zIndex++;
  }

  // 用于设置地图的交互功能是否启用
  public setActiveInteraction(interactionsProto: any, isActive = true) {
    if (this.handle) {
      const interactionsArray = this.handle!.getInteractions();
      interactionsArray.forEach((interaction: any) => {
        if (interaction instanceof interactionsProto) {
          interaction.setActive(isActive);
        }
      });
    }
  }

  // 禁用鼠标中键的地图放大缩小功能
  public disableMouseWheelZoom() {
    this.setActiveInteraction(MouseWheelZoom, false);
  }

  // 禁用鼠标中键的地图放大缩小功能
  // public disableZoom() {
  // 	this.handle!.getInteractions().forEach((interaction) => {
  // 		if (interaction instanceof MouseWheelZoom) {
  // 			interaction.setActive(false)
  // 		}
  // 	})
  // }

  // 产生一个地图事件
  public fireMapEvent(eventType: any) {
    if (this.handle) {
      return this.handle.dispatchEvent(eventType);
    }
    return false;
  }

  // 产生一个地图viewer事件
  public fireViewEvent(eventType: any) {
    if (this.viewHandle) {
      return this.viewHandle.dispatchEvent(eventType);
    }
    return false;
  }

  // 获取地图的所有图层 layers
  public getAllLayers() {
    if (this.handle) {
      return this.handle.getLayers().getArray();
    }
    return [];
  }

  // 通过ID 获取特定的图层
  public getLayerByID(id: string): any {
    // already judged this.handle
    const layers = this.getAllLayers();
    const foundLayers = layers.filter((layerItem: any) => {
      return layerItem.get("id") === id;
    });
    if (foundLayers.length > 0) {
      return foundLayers[0];
    } else {
      return null;
    }
  }

  // 删除所有图层
  public removeAllMapLayers() {
    // already judged this.handle
    const layers = this.getAllLayers();
    while (layers.length) {
      const layer = layers[0];
      this.handle!.removeLayer(layer);
    }
  }

  // 通过ID 删除特定的图层
  public removeLayerByID(id: string) {
    // already judged this.handle
    const layer = this.getLayerByID(id);
    if (layer) {
      this.handle!.removeLayer(layer);
    }
  }

  // 通过ID 获取特定的图层 数据源
  public getLayerSourceByID(id: string) {
    // already judged this.handle
    const layer = this.getLayerByID(id);
    if (layer) {
      return layer.getSource();
    }
    return null;
  }

  // 通过ID 获取特定的图层 特征
  public getLayerFeaturesByID(id: string) {
    // already judged this.handle
    const source = this.getLayerSourceByID(id);
    if (source) {
      return source.getFeatures();
    }
    return [];
  }

  // 动画方式将地图移动到特定的位置
  // 参数是 经度 、 纬度 、 动画时间
  public flyToPosition(longitude = 0, latitude = 0, duration = 1000) {
    if (this.viewHandle) {
      let to = [longitude, latitude];
      if (this.__Is3857) {
        to = transformLongitudeLatitude(to);
      }
      this.viewHandle.animate({ center: to, duration: duration });
    }
  }

  // 动画方式将地图移动到特定的层级
  // 参数是 地图层级、 动画时间
  public flyToZoom(zoom = 3, duration = 1000) {
    if (this.viewHandle) {
      this.viewHandle.animate({ zoom: zoom, duration: duration });
    }
  }

  // 动画方式将地图移动到特定的位置
  // 参数是 经度 、 纬度 、 层级、动画时间
  public flyToPositionAndZoom(longitude = 0, latitude = 0, zoom = 3, duration = 1000) {
    if (this.viewHandle) {
      let to = [longitude, latitude];
      if (this.__Is3857) {
        to = transformLongitudeLatitude(to);
      }
      this.viewHandle.animate({ center: to, duration: duration }, { zoom: zoom, duration: duration });
    }
  }

  // 直接将地图移动到特定的位置
  // 参数是 经度 、 纬度
  public setPosition(longitude = 0, latitude = 0) {
    if (this.viewHandle) {
      let to = [longitude, latitude];
      if (this.__Is3857) {
        to = transformLongitudeLatitude(to);
      }
      this.viewHandle.setCenter(to);
    }
  }

  // 直接将地图移动到特定的位置
  // 参数是 经度 、 纬度 、 层级
  public setPositionAndZoom(longitude = 0, latitude = 0, zoom = 3) {
    if (this.viewHandle) {
      let to = [longitude, latitude];
      if (this.__Is3857) {
        to = transformLongitudeLatitude(to);
      }
      this.viewHandle.setCenter(to);
      this.viewHandle.setZoom(zoom);
    }
  }

  // 将地图移动到特定的区域
  public fitToExtent(extent: Extent, padding = [0, 0, 0, 0], isTransformed = false) {
    if (this.viewHandle) {
      let transExtent = extent;
      if (!isTransformed) {
        if (this.__Is3857) {
          transExtent = transformExtentTo3857(extent);
        }
      }
      this.viewHandle.fit(transExtent, {
        padding: padding,
      });
    }
  }

  // 将地图移动到特定的souce
  public fitToLayerSourceByID(id: string, padding = [0, 0, 0, 0]) {
    const source = this.getLayerSourceByID(id);
    if (source) {
      const extent = source.getExtent();
      this.fitToExtent(extent, padding, true);
    }
  }

  // 将地图移动到特定的 feature
  public fitToFeature(feature: Feature<Geometry>, padding = [0, 0, 0, 0]) {
    const polygon = feature.getGeometry() as SimpleGeometry;
    this.fitToExtent(polygon, padding, true);
  }

  // 将地图移动到特定的区域
  // left down -> right up
  public fitToLDRU(ld_longitude: number, ld_latitude: number, ru_longitude: number, ru_latitude: number) {
    if (ld_longitude > ru_longitude || ld_latitude > ru_latitude) {
      return;
    }
    const extent = [ld_longitude, ld_latitude, ru_longitude, ru_latitude];
    this.fitToExtent(extent);
  }

  // 获取地图当前层级的范围
  public getExtentCenter(extent: Extent) {
    if (this.__Is3857) {
      return transformTo4326(getCenter(extent));
    } else if (this.__Is4326) {
      return getCenter(extent);
    }
    return [];
  }

  // 放大和缩小地图
  public zoomInOut(isZoomin = true, duration = 1000) {
    // already judged this.handle
    let currentZoom: number = this.getViewZoom();
    if (currentZoom) {
      if (isZoomin) {
        currentZoom += 1;
        if (currentZoom >= this.maxLevel) {
          currentZoom = this.maxLevel;
        }
      } else {
        currentZoom -= 1;
        if (currentZoom <= this.minLevel) {
          currentZoom = this.minLevel;
        }
      }
      this.flyToZoom(currentZoom, duration);
    }
  }

  // 设置地图的旋转方向
  public setRotation(rotation: number) {
    this.viewHandle.setRotation(rotation);
  }
}
