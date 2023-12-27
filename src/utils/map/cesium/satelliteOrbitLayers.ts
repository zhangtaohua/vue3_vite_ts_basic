import * as Cesium from "cesium";

import { nanoid } from "nanoid";

import CesiumBase from "./base";

import type { SatelliteOrbitOptions } from "./satelliteOrbitLayersTypes";

import { isCustomizeFlag, customMeta } from "../geoConstant";

import SatelliteOrbit from "../satellite/orbit";

import { popupType } from "../geoConstant";

import CsVueNodePopup from "./vueNodePopupLayers";
import type { VueNodeOptions } from "./vueNodePopupLayersTypes";

import CsScreenEvent from "./screenEvent";
import type { EventOptions } from "./screenEventTypes";

import {
  getGeoPointFromLongitudeLatitude,
  getTwoDimArrayFromLngLatObj,
  getGeoLineFromArray,
  calibratePosionsExpand,
  calibratePosionsMerge,
} from "../geoCommon";

export default class CsSatelliteOrbitLayers {
  public csBaseHandle: CesiumBase | null = null;
  public viewer: any = null;
  public entities: any = null;
  public imageryLayers: any = null;
  public dataSources: any = null;

  private __layers: any = null;
  private __CZMLs: any = null;

  private __layerIdPrefix = "SATELLITE_ORBIT_";
  private __documentSuffix = "_document";
  private __orbitSuffix = "_orbit";
  private __receiverSuffix = "_receiver";
  private __satToResSuffix = "_sat_to_receiver";
  private __scanSuffix = "_scan";
  private __orbitName = "satellite_orbit";
  private __receiverName = "receiver";
  private __SatToReceiverName = "satellite_to_receiver";
  private __scanName = "satellite_scaning";

  public vuePopupIns: CsVueNodePopup | null = null;
  public mapEventIns: CsScreenEvent | null = null;

  constructor(mapBaseIns: CesiumBase) {
    this.csBaseHandle = mapBaseIns;
    this.imageryLayers = mapBaseIns.imageryLayers;
    this.dataSources = mapBaseIns.viewer.dataSources;
    this.viewer = mapBaseIns.viewer;
    this.entities = mapBaseIns.viewer.entities;

    this.__layers = new Map();
    this.__CZMLs = new Map();

    this.vuePopupIns = new CsVueNodePopup(mapBaseIns);
    this.mapEventIns = new CsScreenEvent(mapBaseIns);
  }

  public destructor() {
    this.vuePopupIns?.destructor();
    this.mapEventIns?.destructor();

    this.clearLayer();
    this.csBaseHandle = null;
    this.imageryLayers = null;
    this.dataSources = null;
    this.viewer = null;
    this.entities = null;

    this.__layers.clear();
    this.__layers = null;

    this.__CZMLs.clear();
    this.__CZMLs = null;
  }

  private __Id(id: string) {
    return `${this.__layerIdPrefix}${id}`;
  }

  private __Name(name: string) {
    return `${this.__layerIdPrefix}${name}`;
  }

  public vNodePopupCb = (options: SatelliteOrbitOptions) => {
    return (event: any) => {
      const pickPositon = event.position || event.endPosition; //  || event.startPosition
      const pick = this.viewer!.scene.pick(pickPositon);
      let cartesian;
      if (this.viewer!.scene.mode == Cesium.SceneMode.SCENE3D) {
        const ray: any = this.viewer!.camera.getPickRay(event.position);
        cartesian = this.viewer!.scene.globe.pick(ray, this.viewer!.scene);
      } else if (this.viewer!.scene.mode == Cesium.SceneMode.SCENE2D) {
        const ellipsoid = this.viewer.scene.globe.ellipsoid;
        cartesian = this.viewer!.camera!.pickEllipsoid(event.position, ellipsoid);
      }
      // console.log("cartesian", cartesian);
      if (cartesian) {
        const position = this.csBaseHandle?.cartesian3ToLngLat(cartesian);
        if (pick != undefined) {
          const entity = pick.id;
          const entityId = entity.properties && entity.properties.id;
          // console.log("entityId", entity, position, entityId);
          if (entityId == options.id) {
            // 如果用户传入了回调，那么 调用 ，可能会更新popup
            if (options.event?.callback) {
              options.event?.callback(event, entity, options);
              if (options.popup && options.popup.isUpdate) {
                const popupOpt = {
                  ...options.popup,
                  position: position ? [position?.longitude, position?.latitude, 0] : [0, 0, 0],
                  id: options.id,
                  name: options.name,
                };
                this.vuePopupIns?.updateLayer(popupOpt as VueNodeOptions);
              }
            }
            this.vuePopupIns?.showPopupByID(options.id);
          }
          // 加上下面 else 每次只能显示一个。
          // else {
          //   this.vuePopupIns?.hiddenPopupByID(options.id);
          // }
        } else {
          if (
            options.event?.eventType == Cesium.ScreenSpaceEventType.MOUSE_MOVE ||
            options.event?.eventType == Cesium.ScreenSpaceEventType.PINCH_MOVE
          ) {
            this.vuePopupIns?.hiddenPopupByID(options.id);
          }
        }
      }
    };
  };

  public addTrigerPopupLayer = (options: SatelliteOrbitOptions) => {
    if (options.popup) {
      const popupOpt = {
        ...options.popup,
        // position: options.position,
        id: options.id,
        name: options.name,
      };
      if (popupOpt.popupType == popupType.vnode) {
        // 由于是卫星轨道,显示位置要实时更新,所以不初始化了.
        // this.vuePopupIns?.addLayer(popupOpt as VueNodeOptions);

        // 如果有事件，就通过事件触发显示，如果没有事件触发，就直接显示。
        if (options.event) {
          const eventOpt = options.event;
          const delay = eventOpt.delay ?? 300;
          const debounce = eventOpt.debounce ?? true;
          const debounceOption = eventOpt.debounceOption ?? {};

          const eventOptions: EventOptions = {
            id: options.id,
            type: eventOpt.eventType,
            element: this.csBaseHandle!.canvas,
            cb: this.vNodePopupCb(options),
            modify: eventOpt.modify,
            delay,
            debounce,
            debounceOption,
          };
          this.mapEventIns!.addEvent(eventOptions);
        } else {
          // 没有事件触发直接显示
          // this.vuePopupIns?.showPopupByID(options.id);
        }
      }
    }
  };

  public getISOString(time: any, isLocal = true) {
    let timeIns = null;
    if (time) {
      timeIns = new Date(time);
    } else {
      timeIns = new Date();
    }

    if (isLocal) {
      const offsetMinutes = 0 - timeIns.getTimezoneOffset();
      const timeNew = timeIns.getTime() + offsetMinutes * 60 * 1000;
      timeIns = new Date(timeNew);
    }
    return timeIns.toISOString();
  }

  public getISOIntervalString(startTime: any, endTime: any, secondsPerInterval: number, isLocal = true) {
    const timeInterval = [];
    const timeIntervalStamp = [];

    const startTimeIns = startTime ? new Date(startTime) : new Date();
    const endTimeIns = endTime ? new Date(endTime) : new Date(startTimeIns.getTime() + secondsPerInterval * 1000);

    const startTimeStamp = startTimeIns.getTime();
    const endTimeStamp = endTimeIns.getTime();

    timeInterval.push(this.getISOString(startTimeStamp, isLocal));
    timeIntervalStamp.push(startTimeStamp);

    let i = 0;
    while (true) {
      i++;
      const intervalStamp = startTimeStamp + i * secondsPerInterval * 1000;
      if (intervalStamp < endTimeStamp) {
        timeInterval.push(this.getISOString(intervalStamp, isLocal));
        timeIntervalStamp.push(intervalStamp);
      } else {
        break;
      }
    }

    timeInterval.push(this.getISOString(endTimeStamp, isLocal));
    timeIntervalStamp.push(endTimeStamp);

    return {
      isoString: timeInterval,
      timestamp: timeIntervalStamp,
    };
  }

  public createCZMLDocument(name: string, startISOstring: string, endISOstring: string, multiplier: number) {
    return [
      {
        id: "document",
        name: name,
        version: "1.0",
        clock: {
          // interval为有效时间，currentTime表示起始点，multiplier表示时钟速度
          interval: startISOstring + "/" + endISOstring,
          currentTime: startISOstring, // 当前时间
          multiplier: multiplier, // 乘数
          range: "LOOP_STOP",
          step: "SYSTEM_CLOCK_MULTIPLIER",
        },
      },
    ];
  }

  public hasCZMLByID(id: string) {
    if (this.__CZMLs.size) {
      return this.__CZMLs.has(id);
    }
    return false;
  }

  public removeCZMLByID(id: string) {
    if (this.__CZMLs.size) {
      return this.__CZMLs.delete(id);
    } else {
      return false;
    }
  }

  public clearCZMLByID() {
    if (this.__CZMLs.size) {
      return this.__CZMLs.clear();
    } else {
      return false;
    }
  }

  public getOrCreateCZMLById(
    id: string,
    name: string,
    startISOstring: string,
    endISOstring: string,
    multiplier: number,
  ) {
    let documentCZML = [];
    if (this.hasCZMLByID(id)) {
      documentCZML = this.__CZMLs.get(id);
    } else {
      documentCZML = this.createCZMLDocument(name, startISOstring, endISOstring, multiplier);
    }
    return documentCZML;
  }

  public createCZMLSatellite(options: SatelliteOrbitOptions) {
    if (!options.tle1 || !options.tle2 || !options.id) {
      return null;
    }
    const name = options.name ? options.name : nanoid(10);

    const timeInterval = options.timeInterval ? options.timeInterval : 1000;

    const orbitIns = new SatelliteOrbit(options.tle1, options.tle2);

    const timeAll = this.getISOIntervalString(options.startTime, options.endTime, orbitIns.secondsPerInterval, true);
    const startISOstring = timeAll.isoString[0];
    const endISOstring = timeAll.isoString[timeAll.isoString.length - 1];

    // const lnglatDatas = orbitIns.getOrbitDatasWithTime(startISOstring, endISOstring, timeInterval);
    const lnglatDatas = orbitIns.getOrbitDatasEciWithTime(startISOstring, endISOstring, timeInterval);

    const labelHorizontalOrigin = "LEFT";
    const labelPixelOffset = { cartesian2: [20, 0.0] };

    const timeIOSStrings = timeAll.isoString;
    const leadTime = [];
    const trailTime = [];
    // 设置后卫星轨道一圈一圈的显示
    for (let i = 0; i < timeIOSStrings.length - 2; i++) {
      const sTime = timeIOSStrings[i];
      const eTime = timeIOSStrings[i + 1];
      leadTime.push({
        interval: sTime + "/" + eTime,
        epoch: sTime,
        number: [0, orbitIns.secondsPerInterval, orbitIns.secondsPerInterval, 0],
      });
      // 设置后，卫星运行完一圈清除原有轨道，只显示当前轨道（一圈）
      trailTime.push({
        interval: sTime + "/" + eTime,
        epoch: sTime,
        number: [0, 0, orbitIns.secondsPerInterval, orbitIns.secondsPerInterval],
      });
    }

    const orbitCZML = [
      {
        id: `${options.id}${this.__orbitSuffix}`,
        name: this.__orbitName,
        description: "stallite_path_" + name,
        availability: startISOstring + "/" + endISOstring,
        // billboard: {
        //   eyeOffset: {
        //     cartesian: [0.0, 0, 0.0]
        //   },
        //   horizontalOrigin: 'CENTER',
        //   image: SatelliteImg,
        //   pixelOffset: {
        //     cartesian2: [0, 20]
        //   },
        //   scale: 0.6,
        //   show: true,
        //   verticalOrigin: 'BOTTOM'
        // },
        label: {
          horizontalOrigin: labelHorizontalOrigin,
          font: "12px 楷体",
          // font: "11pt Lucida Console",
          outlineWidth: 3,
          outlineColor: {
            rgba: [0, 0, 0, 255],
          },
          show: true,
          pixelOffset: labelPixelOffset,
          // pixelSize: "100px",//pixelSize表示点的像素大小
          text: name,
          fillColor: { rgba: [255, 255, 255, 255] },
          showBackground: true,
          backgroundColor: { rgba: [0, 0, 0, 125] },
        },
        path: {
          material: {
            // polylineOutline: {
            //   color: { rgba: [35, 219, 252, 255] }
            // },
            solidColor: {
              // color: { rgba: [35, 219, 252, 255] }
              color: { rgba: [1, 255, 216, 255] },
            },
          },
          width: 1,
          show: [
            {
              interval: startISOstring + "/" + endISOstring,
              boolean: true,
            },
          ],
          resolution: 120,
          leadTime: leadTime,
          trailTime: trailTime,
        },
        // position属性决定模型在世界坐标系内的位置
        // orientation决定模型在世界坐标系内的姿态，并最终由orientation的unitQuaternion表示
        // unitQuaternion即单位四元数，可与偏航俯仰滚转相互转换，并避免偏航俯仰滚转的万向节锁定问题，但其本质上都是一个旋转矩阵，可决定模型在世界坐标系内的姿态。
        position: {
          interpolationAlgorithm: "LAGTANGE", // 插值算法为LAGRANGE，还有HERMITE,GEODESIC
          interpolationDegree: 5, // 度数 //1为线性插值，2为平方插值
          referenceFrame: "INERTIAL", // 用于标识众所周知的参考帧的常数。 值 固定的FIXED  惯性的INERTIAL
          // interval: startISOstring + "/" + endISOstring,
          epoch: startISOstring, // 朱利安时间=UTC=GMT），北京时间=UTC+8=GMT+8
          // cartographicDegrees: lnglatDatas, // 点的位置由经度、纬度以及高程来表示 正常看到的
          cartesian: lnglatDatas,
          // cartographicRadians: lnglatDatas, // 点的位置由经度、纬度以及高程来表示 用弧度表示
        },
        // orientation: new Cesium.VelocityOrientationProperty(propertyHandle),
        // orientation: {
        //   interpolationAlgorithm: "LAGTANGE",
        //   interpolationDegree: 5,
        //   epoch: startISOstring,
        //   unitQuaternion: orientationHandle,
        // },
        orientation: {
          velocityReference: "#position",
        },
        model: {
          gltf: options.model.url,
          scale: 1,
          minimumPixelSize: 90,
          autoHeading: true,
          show: true,
          // modelMatrix: modelMatrix
        },
        properties: options,
      },
    ];

    return {
      orbitIns: orbitIns,
      czml: orbitCZML,
      startISOstring: startISOstring,
      endISOstring: endISOstring,
      timeAll: timeAll,
      lnglatDatas: lnglatDatas,
    };
  }

  // 用来创建接收站的
  public createCZMLReceiver(options: any) {
    const position = Cesium.Cartesian3.fromDegrees(options.position[0], options.position[1], options.position[2]);
    const hpRoll = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(90), 0, 0);
    const orientation: any = Cesium.Transforms.headingPitchRollQuaternion(position, hpRoll);

    const czml: any = [
      {
        id: `${options.id}${this.__receiverSuffix}`,
        name: this.__receiverName,
        position: {
          // cartographicDegrees: options.position,
          cartesian: [position.x, position.y, position.z],
        },
        orientation: {
          unitQuaternion: [orientation.x, orientation.y, orientation.z, orientation.w],
        },
        label: {
          text: options.name,
          font: 14 + "px" + " " + "MicroSoft YaHei",
          horizontalOrigin: "LEFT",
          scale: 1,
          style: Cesium.LabelStyle.FILL,
          fillColor: Cesium.Color.YELLOW,
          pixelOffset: new Cesium.Cartesian2(30, 0), //偏移量
          showBackground: true,
          backgroundColor: { rgba: [112, 89, 57, 200] },
          show: true,
        },
        properties: options,
      },
    ];
    if (options.hasModel && options.model && options.model.url) {
      const scale = options.model.scale ? options.model.scale : 1;
      const minimumPixelSize = options.model.minimumPixelSize ? options.model.minimumPixelSize : 64;
      const maximumScale = options.model.maximumScale ? options.model.maximumScale : 20000;
      czml[0]["model"] = {
        gltf: options.model.url,
        scale: scale,
        minimumPixelSize: minimumPixelSize,
        maximumScale: maximumScale,
        runAnimations: false,
        // articulations: {},
        show: true,
      };
    }

    return czml;
  }

  // 用来获取空间距离，可是好像不太对
  public getSpaceDistance(point1: any, point2: any) {
    const point1cartographic = Cesium.Cartographic.fromCartesian(point1);
    const point2cartographic = Cesium.Cartographic.fromCartesian(point2);
    // console.log("point2cartographic", point1cartographic, point2cartographic);
    /**根据经纬度计算出距离**/
    const geodesic = new Cesium.EllipsoidGeodesic();
    geodesic.setEndPoints(point1cartographic, point2cartographic);
    const s = geodesic.surfaceDistance;
    //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)))
    //返回两点之间的距离
    // s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
    return s;
  }

  // 用来模拟卫星到接收站之间的连线
  public createReceiveAnimation(statelliteCZML: any, options: any, startStamp: number, receiveId: string) {
    // console.log("startStamp", startStamp, this.getISOString(startStamp));
    const satellitePositions = statelliteCZML[0].position.cartesian;
    const receiverPosition = options.receiver.position;
    if (!receiverPosition || !satellitePositions) {
      return null;
    }
    const receiverCartesian = Cesium.Cartesian3.fromDegrees(
      receiverPosition[0],
      receiverPosition[1],
      receiverPosition[2],
    );
    // 因为轨道算出来后 * 1000 了。
    // receiverCartesian.x * 1000;
    // receiverCartesian.y * 1000;
    // receiverCartesian.z * 1000;

    const showArray = [];
    let showLeadtime: any = 0;
    let showTailtime: any = 0;
    let notShowLeadtime: any = 0;
    let notShowTailtime: any = 0;

    for (let i = 0; i < satellitePositions.length - 3; i = i + 4) {
      const timeTemp = satellitePositions[i];
      const sateTempCartesian = new Cesium.Cartesian3(
        satellitePositions[i + 1],
        satellitePositions[i + 2],
        satellitePositions[i + 3],
      );
      const lnglat = this.csBaseHandle?.cartesian3ToLngLat(sateTempCartesian);
      const sateTempCartesian3 = Cesium.Cartesian3.fromDegrees(lnglat?.longitude, lnglat?.latitude, 0);
      // const distance = Cesium.Cartesian3.distance(sateTempCartesian, receiverCartesian);
      const distance = this.getSpaceDistance(sateTempCartesian3, receiverCartesian);
      // console.log("distance", distance, distance < 2000000, lnglat);
      if (distance < 2000000) {
        if (!showLeadtime) {
          showLeadtime = startStamp + timeTemp * 1000;
        } else {
          showTailtime = startStamp + timeTemp * 1000;
        }

        if (notShowLeadtime && notShowTailtime) {
          notShowLeadtime = this.getISOString(notShowLeadtime);
          notShowTailtime = this.getISOString(notShowTailtime);
          showArray.push({
            interval: `${notShowLeadtime}/${notShowTailtime}`,
            boolean: false,
          });
          notShowLeadtime = 0;
          notShowTailtime = 0;
        }
      } else {
        if (!notShowLeadtime) {
          notShowLeadtime = startStamp + timeTemp * 1000;
        } else {
          notShowTailtime = startStamp + timeTemp * 1000;
        }

        if (showLeadtime && showTailtime) {
          showLeadtime = this.getISOString(showLeadtime);
          showTailtime = this.getISOString(showTailtime);
          showArray.push({
            interval: `${showLeadtime}/${showTailtime}`,
            boolean: true,
          });
          showLeadtime = 0;
          showTailtime = 0;
        }
      }
    }
    if (notShowLeadtime && notShowTailtime) {
      notShowLeadtime = this.getISOString(notShowLeadtime);
      notShowTailtime = this.getISOString(notShowTailtime);
      showArray.push({
        interval: `${notShowLeadtime}/${notShowTailtime}`,
        boolean: false,
      });
      notShowLeadtime = 0;
      notShowTailtime = 0;
    }

    if (showLeadtime && showTailtime) {
      showLeadtime = this.getISOString(showLeadtime);
      showTailtime = this.getISOString(showTailtime);
      showArray.push({
        interval: `${showLeadtime}/${showTailtime}`,
        boolean: true,
      });
      showLeadtime = 0;
      showTailtime = 0;
    }

    const statelliteCZMLId = statelliteCZML[0].id + "#position";
    const receiveIdPos = receiveId + "#position";
    // console.log("showArray", showArray);
    const startTimeStr = this.getISOString(startStamp);
    const endTimeeStr = this.getISOString(startStamp + satellitePositions[satellitePositions.length - 4] * 1000);
    const polyCzml = [
      {
        id: `${statelliteCZML[0].id}_${receiveId}_${nanoid(10)}${this.__satToResSuffix}`,
        name: this.__SatToReceiverName,
        availability: [`${startTimeStr}/${endTimeeStr}`],
        description: "",
        polyline: {
          show: showArray,
          width: 1,
          material: {
            solidColor: {
              color: {
                rgba: [0, 255, 0, 255],
              },
            },
          },
          arcType: "NONE",
          positions: {
            references: [statelliteCZMLId, receiveIdPos],
          },
        },
        properties: options,
      },
    ];

    return polyCzml;
  }

  // 不要使用，放在这里供参考
  private getModelMatrix(pointA: any, pointB: any) {
    const vector2 = Cesium.Cartesian3.subtract(pointB, pointA, new Cesium.Cartesian3());
    const normal = Cesium.Cartesian3.normalize(vector2, new Cesium.Cartesian3());

    const rotationMatrix3 = Cesium.Transforms.rotationMatrixFromPositionVelocity(
      pointA,
      normal,
      Cesium.Ellipsoid.WGS84,
    );
    const orientation = Cesium.Quaternion.fromRotationMatrix(rotationMatrix3);
    const modelMatrix4 = Cesium.Matrix4.fromRotationTranslation(rotationMatrix3, pointA);
    // const modelMatrix4 = Cesium.Matrix4.fromRotationTranslation(rotationMatrix3, pointB);
    const hpr = Cesium.HeadingPitchRoll.fromQuaternion(orientation);
    return {
      orientation,
      modelMatrix4,
      hpr,
    };
  }

  // 不要使用，放在这里供参考
  private getHeadingPitchRoll(m: any) {
    const m1 = Cesium.Transforms.eastNorthUpToFixedFrame(
      Cesium.Matrix4.getTranslation(m, new Cesium.Cartesian3()),
      Cesium.Ellipsoid.WGS84,
      new Cesium.Matrix4(),
    );
    const m3 = Cesium.Matrix4.multiply(Cesium.Matrix4.inverse(m1, new Cesium.Matrix4()), m, new Cesium.Matrix4());

    // 得到旋转矩阵
    const mat3 = Cesium.Matrix4.getMatrix3(m3, new Cesium.Matrix3());
    const quaternion = Cesium.Quaternion.fromRotationMatrix(mat3);
    const hpr = Cesium.HeadingPitchRoll.fromQuaternion(quaternion);
    return {
      hpr,
      quaternion,
    };
  }

  public createLayer(options: SatelliteOrbitOptions) {
    const id = this.__Id(options.id);
    const name = options.name ? options.name : nanoid(10);
    const prefixname = this.__Name(name);

    const statelliteCZML = this.createCZMLSatellite(options);
    if (options.receiver) {
      const receiverCZML = this.createCZMLReceiver(options.receiver);
      statelliteCZML!.czml = statelliteCZML!.czml!.concat(receiverCZML);

      // 用来绘制卫星和接收站之间的连线的，
      // 不过加上删除时会出错，是cesium 内部问题，无法解决删除报错问题，暂时不用此功能！！！！
      // https://github.com/CesiumGS/cesium/issues/7758
      const polyCzml = this.createReceiveAnimation(
        statelliteCZML!.czml,
        options,
        statelliteCZML?.timeAll.timestamp[0],
        receiverCZML[0].id,
      );

      if (polyCzml) {
        statelliteCZML!.czml = statelliteCZML!.czml!.concat(polyCzml);
      }
    }

    if (options.scan) {
      const scanStartISOstring = this.getISOString(options.scan!.startTime, true);
      const scanEndISOstring = this.getISOString(options.scan!.endTime, true);

      if (options.scan.shape === "cylinder") {
        // const statelliteCZMLId = statelliteCZML!.czml[0].id + "#position";
        const lnglatDatasNew = [];
        const lnglatDatasTemp = statelliteCZML.lnglatDatas;
        for (let i = 0; i <= lnglatDatasTemp.length - 4; i = i + 4) {
          lnglatDatasNew.push(
            lnglatDatasTemp[i],
            lnglatDatasTemp[i + 1] / 1.05,
            lnglatDatasTemp[i + 2] / 1.05,
            lnglatDatasTemp[i + 3] / 1.05,
          );
        }

        const scanShapeCzml = {
          id: `${options.id}${this.__scanSuffix}`,
          name: this.__scanName,
          // position: {
          //   reference: statelliteCZMLId,
          // },
          position: {
            interpolationAlgorithm: "LAGTANGE", // 插值算法为LAGRANGE，还有HERMITE,GEODESIC
            interpolationDegree: 5, // 度数 //1为线性插值，2为平方插值
            referenceFrame: "INERTIAL", // 用于标识众所周知的参考帧的常数。 值 固定的FIXED  惯性的INERTIAL
            epoch: statelliteCZML.startISOstring, // 朱利安时间=UTC=GMT），北京时间=UTC+8=GMT+8
            cartesian: lnglatDatasNew,
          },
          cylinder: {
            length: 500000.0,
            topRadius: 0.0,
            bottomRadius: 300000.0,
            material: {
              solidColor: {
                color: {
                  rgba: [255, 0, 0, 255],
                },
              },
            },
            // show: true,
            show: [
              {
                interval: scanStartISOstring + "/" + scanEndISOstring,
                boolean: true,
              },
            ],
          },
          properties: options,
        };
        statelliteCZML!.czml = statelliteCZML!.czml!.concat(scanShapeCzml);
      } else if (options.scan.shape === "wedge") {
        const lnglatDatasNew = [];
        // const lnglatDatasNew2 = [];
        const lnglatDatasTemp = statelliteCZML.lnglatDatas;

        // const pitch90 = new Cesium.HeadingPitchRoll(
        //   Cesium.Math.toRadians(0),
        //   Cesium.Math.toRadians(-90),
        //   Cesium.Math.toRadians(0),
        // );
        // const testQuat = Cesium.Quaternion.fromHeadingPitchRoll(testH);

        for (let i = 0; i <= lnglatDatasTemp.length - 4; i = i + 4) {
          const l1 = lnglatDatasTemp[i + 1] / 1.05;
          const l2 = lnglatDatasTemp[i + 2] / 1.05;
          const l3 = lnglatDatasTemp[i + 3] / 1.05;
          lnglatDatasNew.push(lnglatDatasTemp[i], l1, l2, l3);

          // const newCartesian = new Cesium.Cartesian3(l1, l2, l3);

          // // const l4 = lnglatDatasTemp[i + 5] / 1.05;
          // // const l5 = lnglatDatasTemp[i + 6] / 1.05;
          // // const l6 = lnglatDatasTemp[i + 7] / 1.05;
          // // // const l4 = lnglatDatasTemp[i + 1] / 2;
          // // // const l5 = lnglatDatasTemp[i + 2] / 2;
          // // // const l6 = lnglatDatasTemp[i + 3] / 2;
          // // const newCartesian2 = new Cesium.Cartesian3(0, 0, 0);

          // // not work!!
          // // const hpRoll = new Cesium.HeadingPitchRoll(0, Cesium.Math.toRadians(-90), 0);
          // // const hpRoll = new Cesium.HeadingPitchRoll(0, 0, 0);
          // // const orientation = Cesium.Transforms.headingPitchRollQuaternion(newCartesian, hpRoll);

          // // now work!!
          // // const orientation = Cesium.Quaternion.fromAxisAngle(newCartesian, Cesium.Math.toRadians(-90));

          // // const hpr = this.getModelMatrix(newCartesian, newCartesian2);
          // // const { hpr, quaternion } = this.getHeadingPitchRoll(m);
          // // hpr.heading = hpr.heading + 3.14 / 2 + 3.14;
          // // hpr.roll = hpr.roll + Cesium.Math.toRadians(-90);
          // // console.log("hpr", hpr);
          // // const orientation = Cesium.Transforms.headingPitchRollQuaternion(newCartesian, hpr);
          // // lnglatDatasNew2.push(lnglatDatasTemp[i], quaternion.x, quaternion.y, quaternion.z, quaternion.w);
          // // lnglatDatasNew2.push(lnglatDatasTemp[i], orientation.x, orientation.y, orientation.z, orientation.w);

          // // const quaternion2 = Cesium.Quaternion.fromRotationMatrix(m);
          // // lnglatDatasNew2.push(lnglatDatasTemp[i], quaternion2.x, quaternion2.y, quaternion2.z, quaternion2.w);

          // // const modelMatrix4 = this.getModelMatrix(newCartesian, newCartesian2);
          // // const hpr2 = modelMatrix4.hpr;
          // // hpr2.roll = hpr2.roll + Cesium.Math.toRadians(-90);
          // // const quaternion2 = Cesium.Quaternion.fromHeadingPitchRoll(hpr2);
          // const quaternion2 = Cesium.Transforms.headingPitchRollQuaternion(newCartesian, pitch90);

          // // 将本地坐标系转换为固定地心坐标系
          // // const fixedFrameTransform = Cesium.Transforms.eastNorthUpToFixedFrame(newCartesian);
          // // const arrowMatrix3 = Cesium.Matrix3.fromQuaternion(quaternion2);
          // // const rotatedMatrix = Cesium.Matrix3.multiply(fixedFrameTransform, arrowMatrix3, new Cesium.Matrix3());

          // // 将旋转矩阵应用到箭头的朝向
          // // const finalOrientation = Cesium.Quaternion.fromRotationMatrix(rotatedMatrix);

          // lnglatDatasNew2.push(lnglatDatasTemp[i], quaternion2.x, quaternion2.y, quaternion2.z, quaternion2.w);
        }

        // const rotateX = 0;
        // const rotateY = -90;
        // const rotateZ = 0;

        // for (let i = 0; i <= lnglatDatasTemp.length - 4; i = i + 4) {
        //   const l1 = lnglatDatasTemp[i + 1] / 1.05;
        //   const l2 = lnglatDatasTemp[i + 2] / 1.05;
        //   const l3 = lnglatDatasTemp[i + 3] / 1.05;
        //   lnglatDatasNew.push(lnglatDatasTemp[i], l1, l2, l3);

        //   const velocityVector = new Cesium.VelocityVectorProperty(Cesium.position, true);
        //   const curVelocityVector = velocityVector.getValue(lnglatDatasTemp[i], new Cesium.Cartesian3());
        //   console.log("curVelocityVector", velocityVector, curVelocityVector);
        //   const newCartesian = new Cesium.Cartesian3(l1, l2, l3);

        //   const quaternion2 = this.getQuaternion(newCartesian, curVelocityVector, rotateX, rotateY, rotateZ);
        //   lnglatDatasNew2.push(lnglatDatasTemp[i], quaternion2.x, quaternion2.y, quaternion2.z, quaternion2.w);
        // }

        // const newCartesian = new Cesium.Cartesian3.fromDegrees(0.001, 90, 400000.0);
        // const newCartesian2 = new Cesium.Cartesian3(0, 0, 0);
        // const modelMatrix4 = this.getModelMatrix(newCartesian, newCartesian2);
        // const { hpr, quaternion } = this.getHeadingPitchRoll(modelMatrix4.modelMatrix4);
        // console.log("hpr", hpr, quaternion);
        // const hpr2 = modelMatrix4.hpr;

        // const quaternion2 = Cesium.Quaternion.fromHeadingPitchRoll(hpr2);

        // const quaternion2 = Cesium.Quaternion.subtract(modelMatrix4.orientation, quaternion, new Cesium.Quaternion());
        // const quaternionnew = [quaternion2.x, quaternion2.y, quaternion2.z, quaternion2.w];
        // console.log("quaternionnew", quaternionnew, quaternion2);

        const statelliteCZMLId = statelliteCZML!.czml[0].id + "#position";

        const scanShapeCzml = {
          id: `${options.id}${this.__scanSuffix}`,
          name: this.__scanName,

          // position: {
          //   reference: statelliteCZMLId,
          // },

          position: {
            interpolationAlgorithm: "LINEAR", // 插值算法为LAGRANGE，还有HERMITE,GEODESIC LINEAR
            interpolationDegree: 1, // 度数 //1为线性插值，2为平方插值
            referenceFrame: "INERTIAL", // 用于标识众所周知的参考帧的常数。 值 固定的FIXED  惯性的INERTIAL
            epoch: statelliteCZML.startISOstring, // 朱利安时间=UTC=GMT），北京时间=UTC+8=GMT+8
            cartesian: lnglatDatasNew,
          },

          // position: {
          //   cartographicDegrees: [0, 90, 400000.0],
          // },

          // orientation: {
          //   // unitQuaternion: [testQuat.x, testQuat.y, testQuat.z, testQuat.w],
          //   // velocityReference: statelliteCZMLId,
          //   velocityReference: "#position",
          //   // unitQuaternion: [Cesium.JulianDate.toIso8601(Cesium.JulianDate.now()), 0.0, 1.0, 0.0, 1.0],
          //   // reference: "#position", // not work!!
          // },

          // orientation: {
          //   unitQuaternion: quaternionnew,
          // },

          // orientation: {
          //   interpolationAlgorithm: "LINEAR",
          //   interpolationDegree: 1,
          //   referenceFrame: "INERTIAL",
          //   epoch: statelliteCZML.startISOstring,
          //   unitQuaternion: lnglatDatasNew2,
          //   velocityReference: "#position",
          // },

          // rotation: {
          //   // unitQuaternion: [testQuat.x, testQuat.y, testQuat.z, testQuat.w],
          //   unitQuaternion: [testQuat.x, testQuat.y, testQuat.z, testQuat.w],
          //   // reference: "#position",
          // },

          ellipsoid: {
            radii: {
              cartesian: [1000000.0, 1000000.0, 1000000.0],
            },
            innerRadii: {
              cartesian: [100000.0, 100000.0, 50000.0],
            },
            minimumClock: Cesium.Math.toRadians(-15), // -15
            maximumClock: Cesium.Math.toRadians(15), // 15
            minimumCone: Cesium.Math.toRadians(75), // 75
            maximumCone: Cesium.Math.toRadians(105), // 105
            material: {
              solidColor: {
                color: {
                  rgba: [255, 255, 0, 255],
                },
              },
            },
            outline: true,
            outlineWidth: 3,
            outlineColor: {
              rgba: [255, 0, 0, 255],
            },
            // show: true,
            show: [
              {
                interval: scanStartISOstring + "/" + scanEndISOstring,
                boolean: true,
              },
            ],
          },
          properties: options,

          // polygon: {
          //   positions: {
          //     cartographicDegrees: [-118.0, 30.0, 0, -115.0, 30.0, 0, -117.1, 31.1, 0, -118.0, 33.0, 0],
          //   },
          //   material: {
          //     solidColor: {
          //       color: {
          //         rgba: [255, 100, 0, 100],
          //       },
          //     },
          //   },
          //   extrudedHeight: 700000.0,
          //   // perPositionHeight: true,
          //   outline: true,
          //   outlineColor: {
          //     rgba: [0, 0, 0, 255],
          //   },
          //   outlineWidth: 4,
          // },
        };

        statelliteCZML!.czml = statelliteCZML!.czml!.concat(scanShapeCzml);
      }
    }

    let documentCZML = this.getOrCreateCZMLById(
      id,
      prefixname,
      statelliteCZML!.startISOstring,
      statelliteCZML!.endISOstring,
      1,
    );
    documentCZML = documentCZML.concat(statelliteCZML!.czml);

    this.__CZMLs.set(id, documentCZML);

    const layerObj: any = {
      options,
      orbitIns: statelliteCZML!.orbitIns,
      orbitCZML: documentCZML,
    };

    // console.log("layerObj", layerObj);
    return layerObj;
  }

  // 测试结果不正确.
  // 不要使用，放在这里供参考
  public resetOrientation(dataSource: any) {
    const scanEntity = dataSource.entities.values[3];
    const orientationOld = scanEntity.orientation;
    const timeOld = scanEntity.position._property._times;
    const oq = new Cesium.SampledProperty(Cesium.Quaternion);
    for (let i = 0; i < timeOld.length; i++) {
      const quaternion = orientationOld.getValue(timeOld[i]);
      const hpr = Cesium.HeadingPitchRoll.fromQuaternion(quaternion);
      hpr.pitch = hpr.pitch + Cesium.Math.toRadians(-90);
      const quaternion2 = Cesium.Quaternion.fromHeadingPitchRoll(hpr);
      oq.addSample(timeOld[i], quaternion2);
    }
    scanEntity.orientation = oq;
  }

  /**
   * 计算朝向四元数
   * X轴正向指向运动方向；Y轴在水平面内垂直于X轴，正向指向右侧；Z轴通过右手法则确定
   * @param {Cartesian3} positionEcf 位置
   * @param {Cartesian3} velocityEcf 速度向量
   * @param {*} rotateX 绕X轴旋转的角度（roll）
   * @param {*} rotateY 绕Y轴旋转的角度（pitch）
   * @param {*} rotateZ 绕Z轴旋转的角度（heading）
   * @returns
   */
  public getQuaternion(positionEcf: any, velocityEcf: any, rotateX: any = 0, rotateY: any = 0, rotateZ: any = 0) {
    // 1、计算站心到模型坐标系的旋转平移矩阵
    // 速度归一化
    const normal = Cesium.Cartesian3.normalize(velocityEcf, new Cesium.Cartesian3());
    // 计算模型坐标系的旋转矩阵
    // 简单说就是根据给定的位置和向量建立一个旋转矩阵，这个旋转矩阵以给定位置Position为坐标系原点，给定向量Velocity为坐标轴X。
    // 这个旋转矩阵的含义是从地固坐标系转到模型坐标系
    const satRotationMatrix = Cesium.Transforms.rotationMatrixFromPositionVelocity(
      positionEcf,
      normal,
      Cesium.Ellipsoid.WGS84,
    );
    // 模型坐标系到地固坐标系旋转平移矩阵
    const m = Cesium.Matrix4.fromRotationTranslation(satRotationMatrix, positionEcf);
    // 站心坐标系（东北天坐标系）到地固坐标系旋转平移矩阵
    const m1 = Cesium.Transforms.eastNorthUpToFixedFrame(positionEcf, Cesium.Ellipsoid.WGS84, new Cesium.Matrix4());
    // 站心到模型坐标系的旋转平移矩阵
    const m3 = Cesium.Matrix4.multiply(Cesium.Matrix4.inverse(m1, new Cesium.Matrix4()), m, new Cesium.Matrix4());

    // 2、模型姿态旋转矩阵
    rotateX = rotateX || 0;
    rotateY = rotateY || 0;
    rotateZ = rotateZ || 0;
    const heading = rotateZ,
      pitch = rotateY,
      roll = rotateX;
    const postureHpr = new Cesium.HeadingPitchRoll(
      Cesium.Math.toRadians(heading),
      Cesium.Math.toRadians(pitch),
      Cesium.Math.toRadians(roll),
    );
    const postureMatrix = Cesium.Matrix3.fromHeadingPitchRoll(postureHpr);

    // 3、最终的旋转矩阵
    const mat3 = Cesium.Matrix4.getMatrix3(m3, new Cesium.Matrix3());
    const finalMatrix = Cesium.Matrix3.multiply(mat3, postureMatrix, new Cesium.Matrix3());
    const quaternion1 = Cesium.Quaternion.fromRotationMatrix(finalMatrix);
    const hpr = Cesium.HeadingPitchRoll.fromQuaternion(quaternion1);
    const q2 = Cesium.Transforms.headingPitchRollQuaternion(positionEcf, hpr);
    return q2;
  }

  public howToUseGetQuaternion(entity: any) {
    // 当前时刻速度向量、位置
    const curVelocityVector = entity.velocityVector.getValue(this.viewer.clock.currentTime, new Cesium.Cartesian3());
    const curPosition = entity.position.getValue(this.viewer.clock.currentTime, new Cesium.Cartesian3());
    // 计算朝向四元数
    const quaternion = this.getQuaternion(curPosition, curVelocityVector);
    // 设置实体朝向，验证是否指向速度矢量方向
    entity.orientation = quaternion;
  }

  public resetOrientation2(dataSource: any) {
    const scanEntity = dataSource.entities.values[3];
    //  heading = rotateZ, pitch = rotateY, roll = rotateX;
    const rotateX = 0;
    const rotateY = -90;
    const rotateZ = 0;
    const property = new Cesium.SampledProperty(Cesium.Quaternion);

    if (scanEntity.position instanceof Cesium.SampledPositionProperty) {
      scanEntity.velocityVector = new Cesium.VelocityVectorProperty(scanEntity.position, true);

      let times: any = [];
      if (scanEntity.position && scanEntity.position._property && scanEntity.position._property._times) {
        times = scanEntity.position._property._times;
      }
      if (times.length) {
        times.forEach((time: any, index: any) => {
          const curVelocityVector = scanEntity.velocityVector.getValue(time, new Cesium.Cartesian3());
          const curPosition = scanEntity.position.getValue(time, new Cesium.Cartesian3());
          // 计算朝向四元数
          const quaternion = this.getQuaternion(curPosition, curVelocityVector, rotateX, rotateY, rotateZ);
          // 添加采样值
          property.addSample(time, quaternion);
        });
      }
    } else if (scanEntity.position instanceof Cesium.CompositePositionProperty) {
      // 此分支没有调试过
      const intervals = scanEntity.position.intervals;
      for (let i = 0; i < intervals.length; i++) {
        const interval = intervals.get(i);
        // const positions = interval.data._property._values;
        interval.data._property._times.forEach((time: any, index: any) => {
          const curVelocityVector = scanEntity.velocityVector.getValue(time, new Cesium.Cartesian3());
          const curPosition = scanEntity.position.getValue(time, new Cesium.Cartesian3());
          // 计算朝向四元数
          const quaternion = this.getQuaternion(curPosition, curVelocityVector, rotateX, rotateY, rotateZ);
          // 添加采样值
          property.addSample(time, quaternion);
        });
      }
    }

    scanEntity.orientation = property;
  }

  public addLayer(options: SatelliteOrbitOptions) {
    if (this.csBaseHandle) {
      const layerObj = this.createLayer(options);
      if (layerObj) {
        // 记录原始信息
        const promise = Cesium.CzmlDataSource.load(layerObj.orbitCZML);
        promise.then((dataSource: any) => {
          this.dataSources && this.dataSources.add(dataSource);
          layerObj.dataSource = dataSource;
          if (options.scan) {
            if (options.scan.shape === "wedge") {
              this.resetOrientation2(dataSource);
            }
          }

          // 10s后时间轴跳转至指定时间并自动运行
          setTimeout(() => {
            // 启动地求自转！
            // this.csBaseHandle?.startEarthRotation();
            // 获取当前时间
            let start = Cesium.JulianDate.fromDate(new Date());
            // console.log("setTimeout", new Date(), start);
            // 添加8小时，使地图时间和北京时间相同--cesium原始
            // start = Cesium.JulianDate.addHours(start, 8, new Cesium.JulianDate());
            // 不用添加8小时，使地图时间和北京时间相同--cesium修改后使用的是北京时间
            start = Cesium.JulianDate.addHours(start, 0, new Cesium.JulianDate());
            // 设置时钟当前时间
            if (start) {
              this.csBaseHandle!.viewer.clock.currentTime = start.clone();
            }
            this.csBaseHandle!.viewer.clock.canAnimate = true; //时间轴运行
            this.csBaseHandle!.viewer.clock.shouldAnimate = true; //时间轴运行
            // 时间速率，数字越大时间过的越快
            this.csBaseHandle!.viewer.clock.multiplier = options.multiplier ?? 1;

            // 加入触显示时间
            this.addTrigerPopupLayer(options);
          }, 3000);
        });
        this.__layers.set(this.__Id(options.id), layerObj);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  // not use!!
  public fitToView(options: SatelliteOrbitOptions) {
    if (this.csBaseHandle) {
      if (options.extent) {
        this.csBaseHandle.fitToExtent(options.extent);
        return true;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  public hasLayer(options: SatelliteOrbitOptions) {
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

  public removeLayer(options: SatelliteOrbitOptions, destroy = true) {
    return this.removeLayerByID(options.id, destroy);
  }

  public removePolylineEntity(dataSource: any) {
    let hasPolyline = false;
    dataSource._primitives._primitives.forEach((primitive: any) => {
      console.log("primitives", primitive);
      if (primitive instanceof Cesium.PolylineCollection) {
        // primitive._polylines.forEach((polyline: any) => {
        //   primitive.remove(polyline);
        // });
        // dataSource._primitives.remove(primitive);
        // primitive.destroy();
        hasPolyline = true;
      } else {
        dataSource._primitives.remove(primitive);
      }
    });
    dataSource.entities.values.forEach((entity: any) => {
      if (entity.polyline) {
        // dataSource.entities.remove(entity, true);
        // entity.position = undefined;
        // entity.orientation = undefined;
        // entity.polyline = undefined;
        hasPolyline = true;
      } else {
        dataSource.entities.remove(entity, true);
      }
    });
    return hasPolyline;
  }

  public removeLayerByID(id: string, destroy = true) {
    if (this.csBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        this.viewer.clock.canAnimate = false; //时间轴运行
        this.viewer.clock.shouldAnimate = false; //时间轴运行
        // this.viewer.scene.requestRenderMode = true;
        this.viewer.cesiumWidget.useDefaultRenderLoop = false;
        setTimeout(() => {
          if (layerObj.options && layerObj.options.popup.isPopup) {
            const id = layerObj.options.id;
            if (layerObj.options.popup.popupType == popupType.vnode) {
              this.vuePopupIns!.hiddenPopupByID(id);
              this.vuePopupIns!.removeLayerByID(id);
              this.mapEventIns!.removeEventByID(id);
            }
          }

          const dataSource = layerObj.dataSource;
          if (dataSource) {
            if (this.dataSources.contains(dataSource)) {
              const hasPolyline = this.removePolylineEntity(dataSource);
              // console.log("dataSource", dataSource);
              if (!hasPolyline) {
                this.dataSources.remove(dataSource, destroy);
              }
            }
          }

          this.__layers.delete(this.__Id(id));

          this.viewer.cesiumWidget.useDefaultRenderLoop = true;
          // this.viewer.scene.requestRender();
          // this.viewer.scene.requestRenderMode = false;
          this.csBaseHandle!.viewer.clock.canAnimate = true; //时间轴运行
          this.csBaseHandle!.viewer.clock.shouldAnimate = true; //时间轴运行
        }, 100);
        return true;
      } else {
        return false;
      }
    }
  }

  public clearLayer(destroy = true) {
    if (this.csBaseHandle && this.__layers.size) {
      // for (let [key, layerObj] of this.__layers.entries()) {
      // 	this.handle.removeLayer(layerObj.layer)
      // }
      this.__layers.forEach((layerObj: any) => {
        if (layerObj.options && layerObj.options.popup.isPopup) {
          const id = layerObj.options.id;
          if (layerObj.options.popup.popupType == popupType.vnode) {
            this.vuePopupIns!.hiddenPopupByID(id);
            this.vuePopupIns!.removeLayerByID(id);
            this.mapEventIns!.removeEventByID(id);
          }
        }
        const dataSource = layerObj.dataSource;
        if (dataSource) {
          if (this.dataSources.contains(dataSource)) {
            this.dataSources.remove(dataSource, destroy);
          }
        }
      });
      this.__layers.clear();
      return true;
    } else {
      return false;
    }
  }

  // public setLayerOpacity(options: SatelliteOrbitOptions, opacity: number) {
  //   return this.setLayerOpacityByID(options.id, opacity);
  // }

  // public setLayerOpacityByID(id: string, opacity: number) {
  //   if (this.csBaseHandle) {
  //     const layerObj = this.__layers.get(this.__Id(id));
  //     if (layerObj) {
  //       layerObj.layer.alpha = opacity;
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   } else {
  //     return false;
  //   }
  // }

  public showHiddenLayer(options: SatelliteOrbitOptions, isShow: boolean) {
    return this.showHiddenLayerByID(options.id, isShow);
  }

  public showHiddenLayerByID(id: string, isShow: boolean) {
    if (this.csBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        const dataSource = layerObj.dataSource;
        if (dataSource) {
          dataSource.show = isShow;
        }
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
