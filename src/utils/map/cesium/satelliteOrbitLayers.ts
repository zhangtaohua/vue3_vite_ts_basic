import * as Cesium from "cesium";

import { nanoid } from "nanoid";

import CesiumBase from "./base";

import type { SatelliteOrbitOptions } from "./satelliteOrbitLayersTypes";

import { isCustomizeFlag, customMeta } from "../geoConstant";

import SatelliteOrbit from "../satellite/orbit";

import {
  getGeoPointFromLongitudeLatitude,
  getTwoDimArrayFromLngLatObj,
  getGeoLineFromArray,
  calibratePosions,
} from "../geoCommon";

export default class CsSatelliteOrbitLayers {
  public csBaseHandle: CesiumBase | null = null;
  public imageryLayers: any = null;
  public dataSources: any = null;

  private __layers: any = null;
  private __CZMLs: any = null;

  private __layerIdPrefix = "SATELLITE_ORBIT_";
  private __documentSuffix = "_document";
  private __orbitSuffix = "_orbit";
  private __receiverSuffix = "_receiver";
  private __satToResSuffix = "_sat_to_receiver";
  private __orbitName = "satellite_orbit";
  private __receiverName = "receiver";
  private __SatToReceiverName = "satellite_to_receiver";

  constructor(mapBaseIns: CesiumBase) {
    this.csBaseHandle = mapBaseIns;
    this.imageryLayers = mapBaseIns.imageryLayers;
    this.dataSources = mapBaseIns.viewer.dataSources;

    this.__layers = new Map();
    this.__CZMLs = new Map();
  }

  public destructor() {
    this.clearLayer();
    this.csBaseHandle = null;
    this.imageryLayers = null;

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
    console.log("startTime", timeAll);

    // const lnglatDatas = orbitIns.getOrbitDatasWithTime(startISOstring, endISOstring, timeInterval);
    const lnglatDatas = orbitIns.getOrbitDatasEciWithTime(startISOstring, endISOstring, timeInterval);

    const labelHorizontalOrigin = "LEFT";
    const labelPixelOffset = { cartesian2: [20, 0.0] };

    const timeIOSStrings = timeAll.isoString;
    const leadTime = [];
    const trailTime = [];
    // 设置后卫星轨道一圈一圈的显示
    for (let i = 0; i < timeIOSStrings.length - 1; i++) {
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
      },
    ];

    return {
      orbitIns: orbitIns,
      czml: orbitCZML,
      startISOstring: startISOstring,
      endISOstring: endISOstring,
      timeAll: timeAll,
    };
  }

  // 用来创建接收站的
  public createCZMLReceiver(options: any) {
    const position = Cesium.Cartesian3.fromDegrees(options.position[0], options.position[1], options.position[2]);
    const hpRoll = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(90), 0, 0);
    const orientation: any = Cesium.Transforms.headingPitchRollQuaternion(position, hpRoll);

    const scale = options.model.scale ? options.model.scale : 1;
    const minimumPixelSize = options.model.minimumPixelSize ? options.model.minimumPixelSize : 64;
    const maximumScale = options.model.maximumScale ? options.model.maximumScale : 20000;

    const czml = [
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
        model: {
          gltf: options.model.url,
          scale: scale,
          minimumPixelSize: minimumPixelSize,
          maximumScale: maximumScale,
          runAnimations: false,
          // articulations: {},
          show: true,
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
      },
    ];
    return czml;
  }

  // 用来获取空间距离，可是好像不太对
  getSpaceDistancedistance(point1: any, point2: any) {
    const point1cartographic = Cesium.Cartographic.fromCartesian(point1);
    const point2cartographic = Cesium.Cartographic.fromCartesian(point2);
    /**根据经纬度计算出距离**/
    const geodesic = new Cesium.EllipsoidGeodesic();
    geodesic.setEndPoints(point1cartographic, point2cartographic);
    let s = geodesic.surfaceDistance;
    //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)))
    //返回两点之间的距离
    s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
    return s;
  }

  // 用来模拟卫星到接收站之间的连线
  public createReceiveAnimation(statelliteCZML: any, receiverPosition: any, startStamp: number, receiveId: string) {
    const satellitePositions = statelliteCZML[0].position.cartesian;

    const receiverCartesian = Cesium.Cartesian3.fromDegrees(
      receiverPosition[0],
      receiverPosition[1],
      receiverPosition[2],
    );
    const showArray = [];
    let showLeadtime = 0;
    let showTailtime = 0;
    let notShowLeadtime = 0;
    let notShowTailtime = 0;

    for (let i = 0; i < satellitePositions.length - 3; i = i + 4) {
      const timeTemp = satellitePositions[i];
      const sateTempCartesian = new Cesium.Cartesian3(
        satellitePositions[i + 1],
        satellitePositions[i + 2],
        satellitePositions[i + 3],
      );
      const distance = Cesium.Cartesian3.distance(sateTempCartesian, receiverCartesian);
      // const distance = this.getSpaceDistancedistance(sateTempCartesian, receiverCartesian);
      if (distance < 1000000) {
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

    const startTimeStr = this.getISOString(startStamp);
    const endTimeeStr = this.getISOString(startStamp + satellitePositions[satellitePositions.length - 4] * 1000);
    const polyCzml = [
      {
        id: `${statelliteCZML[0].id}_${receiveId}${this.__satToResSuffix}`,
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
      },
    ];

    return polyCzml;
  }

  public createLayer(options: SatelliteOrbitOptions) {
    const id = this.__Id(options.id);
    const name = options.name ? options.name : nanoid(10);
    const prefixname = this.__Name(name);

    const statelliteCZML = this.createCZMLSatellite(options);
    if (options.receiver) {
      const receiverCZML = this.createCZMLReceiver(options.receiver);

      const polyCzml = this.createReceiveAnimation(
        statelliteCZML!.czml,
        options.receiver.position,
        statelliteCZML?.timeAll.timestamp[0],
        receiverCZML[0].id,
      );

      statelliteCZML!.czml = statelliteCZML!.czml!.concat(receiverCZML);
      statelliteCZML!.czml = statelliteCZML!.czml!.concat(polyCzml);
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

    const layerObj = {
      options,
      orbitIns: statelliteCZML!.orbitIns,
      orbitCZML: documentCZML,
    };

    console.log("layerObj", layerObj);
    return layerObj;
  }

  public addLayer(options: SatelliteOrbitOptions) {
    if (this.csBaseHandle) {
      const layerObj = this.createLayer(options);
      if (layerObj) {
        // 记录原始信息
        const promise = Cesium.CzmlDataSource.load(layerObj.orbitCZML);
        promise.then((dataSource: any) => {
          this.dataSources && this.dataSources.add(dataSource);

          // 10s后时间轴跳转至指定时间并自动运行
          setTimeout(() => {
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
            this.csBaseHandle!.viewer.clock.multiplier = 100;
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

  // public tick(options: SatelliteOrbitOptions) {
  //   const id = options.id;
  //   const layerObj = this.__layers.get(this.__Id(id));
  //   if (layerObj) {
  //     //  更新卫星位置和 旧轨道数据。
  //     if (layerObj.options.isShowSat) {
  //       const now = new Date().toString();
  //       const currentData = layerObj.orbitIns.getCurrenPositionGeojson(now);

  //       layerObj.positions.push(currentData.position);
  //       const positionNew = calibratePosions(layerObj.positions);
  //       const twoDimArray = getTwoDimArrayFromLngLatObj(positionNew);
  //       const geojsonData = getGeoLineFromArray(twoDimArray);
  //       layerObj.oribtOldOptions.data = geojsonData;
  //       this.GeojsonMapIns?.updateFeaturesData(layerObj.oribtOldOptions);
  //       //
  //       layerObj.satOptions.data = currentData.geojson;
  //       this.GeojsonMapIns?.updateFeaturesData(layerObj.satOptions);
  //     }
  //   }
  // }

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

  public removeLayer(options: SatelliteOrbitOptions) {
    return this.removeLayerByID(options.id);
  }

  public removeLayerByID(id: string) {
    if (this.csBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
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
    if (this.csBaseHandle && this.__layers.size) {
      // for (let [key, layerObj] of this.__layers.entries()) {
      // 	this.handle.removeLayer(layerObj.layer)
      // }
      this.__layers.forEach((layerObj: any) => {});
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

  public showHiddenLayer(options: SatelliteOrbitOptions, isShow: boolean) {
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
