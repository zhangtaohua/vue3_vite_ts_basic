// 用来加载icon 或者小图片。

import * as Cesium from "cesium";
import type { DrawBasicOptions } from "./drawLayersTypes";
import CesiumBase from "./base";
import { nanoid } from "nanoid";

import { popupType, isCustomizeFlag, customMeta } from "../geoConstant";

import CsVueNodePopup from "./vueNodePopupLayers";
import type { VueNodeOptions } from "./vueNodePopupLayersTypes";

import CsScreenEvent from "./screenEvent";
import type { EventOptions } from "./screenEventTypes";

import CsBasicEntityLayers from "./entityBasicLayers";
import type {
  EllipseOptions,
  PolygonOptions,
  PolylineOptions,
  RectangleOptions,
  LabelOptions,
} from "./entityBasicLayersTypes";

import {
  getCsColor,
  getCsCartesian2,
  getCsCartesian3,
  getCsSpaceDistanceV1,
  getCsSpaceDistanceV2,
  getMidpoint,
  bearingV1,
  pointAngleV1,
  getAreaV1,
  bearingV2,
  pointAngleV2,
  getAreaV2,
} from "./csTools";

import { cesiumViewMode } from "./csConstant";
import { makePointStyle, makeLabelStyle } from "./style";
import * as turf from "@turf/turf";

import {
  MAP_DRAW_POINT,
  MAP_DRAW_SQUARE,
  MAP_DRAW_RECTANGLE,
  MAP_DRAW_POLYGON,
  MAP_DRAW_LINE,
  MAP_DRAW_CIRCLE,
  MAP_DRAW_GEOMETRY_CIRCLE,
  MAP_DRAW_GEODESIC_CIRCLE,
  MAP_MEASURE_DISTANCE,
  MAP_MEASURE_AREA,
  MAP_DRAW_GEOMETRYCOLLECTION,
  drawActionType,
} from "../geoConstant";

import {
  calibrateWrapLongitudeLatitude,
  getGeoPointFromCoords,
  getGeoPolygonFromPolygonArray,
  getGeoLineFromArray,
} from "../geoCommon";

export default class CsDrawLayers {
  public csBaseHandle: CesiumBase | null = null;
  public viewer: any = null;
  public entities: any = null;
  public dataSources: any = null;

  private __layers: any = null;
  private __layerIdPrefix = "Geojson_ENTITY_";
  private __areaIdPrefix = "Area_";
  private __distanceIdPrefix = "Dis_";

  public vuePopupIns: CsVueNodePopup | null = null;
  public mapEventIns: CsScreenEvent | null = null;
  public csEntityIns: CsBasicEntityLayers | null = null;

  public isShowDcActionPopup: boolean | undefined = false;
  private __drawData: any = {};
  private __crurentSelDrawData: any = {};

  public drawType = "";
  public drawModel = "";
  public drawHandler: any = null;

  constructor(mapBaseIns: CesiumBase) {
    this.csBaseHandle = mapBaseIns;
    this.viewer = mapBaseIns.viewer;
    this.entities = mapBaseIns.viewer.entities;
    this.dataSources = mapBaseIns.viewer.dataSources;
    this.__layers = new Map();

    this.vuePopupIns = new CsVueNodePopup(mapBaseIns);
    this.mapEventIns = new CsScreenEvent(mapBaseIns);
    this.csEntityIns = new CsBasicEntityLayers(mapBaseIns);

    if (!this.viewer.scene.pickPositionSupported) {
      window.alert("This browser does not support pickPosition.");
    }
  }

  public destructor() {
    this.vuePopupIns?.destructor();
    this.mapEventIns?.destructor();
    this.csEntityIns?.destructor();

    this.clearAllDraw();
    this.csBaseHandle = null;
    this.viewer = null;
    this.entities = null;
    this.dataSources = null;
    this.__layers = null;
    this.__drawData = null;
    this.__crurentSelDrawData = null;
  }

  public getDistanceString(length: number) {
    let lengthStr: number | string = 0;
    if (length > 10000) {
      lengthStr = length / 1000;
      lengthStr = lengthStr.toFixed(2) + " 千米";
    } else {
      lengthStr = length.toFixed(2) + " 米";
    }
    return lengthStr;
  }

  public drawDistanceLabel(pid: string, id: string, midPoint: any, length: number, isLastLabel = false) {
    const lengthStr = this.getDistanceString(length);

    const areaLabelOpt: any = {
      // id: `${this.__areaIdPrefix}${nanoid(10)}_`,
      id: id,
      pid: pid,
      name: "中点",
      position: midPoint,
      label: {
        text: lengthStr,
        font: "12px sans-serif",
        fillColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        backgroundColor: Cesium.Color.BLACK,
        showBackground: true,
        style: Cesium.LabelStyle.FILL,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    };

    if (isLastLabel) {
      areaLabelOpt.label["pixelOffset"] = [0, 32];
    }

    this.csEntityIns?.addLabelLayer(areaLabelOpt);
  }

  public getAreaString(area: number) {
    let areaNew: number | string = 0;
    if (area > 1000000) {
      areaNew = area / 1000000;
      areaNew = areaNew.toFixed(2) + " 平方千米";
    } else {
      areaNew = area.toFixed(2) + " 平方米";
    }
    return areaNew;
  }

  public drawAreaLabel(pid: string, id: string, position: any, area: number) {
    const areaNew: number | string = this.getAreaString(area);

    const areaLabelOpt = {
      // id: `${this.__areaIdPrefix}${nanoid(10)}_`,
      id: id,
      pid: pid,
      name: "多边形面积",
      position: position,
      label: {
        text: areaNew,
        font: "14px sans-serif",
        fillColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        backgroundColor: Cesium.Color.BLACK,
        showBackground: true,
        style: Cesium.LabelStyle.FILL,
        pixelOffset: new Cesium.Cartesian2(60, -60),
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    };

    this.csEntityIns?.addLabelLayer(areaLabelOpt);
  }

  public drawPointPinLabel(pid: string, id: string, position: any, text: any) {
    const billboardOpt = {
      id: id,
      pid: pid,
      name: "点几何",
      position: position,
      billboard: {
        show: true,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // default
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // default: CENTER
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      pin: {
        show: true,
        color: Cesium.Color.RED,
        size: 32,
      },
      label: {
        text: text,
        font: "12px sans-serif",
        fillColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        backgroundColor: Cesium.Color.BLACK,
        showBackground: true,
        style: Cesium.LabelStyle.FILL,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        heightReference: Cesium.HeightReference.NONE,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        pixelOffset: [0, -32],
      },
    };

    this.csEntityIns?.addBillboardLayer(billboardOpt);
  }

  public drawPointPin(pid: string, id: string, position: any) {
    const billboardOpt = {
      id: id,
      pid: pid,
      name: "点几何",
      position: position,
      billboard: {
        show: true,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // default
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // default: CENTER
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      pin: {
        show: true,
        color: Cesium.Color.RED,
        size: 36,
      },
    };

    this.csEntityIns?.addBillboardLayer(billboardOpt);
  }

  public drawPointLabel(pid: string, id: string, position: any, text: any) {
    const pointOpt = {
      id: id,
      pid: pid,
      name: "点标签",
      position: position,
      point: {
        show: true,
        color: Cesium.Color.RED,
        pixelSize: 12,
        outlineColor: Cesium.Color.RED,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
      label: {
        text: text,
        font: "12px sans-serif",
        fillColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        backgroundColor: Cesium.Color.BLACK,
        showBackground: true,
        style: Cesium.LabelStyle.FILL,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        heightReference: Cesium.HeightReference.NONE,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        pixelOffset: [0, -16],
      },
    };

    this.csEntityIns?.addPointLayer(pointOpt);
  }

  public drawPoint(pid: string, id: string, position: any) {
    const pointOpt = {
      id: id,
      pid: pid,
      name: "点几何",
      position: position,
      point: {
        show: true,
        color: Cesium.Color.RED,
        pixelSize: 12,
        outlineColor: Cesium.Color.RED,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    };

    this.csEntityIns?.addPointLayer(pointOpt);
  }

  public getPositionsCenter(positions: any) {
    const center = Cesium.BoundingSphere.fromPoints(positions).center;
    Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(center, center);
    const centerNew = new Cesium.ConstantPositionProperty(center);
    return center; // centerNew["_value"],
  }

  public drawPolyline(pid: string, id: string, positions: any) {
    if (positions.length < 1) {
      return null;
    }
    const center = this.getPositionsCenter(positions);

    const polylineOpt = {
      id: id,
      pid: pid,
      name: "线几何",
      position: center,
      polyline: {
        positions: positions,
        width: 5.0,
        color: Cesium.Color.RED,
        depthFailMaterial: Cesium.Color.RED,
        clampToGround: true,
      },
    };

    this.csEntityIns?.addPolylineLayer(polylineOpt);
  }

  public drawPolygon(pid: string, id: string, positions: any) {
    if (positions.length < 2) {
      return null;
    }
    const center = this.getPositionsCenter(positions);
    const polygonOpt = {
      id: id,
      pid: pid,
      name: "面几何",
      position: center,
      polygon: {
        hierarchy: positions,
        color: Cesium.Color.WHEAT.withAlpha(0.4),
      },
    };

    this.csEntityIns?.addPolygonLayer(polygonOpt);
  }

  public drawRectangle(pid: string, id: string, center: any, rect: any) {
    const rectangleOpt = {
      id: id,
      pid: pid,
      name: "矩形几何",
      position: center,
      rectangle: {
        coordinates: Cesium.Rectangle.fromDegrees(rect[0], rect[1], rect[2], rect[3]),
        color: Cesium.Color.RED.withAlpha(0.4),
      },
    };
    this.csEntityIns?.addRectangleLayer(rectangleOpt);
  }

  public removeDrawById(id: string) {
    this.csEntityIns?.removeLayerByID(id);
  }

  public removeWholeDrawByID(id: string) {
    if (this.csBaseHandle) {
      const ids = this.__layers.get(id);
      if (ids && ids.length) {
        for (let i = 0; i < ids.length; i++) {
          this.csEntityIns?.removeLayerByID(ids[i]);
        }
        this.__layers.delete(id);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public clearAllDraw() {
    this.csEntityIns?.clearEntities();
    this.__layers.clear();
  }

  public createId(type: string, id: string, isAddRandom = true) {
    if (isAddRandom) {
      return `${type}_${id}_${nanoid(10)}`;
    } else {
      return `${type}_${id}`;
    }
  }

  public customCallbackFunc: any = null;
  public currentLayerId: any = null;
  public currentDrawPositions: any = [];
  public currentDrawEntitiesIds: any = [];
  public currentSumLength: any = 0;
  public currentSumArea: any = 0;
  public isStartDraw = false;
  public lastLineAreaId: any = null;
  public drawPolyShape: any = null;
  public circleShapeRes: any = {};

  public resetDrawVar() {
    this.currentLayerId = null;
    this.customCallbackFunc = null;
    this.currentDrawPositions = [];
    this.currentDrawEntitiesIds = [];
    this.currentSumLength = 0;
    this.currentSumArea = 0;
    this.isStartDraw = false;
    this.lastLineAreaId = null;
    this.circleShapeRes = {};
  }

  public endDrawShape = (isDrawOnce = true) => {
    this.resetDrawVar();

    if (isDrawOnce) {
      if (this.drawHandler) {
        this.drawHandler.destroy();
        this.drawHandler = null;
      }

      // 恢复cesium 默认事件
      this.csBaseHandle?.disableDepthTest();
      this.csBaseHandle?.enableDoubleClick();
    }
  };

  public drawShape(options: DrawBasicOptions) {
    const shape = options.shape;
    const isClearDraw = options.isClear ?? true;

    const isShowSegments = options.isShowSegments ?? false; // 线段中间显示长度
    const isShowLngLat = options.isShowLngLat ?? false; // 显示点的经纬度
    const isShowLabel = options.isShowLabel ?? false; // 显示长度或者面积
    const isDrawOnce = options.once ?? true;
    this.isShowDcActionPopup = options.isShowAction ?? false;

    if (this.csBaseHandle) {
      // 要不要先清楚以前的图层呢？
      if (isClearDraw) {
        this.clearAllDraw();
      }

      this.__drawData = null;
      this.drawType = shape;
      this.drawModel = shape;

      if (this.drawHandler) {
        this.drawHandler.destroy();
      }
      this.drawHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

      // ---------------------------------------------------------------//
      // 绘制点
      if (shape == MAP_DRAW_POINT) {
        this.drawType = MAP_DRAW_POINT;
        // 开启深度检测
        this.csBaseHandle.enableDepthTest();
        this.csBaseHandle.disableDoubleClick();

        let cartesian: any = null;

        // 左键单击开始画点
        this.drawHandler.setInputAction((clickEvent: any) => {
          // 初始化
          this.resetDrawVar();

          if (this.viewer.scene.mode == Cesium.SceneMode.SCENE3D) {
            const ray = this.viewer.camera.getPickRay(clickEvent.position);
            cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
          } else if (this.viewer.scene.mode == Cesium.SceneMode.SCENE2D) {
            //捕获椭球体，将笛卡尔二维平面坐标转为椭球体的笛卡尔三维坐标
            cartesian = this.viewer.camera.pickEllipsoid(clickEvent.position, this.viewer.scene.globe.ellipsoid);
          }

          this.currentDrawPositions.push(cartesian);

          // 绘制当前点击的点
          const pointId = this.createId(shape, "point", true);
          if (isShowLngLat) {
            const { longitude, latitude } = this.csBaseHandle?.cartesian3ToLngLat(cartesian);
            const lngLatStr = longitude.toFixed(6) + ", " + latitude.toFixed(6);
            // this.drawPointLabel(this.currentLayerId, pointId, cartesian, lngLatStr);
            this.drawPointPinLabel(this.currentLayerId, pointId, cartesian, lngLatStr);
          } else {
            // this.drawPoint(this.currentLayerId, pointId, cartesian);
            this.drawPointPin(this.currentLayerId, pointId, cartesian);
          }
          this.currentDrawEntitiesIds.push(pointId);

          // 这里只记录画的 ID 值 方便后续删除操作
          this.currentLayerId = this.createId(MAP_DRAW_POINT, shape, true);
          this.__layers.set(this.currentLayerId, [...this.currentDrawEntitiesIds]);

          // 处理数据 调用回调函数
          this.getDrawData(options)();

          this.endDrawShape(isDrawOnce);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // 右键单击结束画线
        this.drawHandler.setInputAction((clickEvent: any) => {
          this.endDrawShape(isDrawOnce);
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        // ---------------------------------------------------------------//
        // 正方形
      } else if (shape == MAP_DRAW_SQUARE) {
        this.drawType = MAP_DRAW_SQUARE;
        // 开启深度检测
        this.csBaseHandle.enableDepthTest();
        this.csBaseHandle.disableDoubleClick();

        // 初始化
        this.resetDrawVar();
        let cartesian: any = null;

        // 左键单击开始画线
        this.drawHandler.setInputAction((clickEvent: any) => {
          if (!this.isStartDraw) {
            this.isStartDraw = true;
            this.currentLayerId = this.createId(MAP_DRAW_SQUARE, shape, true);
          }

          if (this.viewer.scene.mode == Cesium.SceneMode.SCENE3D) {
            const ray = this.viewer.camera.getPickRay(clickEvent.position);
            cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
            // console.log("3D line", ray, cartesian, typeof cartesian);
          } else if (this.viewer.scene.mode == Cesium.SceneMode.SCENE2D) {
            //捕获椭球体，将笛卡尔二维平面坐标转为椭球体的笛卡尔三维坐标
            cartesian = this.viewer.camera.pickEllipsoid(clickEvent.position, this.viewer.scene.globe.ellipsoid);
          }

          if (Cesium.defined(cartesian)) {
            this.currentDrawPositions.push(cartesian);
          }

          // 存在超过一个点时
          if (this.currentDrawPositions.length == 2) {
            const point0 = this.csBaseHandle?.cartesian3ToLngLat(this.currentDrawPositions[0]);
            const point1 = this.csBaseHandle?.cartesian3ToLngLat(this.currentDrawPositions[1]);

            let minLng = 0,
              maxLng = 0,
              minLat = 0,
              maxLat = 0;
            if (point0?.longitude >= point1?.longitude) {
              minLng = point1?.longitude;
              maxLng = point0?.longitude;
            } else {
              minLng = point0?.longitude;
              maxLng = point1?.longitude;
            }
            if (point0?.latitude >= point1?.latitude) {
              minLat = point1?.latitude;
              maxLat = point0?.latitude;
            } else {
              minLat = point0?.latitude;
              maxLat = point1?.latitude;
            }

            const bbox = [minLng, minLat, maxLng, maxLat];
            const squared = turf.square(bbox);

            const cartesian0 = this.csBaseHandle!.wgs84ToCartesian3(squared[0], squared[1], 0);
            const cartesian1 = this.csBaseHandle!.wgs84ToCartesian3(squared[2], squared[1], 0);
            const cartesian2 = this.csBaseHandle!.wgs84ToCartesian3(squared[2], squared[3], 0);
            const cartesian3 = this.csBaseHandle!.wgs84ToCartesian3(squared[0], squared[3], 0);

            // 绘制四个点
            let pointId = this.createId(shape, "point", true);
            if (isShowLngLat) {
              const lngLatStr = squared[0].toFixed(6) + ", " + squared[1].toFixed(6);
              this.drawPointLabel(this.currentLayerId, pointId, cartesian0, lngLatStr);
            } else {
              this.drawPoint(this.currentLayerId, pointId, cartesian0);
            }
            this.currentDrawEntitiesIds.push(pointId);

            pointId = this.createId(shape, "point", true);
            if (isShowLngLat) {
              const lngLatStr = squared[2].toFixed(6) + ", " + squared[1].toFixed(6);
              this.drawPointLabel(this.currentLayerId, pointId, cartesian1, lngLatStr);
            } else {
              this.drawPoint(this.currentLayerId, pointId, cartesian1);
            }
            this.currentDrawEntitiesIds.push(pointId);

            pointId = this.createId(shape, "point", true);
            if (isShowLngLat) {
              const lngLatStr = squared[2].toFixed(6) + ", " + squared[3].toFixed(6);
              this.drawPointLabel(this.currentLayerId, pointId, cartesian2, lngLatStr);
            } else {
              this.drawPoint(this.currentLayerId, pointId, cartesian2);
            }
            this.currentDrawEntitiesIds.push(pointId);

            pointId = this.createId(shape, "point", true);
            if (isShowLngLat) {
              const lngLatStr = squared[0].toFixed(6) + ", " + squared[3].toFixed(6);
              this.drawPointLabel(this.currentLayerId, pointId, cartesian3, lngLatStr);
            } else {
              this.drawPoint(this.currentLayerId, pointId, cartesian3);
            }
            this.currentDrawEntitiesIds.push(pointId);

            // 绘制线
            const lineId = this.createId(shape, "line", true);
            this.drawPolyline(this.currentLayerId, lineId, [
              cartesian0,
              cartesian1,
              cartesian2,
              cartesian3,
              cartesian0,
            ]);
            this.currentDrawEntitiesIds.push(lineId);

            if (isShowSegments) {
              let pointLength = getCsSpaceDistanceV1(cartesian0, cartesian1);
              this.currentSumLength = this.currentSumLength + pointLength;
              let midPosition = getMidpoint(cartesian0, cartesian1);
              // 线段中部长度
              let labelId = this.createId(shape, "label", true);
              this.drawDistanceLabel(this.currentLayerId, labelId, midPosition, pointLength);
              this.currentDrawEntitiesIds.push(labelId);

              pointLength = getCsSpaceDistanceV1(cartesian1, cartesian2);
              this.currentSumLength = this.currentSumLength + pointLength;
              midPosition = getMidpoint(cartesian1, cartesian2);
              // 线段中部长度
              labelId = this.createId(shape, "label", true);
              this.drawDistanceLabel(this.currentLayerId, labelId, midPosition, pointLength);
              this.currentDrawEntitiesIds.push(labelId);

              pointLength = getCsSpaceDistanceV1(cartesian2, cartesian3);
              this.currentSumLength = this.currentSumLength + pointLength;
              midPosition = getMidpoint(cartesian2, cartesian3);
              // 线段中部长度
              labelId = this.createId(shape, "label", true);
              this.drawDistanceLabel(this.currentLayerId, labelId, midPosition, pointLength);
              this.currentDrawEntitiesIds.push(labelId);

              pointLength = getCsSpaceDistanceV1(cartesian3, cartesian0);
              this.currentSumLength = this.currentSumLength + pointLength;
              midPosition = getMidpoint(cartesian3, cartesian0);
              // 线段中部长度
              labelId = this.createId(shape, "label", true);
              this.drawDistanceLabel(this.currentLayerId, labelId, midPosition, pointLength);
              this.currentDrawEntitiesIds.push(labelId);
            }

            if (this.lastLineAreaId) {
              this.removeDrawById(this.lastLineAreaId);
            }

            // 编制 矩形几何
            this.currentDrawPositions = [cartesian0, cartesian1, cartesian2, cartesian3];
            const rectId = this.createId(shape, "rect", true);
            const center = this.getPositionsCenter(this.currentDrawPositions);
            this.drawRectangle(this.currentLayerId, rectId, center, squared);
            this.currentDrawEntitiesIds.push(rectId);

            this.__layers.set(this.currentLayerId, [...this.currentDrawEntitiesIds]);

            // 处理数据 调用回调函数
            this.getDrawData(options)();

            this.endDrawShape(isDrawOnce);
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // 监听鼠标移动
        this.drawHandler.setInputAction((moveEvent: any) => {
          if (this.isStartDraw) {
            if (this.viewer.scene.mode == Cesium.SceneMode.SCENE3D) {
              const ray = this.viewer.camera.getPickRay(moveEvent.endPosition);
              cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
            } else if (this.viewer.scene.mode == Cesium.SceneMode.SCENE2D) {
              cartesian = this.viewer.camera.pickEllipsoid(moveEvent.endPosition, this.viewer.scene.globe.ellipsoid);
            }
            if (Cesium.defined(cartesian)) {
              // 画虚拟polygon
              if (this.lastLineAreaId) {
                this.removeDrawById(this.lastLineAreaId);
                this.lastLineAreaId = null;
              }

              if (this.currentDrawPositions.length == 1) {
                const point0 = this.csBaseHandle?.cartesian3ToLngLat(this.currentDrawPositions[0]);
                const point1 = this.csBaseHandle?.cartesian3ToLngLat(cartesian);

                let minLng = 0,
                  maxLng = 0,
                  minLat = 0,
                  maxLat = 0;
                if (point0?.longitude >= point1?.longitude) {
                  minLng = point1?.longitude;
                  maxLng = point0?.longitude;
                } else {
                  minLng = point0?.longitude;
                  maxLng = point1?.longitude;
                }
                if (point0?.latitude >= point1?.latitude) {
                  minLat = point1?.latitude;
                  maxLat = point0?.latitude;
                } else {
                  minLat = point0?.latitude;
                  maxLat = point1?.latitude;
                }

                const bbox = [minLng, minLat, maxLng, maxLat];
                const squared = turf.square(bbox);

                this.lastLineAreaId = this.createId(shape, "square", true);
                this.drawRectangle(this.currentLayerId, this.lastLineAreaId, point0, squared);
              }
            }
          }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // 右键单击结束画线
        this.drawHandler.setInputAction((clickEvent: any) => {
          // 删除虚拟polygon
          if (this.lastLineAreaId) {
            this.removeDrawById(this.lastLineAreaId);
            this.lastLineAreaId = null;
          }

          if (this.currentDrawPositions.length <= 1) {
            for (let i = 0; i < this.currentDrawEntitiesIds.length; i++) {
              this.csEntityIns?.removeLayerByID(this.currentDrawEntitiesIds[i]);
            }
          }

          this.endDrawShape(isDrawOnce);
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        // ---------------------------------------------------------------//
        // 矩形
      } else if (shape == MAP_DRAW_RECTANGLE) {
        this.drawType = MAP_DRAW_RECTANGLE;
        // 开启深度检测
        this.csBaseHandle.enableDepthTest();
        this.csBaseHandle.disableDoubleClick();

        // 初始化
        this.resetDrawVar();
        let cartesian: any = null;

        // 左键单击开始画线
        this.drawHandler.setInputAction((clickEvent: any) => {
          if (!this.isStartDraw) {
            this.isStartDraw = true;
            this.currentLayerId = this.createId(MAP_DRAW_RECTANGLE, shape, true);
          }

          if (this.viewer.scene.mode == Cesium.SceneMode.SCENE3D) {
            const ray = this.viewer.camera.getPickRay(clickEvent.position);
            cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
            // console.log("3D line", ray, cartesian, typeof cartesian);
          } else if (this.viewer.scene.mode == Cesium.SceneMode.SCENE2D) {
            //捕获椭球体，将笛卡尔二维平面坐标转为椭球体的笛卡尔三维坐标
            cartesian = this.viewer.camera.pickEllipsoid(clickEvent.position, this.viewer.scene.globe.ellipsoid);
          }

          if (Cesium.defined(cartesian)) {
            this.currentDrawPositions.push(cartesian);

            // 绘制当前点击的点
            const pointId = this.createId(shape, "point", true);
            if (isShowLngLat) {
              const { longitude, latitude } = this.csBaseHandle?.cartesian3ToLngLat(cartesian);
              const lngLatStr = longitude.toFixed(6) + ", " + latitude.toFixed(6);
              this.drawPointLabel(this.currentLayerId, pointId, cartesian, lngLatStr);
            } else {
              this.drawPoint(this.currentLayerId, pointId, cartesian);
            }
            this.currentDrawEntitiesIds.push(pointId);
          }

          // 存在超过一个点时
          if (this.currentDrawPositions.length == 2) {
            const point0 = this.csBaseHandle?.cartesian3ToLngLat(this.currentDrawPositions[0]);
            const point1 = this.csBaseHandle?.cartesian3ToLngLat(this.currentDrawPositions[1]);
            const cartesian0 = this.currentDrawPositions[0];
            const cartesian1 = this.csBaseHandle.wgs84ToCartesian3(point1?.longitude, point0?.latitude, 0);
            const cartesian2 = this.currentDrawPositions[1];
            const cartesian3 = this.csBaseHandle.wgs84ToCartesian3(point0?.longitude, point1?.latitude, 0);

            // 绘制另外两个点
            let pointId = this.createId(shape, "point", true);
            if (isShowLngLat) {
              const lngLatStr = point1?.longitude.toFixed(6) + ", " + point0?.latitude.toFixed(6);
              this.drawPointLabel(this.currentLayerId, pointId, cartesian1, lngLatStr);
            } else {
              this.drawPoint(this.currentLayerId, pointId, cartesian1);
            }
            this.currentDrawEntitiesIds.push(pointId);
            pointId = this.createId(shape, "point", true);
            if (isShowLngLat) {
              const lngLatStr = point0?.longitude.toFixed(6) + ", " + point1?.latitude.toFixed(6);
              this.drawPointLabel(this.currentLayerId, pointId, cartesian3, lngLatStr);
            } else {
              this.drawPoint(this.currentLayerId, pointId, cartesian3);
            }
            this.currentDrawEntitiesIds.push(pointId);

            // 绘制线
            const lineId = this.createId(shape, "line", true);
            this.drawPolyline(this.currentLayerId, lineId, [
              cartesian0,
              cartesian1,
              cartesian2,
              cartesian3,
              cartesian0,
            ]);
            this.currentDrawEntitiesIds.push(lineId);

            if (isShowSegments) {
              let pointLength = getCsSpaceDistanceV1(cartesian0, cartesian1);
              this.currentSumLength = this.currentSumLength + pointLength;
              let midPosition = getMidpoint(cartesian0, cartesian1);
              // 线段中部长度
              let labelId = this.createId(shape, "label", true);
              this.drawDistanceLabel(this.currentLayerId, labelId, midPosition, pointLength);
              this.currentDrawEntitiesIds.push(labelId);

              pointLength = getCsSpaceDistanceV1(cartesian1, cartesian2);
              this.currentSumLength = this.currentSumLength + pointLength;
              midPosition = getMidpoint(cartesian1, cartesian2);
              // 线段中部长度
              labelId = this.createId(shape, "label", true);
              this.drawDistanceLabel(this.currentLayerId, labelId, midPosition, pointLength);
              this.currentDrawEntitiesIds.push(labelId);

              pointLength = getCsSpaceDistanceV1(cartesian2, cartesian3);
              this.currentSumLength = this.currentSumLength + pointLength;
              midPosition = getMidpoint(cartesian2, cartesian3);
              // 线段中部长度
              labelId = this.createId(shape, "label", true);
              this.drawDistanceLabel(this.currentLayerId, labelId, midPosition, pointLength);
              this.currentDrawEntitiesIds.push(labelId);

              pointLength = getCsSpaceDistanceV1(cartesian3, cartesian0);
              this.currentSumLength = this.currentSumLength + pointLength;
              midPosition = getMidpoint(cartesian3, cartesian0);
              // 线段中部长度
              labelId = this.createId(shape, "label", true);
              this.drawDistanceLabel(this.currentLayerId, labelId, midPosition, pointLength);
              this.currentDrawEntitiesIds.push(labelId);
            }

            if (this.lastLineAreaId) {
              this.removeDrawById(this.lastLineAreaId);
            }

            // 编制 矩形几何
            const rectId = this.createId(shape, "rect", true);
            const center = this.getPositionsCenter(this.currentDrawPositions);
            let minLng = 0,
              maxLng = 0,
              minLat = 0,
              maxLat = 0;
            if (point0?.longitude >= point1?.longitude) {
              minLng = point1?.longitude;
              maxLng = point0?.longitude;
            } else {
              minLng = point0?.longitude;
              maxLng = point1?.longitude;
            }
            if (point0?.latitude >= point1?.latitude) {
              minLat = point1?.latitude;
              maxLat = point0?.latitude;
            } else {
              minLat = point0?.latitude;
              maxLat = point1?.latitude;
            }
            this.drawRectangle(this.currentLayerId, rectId, center, [minLng, minLat, maxLng, maxLat]);
            this.currentDrawEntitiesIds.push(rectId);

            this.__layers.set(this.currentLayerId, [...this.currentDrawEntitiesIds]);

            // 处理数据 调用回调函数
            this.currentDrawPositions = [cartesian0, cartesian1, cartesian2, cartesian3];
            this.getDrawData(options)();

            this.endDrawShape(isDrawOnce);
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // 监听鼠标移动
        this.drawHandler.setInputAction((moveEvent: any) => {
          if (this.isStartDraw) {
            if (this.viewer.scene.mode == Cesium.SceneMode.SCENE3D) {
              const ray = this.viewer.camera.getPickRay(moveEvent.endPosition);
              cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
            } else if (this.viewer.scene.mode == Cesium.SceneMode.SCENE2D) {
              cartesian = this.viewer.camera.pickEllipsoid(moveEvent.endPosition, this.viewer.scene.globe.ellipsoid);
            }
            if (Cesium.defined(cartesian)) {
              // 画虚拟polygon
              if (this.lastLineAreaId) {
                this.removeDrawById(this.lastLineAreaId);
                this.lastLineAreaId = null;
              }

              if (this.currentDrawPositions.length == 1) {
                this.lastLineAreaId = this.createId(shape, "rect", true);
                const midPosition = getMidpoint(this.currentDrawPositions[0], cartesian);
                const point0 = this.csBaseHandle?.cartesian3ToLngLat(this.currentDrawPositions[0]);
                const point1 = this.csBaseHandle?.cartesian3ToLngLat(cartesian);
                let minLng = 0,
                  maxLng = 0,
                  minLat = 0,
                  maxLat = 0;
                if (point0?.longitude >= point1?.longitude) {
                  minLng = point1?.longitude;
                  maxLng = point0?.longitude;
                } else {
                  minLng = point0?.longitude;
                  maxLng = point1?.longitude;
                }
                if (point0?.latitude >= point1?.latitude) {
                  minLat = point1?.latitude;
                  maxLat = point0?.latitude;
                } else {
                  minLat = point0?.latitude;
                  maxLat = point1?.latitude;
                }
                this.drawRectangle(this.currentLayerId, this.lastLineAreaId, midPosition, [
                  minLng,
                  minLat,
                  maxLng,
                  maxLat,
                ]);
              }
            }
          }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // 右键单击结束画线
        this.drawHandler.setInputAction((clickEvent: any) => {
          // 删除虚拟polygon
          if (this.lastLineAreaId) {
            this.removeDrawById(this.lastLineAreaId);
            this.lastLineAreaId = null;
          }

          if (this.currentDrawPositions.length <= 1) {
            for (let i = 0; i < this.currentDrawEntitiesIds.length; i++) {
              this.csEntityIns?.removeLayerByID(this.currentDrawEntitiesIds[i]);
            }
          }

          this.endDrawShape(isDrawOnce);
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        // ---------------------------------------------------------------//
        // 多边形 和 面积
      } else if (shape == MAP_DRAW_POLYGON || shape == MAP_MEASURE_AREA) {
        this.drawType = MAP_DRAW_POLYGON;
        // 开启深度检测
        this.csBaseHandle.enableDepthTest();
        this.csBaseHandle.disableDoubleClick();

        // 初始化
        this.resetDrawVar();
        let cartesian: any = null;

        // 左键单击开始画线
        this.drawHandler.setInputAction((clickEvent: any) => {
          if (!this.isStartDraw) {
            this.isStartDraw = true;
            this.currentLayerId = this.createId(MAP_DRAW_POLYGON, shape, true);
          }

          if (this.viewer.scene.mode == Cesium.SceneMode.SCENE3D) {
            const ray = this.viewer.camera.getPickRay(clickEvent.position);
            cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
            // console.log("3D line", ray, cartesian, typeof cartesian);
          } else if (this.viewer.scene.mode == Cesium.SceneMode.SCENE2D) {
            //捕获椭球体，将笛卡尔二维平面坐标转为椭球体的笛卡尔三维坐标
            cartesian = this.viewer.camera.pickEllipsoid(clickEvent.position, this.viewer.scene.globe.ellipsoid);
          }

          if (Cesium.defined(cartesian)) {
            this.currentDrawPositions.push(cartesian);

            // 绘制当前点击的点
            const pointId = this.createId(shape, "point", true);
            if (isShowLngLat) {
              const { longitude, latitude } = this.csBaseHandle?.cartesian3ToLngLat(cartesian);
              const lngLatStr = longitude.toFixed(6) + ", " + latitude.toFixed(6);
              this.drawPointLabel(this.currentLayerId, pointId, cartesian, lngLatStr);
            } else {
              this.drawPoint(this.currentLayerId, pointId, cartesian);
            }
            this.currentDrawEntitiesIds.push(pointId);
          }

          // 存在超过一个点时
          if (this.currentDrawPositions.length > 1) {
            const currentDrawLength = this.currentDrawPositions.length;
            // 绘制线
            const lineId = this.createId(shape, "line", true);
            this.drawPolyline(this.currentLayerId, lineId, [
              this.currentDrawPositions[currentDrawLength - 2],
              this.currentDrawPositions[currentDrawLength - 1],
            ]);
            this.currentDrawEntitiesIds.push(lineId);

            if (isShowSegments) {
              const pointLength = getCsSpaceDistanceV1(
                this.currentDrawPositions[currentDrawLength - 2],
                this.currentDrawPositions[currentDrawLength - 1],
              );
              this.currentSumLength = this.currentSumLength + pointLength;
              const midPosition = getMidpoint(
                this.currentDrawPositions[currentDrawLength - 2],
                this.currentDrawPositions[currentDrawLength - 1],
              );
              // 线段中部长度
              const labelId = this.createId(shape, "label", true);
              this.drawDistanceLabel(this.currentLayerId, labelId, midPosition, pointLength);
              this.currentDrawEntitiesIds.push(labelId);
            }
          }

          if (this.currentDrawPositions.length >= 3) {
            // 删除虚拟polygon
            if (this.lastLineAreaId) {
              this.removeDrawById(this.lastLineAreaId);
              this.lastLineAreaId = this.createId(shape, "polygon", true);
              const positions = [...this.currentDrawPositions];
              positions.push(this.currentDrawPositions[0]);
              this.drawPolygon(this.currentLayerId, this.lastLineAreaId, positions);
            }
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // 监听鼠标移动
        this.drawHandler.setInputAction((moveEvent: any) => {
          if (this.isStartDraw) {
            if (this.viewer.scene.mode == Cesium.SceneMode.SCENE3D) {
              const ray = this.viewer.camera.getPickRay(moveEvent.endPosition);
              cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
            } else if (this.viewer.scene.mode == Cesium.SceneMode.SCENE2D) {
              cartesian = this.viewer.camera.pickEllipsoid(moveEvent.endPosition, this.viewer.scene.globe.ellipsoid);
            }
            if (Cesium.defined(cartesian)) {
              // 画虚拟polygon
              if (this.lastLineAreaId) {
                this.removeDrawById(this.lastLineAreaId);
                this.lastLineAreaId = null;
              }

              if (this.currentDrawPositions.length >= 2) {
                this.lastLineAreaId = this.createId(shape, "polygon", true);
                const positions = [...this.currentDrawPositions];
                positions.push(cartesian);
                positions.push(this.currentDrawPositions[0]);
                this.drawPolygon(this.currentLayerId, this.lastLineAreaId, positions);
              }
            }
          }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // 右键单击结束画线
        this.drawHandler.setInputAction((clickEvent: any) => {
          // 删除虚拟polygon
          if (this.lastLineAreaId) {
            this.removeDrawById(this.lastLineAreaId);
            this.lastLineAreaId = null;
          }

          if (this.currentDrawPositions.length >= 3) {
            const currentDrawLength = this.currentDrawPositions.length;
            // 绘制线
            const lineId = this.createId(shape, "line", true);
            this.drawPolyline(this.currentLayerId, lineId, [
              this.currentDrawPositions[currentDrawLength - 1],
              this.currentDrawPositions[0],
            ]);
            this.currentDrawEntitiesIds.push(lineId);

            if (isShowSegments) {
              const pointLength = getCsSpaceDistanceV1(
                this.currentDrawPositions[currentDrawLength - 1],
                this.currentDrawPositions[0],
              );
              this.currentSumLength = this.currentSumLength + pointLength;
              const midPosition = getMidpoint(
                this.currentDrawPositions[currentDrawLength - 1],
                this.currentDrawPositions[0],
              );
              // 线段中部长度
              const labelId = this.createId(shape, "label", true);
              this.drawDistanceLabel(this.currentLayerId, labelId, midPosition, pointLength);
              this.currentDrawEntitiesIds.push(labelId);
            }

            // 绘制多边形
            const polygonId = this.createId(shape, "polygon", true);
            const positions = [...this.currentDrawPositions];
            positions.push(this.currentDrawPositions[0]);
            this.drawPolygon(this.currentLayerId, polygonId, positions);
            this.currentDrawEntitiesIds.push(polygonId);

            // 绘制最终面积值 在多边形中部。
            if (isShowLabel) {
              const labelId = this.createId(shape, "label", true);
              this.currentSumArea = getAreaV1(this.currentDrawPositions);
              const endPosition = this.getPositionsCenter(this.currentDrawPositions);
              this.drawAreaLabel(this.currentLayerId, labelId, endPosition, this.currentSumArea);
              this.currentDrawEntitiesIds.push(labelId);
            }

            // 这里只记录画的 ID 值 方便后续删除操作
            this.__layers.set(this.currentLayerId, [...this.currentDrawEntitiesIds]);
          } else {
            for (let i = 0; i < this.currentDrawEntitiesIds.length; i++) {
              this.csEntityIns?.removeLayerByID(this.currentDrawEntitiesIds[i]);
            }
          }

          // 处理数据 调用回调函数
          this.getDrawData(options)();

          this.endDrawShape(isDrawOnce);
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        // ---------------------------------------------------------------//
        // 测距
      } else if (shape == MAP_DRAW_LINE || shape == MAP_MEASURE_DISTANCE) {
        this.drawType = MAP_DRAW_LINE;
        // 开启深度检测
        this.csBaseHandle.enableDepthTest();
        this.csBaseHandle.disableDoubleClick();

        // 初始化
        this.resetDrawVar();

        let cartesian: any = null;

        // 左键单击开始画线
        this.drawHandler.setInputAction((clickEvent: any) => {
          if (!this.isStartDraw) {
            this.isStartDraw = true;
            this.currentLayerId = this.createId(MAP_DRAW_LINE, shape, true);
          }
          if (this.viewer.scene.mode == Cesium.SceneMode.SCENE3D) {
            const ray = this.viewer.camera.getPickRay(clickEvent.position);
            cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
            // const earthPosition = this.viewer.scene.pickPosition(clickEvent.position);
            // console.log("3D line", ray, cartesian, typeof cartesian);
          } else if (this.viewer.scene.mode == Cesium.SceneMode.SCENE2D) {
            //捕获椭球体，将笛卡尔二维平面坐标转为椭球体的笛卡尔三维坐标
            cartesian = this.viewer.camera.pickEllipsoid(clickEvent.position, this.viewer.scene.globe.ellipsoid);
            // console.log("2D line", cartesian, typeof cartesian);
          }

          if (Cesium.defined(cartesian)) {
            this.currentDrawPositions.push(cartesian);

            // 绘制当前点击的点
            const pointId = this.createId(shape, "point", true);
            if (isShowLngLat) {
              const { longitude, latitude } = this.csBaseHandle?.cartesian3ToLngLat(cartesian);
              const lngLatStr = longitude.toFixed(6) + ", " + latitude.toFixed(6);
              this.drawPointLabel(this.currentLayerId, pointId, cartesian, lngLatStr);
            } else {
              this.drawPoint(this.currentLayerId, pointId, cartesian);
            }
            this.currentDrawEntitiesIds.push(pointId);
          }

          // 存在超过一个点时
          if (this.currentDrawPositions.length > 1) {
            // 删除虚拟线段
            if (this.lastLineAreaId) {
              this.removeDrawById(this.lastLineAreaId);
              this.lastLineAreaId = null;
            }
            const currentDrawLength = this.currentDrawPositions.length;
            // 绘制线
            const lineId = this.createId(shape, "line", true);
            this.drawPolyline(this.currentLayerId, lineId, [
              this.currentDrawPositions[currentDrawLength - 2],
              this.currentDrawPositions[currentDrawLength - 1],
            ]);
            this.currentDrawEntitiesIds.push(lineId);

            if (isShowSegments) {
              const pointLength = getCsSpaceDistanceV1(
                this.currentDrawPositions[currentDrawLength - 2],
                this.currentDrawPositions[currentDrawLength - 1],
              );
              this.currentSumLength = this.currentSumLength + pointLength;
              const midPosition = getMidpoint(
                this.currentDrawPositions[currentDrawLength - 2],
                this.currentDrawPositions[currentDrawLength - 1],
              );
              const labelId = this.createId(shape, "label", true);
              this.drawDistanceLabel(this.currentLayerId, labelId, midPosition, pointLength);
              this.currentDrawEntitiesIds.push(labelId);
            }
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // 监听鼠标移动
        this.drawHandler.setInputAction((moveEvent: any) => {
          if (this.isStartDraw) {
            if (this.viewer.scene.mode == Cesium.SceneMode.SCENE3D) {
              const ray = this.viewer.camera.getPickRay(moveEvent.endPosition);
              cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
            } else if (this.viewer.scene.mode == Cesium.SceneMode.SCENE2D) {
              cartesian = this.viewer.camera.pickEllipsoid(moveEvent.endPosition, this.viewer.scene.globe.ellipsoid);
            }
            if (Cesium.defined(cartesian)) {
              // 画虚拟线段
              if (this.lastLineAreaId) {
                this.removeDrawById(this.lastLineAreaId);
                this.lastLineAreaId = null;
              }
              const currentDrawLength = this.currentDrawPositions.length;
              this.lastLineAreaId = this.createId(shape, "dashline", true);
              this.drawPolyline(this.currentLayerId, this.lastLineAreaId, [
                this.currentDrawPositions[currentDrawLength - 1],
                cartesian,
              ]);
            }
          }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // 右键单击结束画线
        this.drawHandler.setInputAction((clickEvent: any) => {
          // 绘制最终长度值。
          if (isShowLabel) {
            const labelId = this.createId(shape, "label", true);
            const currentDrawLength = this.currentDrawPositions.length;
            const endPosition = this.currentDrawPositions[currentDrawLength - 1].clone();
            this.drawDistanceLabel(this.currentLayerId, labelId, endPosition, this.currentSumLength, true);
            this.currentDrawEntitiesIds.push(labelId);
          }

          // 这里只记录画的 ID 值 方便后续删除操作
          this.__layers.set(this.currentLayerId, [...this.currentDrawEntitiesIds]);

          // 删除最后的线。
          if (this.lastLineAreaId) {
            this.removeDrawById(this.lastLineAreaId);
            this.lastLineAreaId = null;
          }

          // 处理数据 调用回调函数
          this.getDrawData(options)();

          this.endDrawShape(isDrawOnce);
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        // ---------------------------------------------------------------//
        // 普通圆
      } else if (shape == MAP_DRAW_GEOMETRY_CIRCLE || shape == MAP_DRAW_GEODESIC_CIRCLE) {
        this.drawType = MAP_DRAW_GEOMETRY_CIRCLE;
        // 开启深度检测
        this.csBaseHandle.enableDepthTest();
        this.csBaseHandle.disableDoubleClick();

        // 初始化
        this.resetDrawVar();
        let cartesian: any = null;

        // 左键单击开始画线
        this.drawHandler.setInputAction((clickEvent: any) => {
          if (!this.isStartDraw) {
            this.isStartDraw = true;
            this.currentLayerId = this.createId(MAP_DRAW_SQUARE, shape, true);
          }

          if (this.viewer.scene.mode == Cesium.SceneMode.SCENE3D) {
            const ray = this.viewer.camera.getPickRay(clickEvent.position);
            cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
          } else if (this.viewer.scene.mode == Cesium.SceneMode.SCENE2D) {
            //捕获椭球体，将笛卡尔二维平面坐标转为椭球体的笛卡尔三维坐标
            cartesian = this.viewer.camera.pickEllipsoid(clickEvent.position, this.viewer.scene.globe.ellipsoid);
          }

          if (Cesium.defined(cartesian)) {
            this.currentDrawPositions.push(cartesian);
          }

          // 存在超过一个点时
          if (this.currentDrawPositions.length == 2) {
            const point0 = this.csBaseHandle?.cartesian3ToLngLat(this.currentDrawPositions[0]);

            if (this.lastLineAreaId) {
              this.removeDrawById(this.lastLineAreaId);
            }
            const center = [point0?.longitude, point0?.latitude];
            const radius = getCsSpaceDistanceV1(this.currentDrawPositions[0], this.currentDrawPositions[1]) / 1000;
            const optionsTemp = { steps: 128, units: "kilometers", properties: { units: "kilometers" } };
            const circle = turf.circle(center, radius, optionsTemp);

            const circlePoints: any = [];
            if (circle && circle.geometry && circle.geometry.coordinates && circle.geometry.coordinates[0]) {
              circle.geometry.coordinates[0].forEach((coord: any) => {
                circlePoints.push(this.csBaseHandle?.wgs84ToCartesian3(coord[0], coord[1], 0));
              });
            }
            this.currentDrawPositions = circlePoints;

            const polygonId = this.createId(shape, "polygon", true);
            this.drawPolygon(this.currentLayerId, polygonId, circlePoints);
            this.currentDrawEntitiesIds.push(polygonId);

            this.circleShapeRes = {
              center,
              coordinates: [...circle.geometry.coordinates],
            };
            if (circlePoints.length) {
              this.currentSumArea = getAreaV1(circlePoints);
              this.currentSumLength = 0;
              for (let i = 0; i < circlePoints.length - 1; i++) {
                this.currentSumLength =
                  this.currentSumLength + getCsSpaceDistanceV1(circlePoints[i], circlePoints[i + 1]);
              }
            }

            // 编制 矩形几何
            this.__layers.set(this.currentLayerId, [...this.currentDrawEntitiesIds]);

            // 处理数据 调用回调函数
            this.getDrawData(options)();

            this.endDrawShape(isDrawOnce);
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // 监听鼠标移动
        this.drawHandler.setInputAction((moveEvent: any) => {
          if (this.isStartDraw) {
            if (this.viewer.scene.mode == Cesium.SceneMode.SCENE3D) {
              const ray = this.viewer.camera.getPickRay(moveEvent.endPosition);
              cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
            } else if (this.viewer.scene.mode == Cesium.SceneMode.SCENE2D) {
              cartesian = this.viewer.camera.pickEllipsoid(moveEvent.endPosition, this.viewer.scene.globe.ellipsoid);
            }
            if (Cesium.defined(cartesian)) {
              // 画虚拟polygon
              if (this.lastLineAreaId) {
                this.removeDrawById(this.lastLineAreaId);
                this.lastLineAreaId = null;
              }

              if (this.currentDrawPositions.length == 1) {
                const point0 = this.csBaseHandle?.cartesian3ToLngLat(this.currentDrawPositions[0]);

                const center = [point0?.longitude, point0?.latitude];
                const radius = getCsSpaceDistanceV1(this.currentDrawPositions[0], cartesian) / 1000;
                const options = { steps: 128, units: "kilometers", properties: { units: "kilometers" } };
                const circle = turf.circle(center, radius, options);

                const circlePoints = [];
                if (circle && circle.geometry && circle.geometry.coordinates && circle.geometry.coordinates[0]) {
                  circle.geometry.coordinates[0].forEach((coord: any) => {
                    circlePoints.push(this.csBaseHandle?.wgs84ToCartesian3(coord[0], coord[1], 0));
                  });
                }

                this.lastLineAreaId = this.createId(shape, "circle", true);
                this.drawPolygon(this.currentLayerId, this.lastLineAreaId, circlePoints);
              }
            }
          }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // 右键单击结束画线
        this.drawHandler.setInputAction((clickEvent: any) => {
          // 删除虚拟polygon
          if (this.lastLineAreaId) {
            this.removeDrawById(this.lastLineAreaId);
            this.lastLineAreaId = null;
          }

          if (this.currentDrawPositions.length <= 1) {
            for (let i = 0; i < this.currentDrawEntitiesIds.length; i++) {
              this.csEntityIns?.removeLayerByID(this.currentDrawEntitiesIds[i]);
            }
          }

          this.endDrawShape(isDrawOnce);
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        // ---------------------------------------------------------------//
        // 测地圆
      } else if (shape == MAP_DRAW_GEODESIC_CIRCLE) {
      }

      if (options.needModify) {
        // 如何消除旧的 modify ???
      }
    }
  }

  public getDrawPositionsLngLat(positions: any) {
    const coordinatesNew: any = [];
    positions.forEach((position: any) => {
      const { longitude, latitude } = this.csBaseHandle?.cartesian3ToLngLat(position);
      coordinatesNew.push([longitude, latitude]);
    });
    return coordinatesNew;
  }

  public getDrawData = (options: DrawBasicOptions) => {
    return () => {
      const shape = options.shape;
      this.customCallbackFunc = options.callback;

      let formatGeoJson: any = null;
      let formatCoords: any = null;

      let areaTemp = {
        area: 0,
        areaString: "0 平方米",
      };
      let lengthTemp = {
        length: 0,
        lengthString: "0.00 米",
      };
      let geoType = "";
      let center: any = [];
      const featureId = `draw_${nanoid(10)}`;

      // ---------------------------------------------------------------//
      // 点处理
      if (shape == MAP_DRAW_POINT) {
        geoType = MAP_DRAW_POINT;

        if (this.currentDrawPositions.length) {
          formatCoords = this.getDrawPositionsLngLat(this.currentDrawPositions);
          if (formatCoords.length) {
            formatCoords = formatCoords[0];
          }
          center = formatCoords;
        }

        this.__drawData = {
          id: featureId,
          shape: shape,
          geoType: geoType,
          coordinates: center,
          center: center,
          area: areaTemp,
          length: lengthTemp,
        };

        formatGeoJson = getGeoPointFromCoords(formatCoords, this.__drawData);

        // ---------------------------------------------------------------//
        // 多边形处理
      } else if (
        shape == MAP_DRAW_SQUARE ||
        shape == MAP_DRAW_RECTANGLE ||
        shape == MAP_DRAW_POLYGON ||
        shape == MAP_MEASURE_AREA
      ) {
        geoType = MAP_DRAW_POLYGON;
        const positions = [...this.currentDrawPositions, this.currentDrawPositions[0]];
        formatCoords = [this.getDrawPositionsLngLat(positions)];

        const lengthStr = this.getDistanceString(this.currentSumLength);
        lengthTemp = {
          length: this.currentSumLength,
          lengthString: lengthStr,
        };

        const areaStr = this.getAreaString(this.currentSumArea);
        areaTemp = {
          area: this.currentSumArea,
          areaString: areaStr,
        };
        const cartesian = this.getPositionsCenter(positions);
        const { longitude, latitude } = this.csBaseHandle?.cartesian3ToLngLat(cartesian);
        center = [longitude, latitude];

        this.__drawData = {
          id: featureId,
          shape: shape,
          geoType: geoType,
          coordinates: formatCoords,
          center: center,
          area: areaTemp,
          length: lengthTemp,
        };

        formatGeoJson = getGeoPolygonFromPolygonArray(formatCoords, this.__drawData);
        // ---------------------------------------------------------------//
        // 线处理
      } else if (shape == MAP_DRAW_LINE || shape == MAP_MEASURE_DISTANCE) {
        geoType = MAP_DRAW_LINE;

        formatCoords = this.getDrawPositionsLngLat(this.currentDrawPositions);

        const lengthStr = this.getDistanceString(this.currentSumLength);
        lengthTemp = {
          length: this.currentSumLength,
          lengthString: lengthStr,
        };
        const centerLength = Math.floor(formatCoords.length / 2);
        const centerTemp = formatCoords[centerLength];
        center = [centerTemp[0], centerTemp[1]];

        this.__drawData = {
          id: featureId,
          shape: shape,
          geoType: geoType,
          coordinates: formatCoords,
          center: center,
          area: areaTemp,
          length: lengthTemp,
        };

        formatGeoJson = getGeoLineFromArray(formatCoords, this.__drawData);

        // ---------------------------------------------------------------//
        // 普通圆处理
      } else if (shape == MAP_DRAW_GEOMETRY_CIRCLE || shape == MAP_DRAW_GEODESIC_CIRCLE) {
        geoType = MAP_DRAW_POLYGON;

        const lengthStr = this.getDistanceString(this.currentSumLength);
        lengthTemp = {
          length: this.currentSumLength,
          lengthString: lengthStr,
        };

        const areaStr = this.getAreaString(this.currentSumArea);
        areaTemp = {
          area: this.currentSumArea,
          areaString: areaStr,
        };

        center = this.circleShapeRes.center;
        formatCoords = this.circleShapeRes.coordinates;

        this.__drawData = {
          id: featureId,
          shape: shape,
          geoType: geoType,
          coordinates: formatCoords,
          center: center,
          area: areaTemp,
          length: lengthTemp,
        };

        formatGeoJson = getGeoPolygonFromPolygonArray(formatCoords, this.__drawData);

        // ---------------------------------------------------------------//
        // 测地圆处理
      } else if (shape == MAP_DRAW_GEODESIC_CIRCLE) {
      }

      this.__drawData = {
        id: featureId,
        shape: shape,
        geoType: geoType,
        coordinates: formatCoords,
        center: center,
        geojson: formatGeoJson,
        area: areaTemp,
        length: lengthTemp,
      };

      this.__crurentSelDrawData = {
        ...this.__drawData,
      };

      if (this.customCallbackFunc) {
        this.customCallbackFunc(drawActionType.draw, this.__drawData);
      }
    };
  };

  // end class
}
