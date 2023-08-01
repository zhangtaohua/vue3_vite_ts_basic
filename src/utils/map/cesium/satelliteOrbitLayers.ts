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
  private __layerIdPrefix = "SATELLITE_ORBIT_";
  private __documentSuffix = "_document";
  private __orbitSuffix = "_orbit";
  private __orbitName = "satelliteOrbit";

  constructor(mapBaseIns: CesiumBase) {
    this.csBaseHandle = mapBaseIns;
    this.imageryLayers = mapBaseIns.imageryLayers;
    this.dataSources = mapBaseIns.viewer.dataSources;

    this.__layers = new Map();
  }

  public destructor() {
    this.clearLayer();
    this.csBaseHandle = null;
    this.imageryLayers = null;

    this.__layers.clear();
    this.__layers = null;
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
    const id = this.__Id(options.id);
    let name = options.name ? options.name : nanoid(10);
    name = this.__Name(name);

    const timeInterval = options.timeInterval ? options.timeInterval : 1000;

    const orbitIns = new SatelliteOrbit(options.tle1, options.tle2);
    const startISOstring = new Date(options.startTime).toISOString();

    let startTime = new Date(options.startTime).getTime();
    startTime = startTime + orbitIns.secondsPerInterval * 1000;
    const endISOstring = new Date(startTime).toISOString();

    console.log("startTime", startISOstring, endISOstring);

    // const lnglatDatas = orbitIns.getOrbitDatasWithTime(startISOstring, endISOstring, timeInterval);
    const lnglatDatas = orbitIns.getOrbitDatasEciWithTime(startISOstring, endISOstring, timeInterval);

    const labelHorizontalOrigin = "LEFT";
    const labelPixelOffset = { cartesian2: [20, 0.0] };

    // const leadTime = [
    //   {
    //     number: [0, orbitIns.secondsPerInterval, orbitIns.secondsPerInterval, 0],
    //     epoch: startISOstring,
    //     interval: startISOstring + "/" + endISOstring,
    //   },
    // ]; // 设置后卫星轨道一圈一圈的显示
    // const trailTime = [
    //   {
    //     number: [0, 0, orbitIns.secondsPerInterval, orbitIns.secondsPerInterval],
    //     epoch: startISOstring,
    //     interval: startISOstring + "/" + endISOstring,
    //   },
    // ]; // 设置后，卫星运行完一圈清除原有轨道，只显示当前轨道（一圈）；

    // const leadTime = new Date(options.startTime).getTime() / 1000;
    // const trailTime = new Date(startTime).getTime() / 1000;

    const orbitCZML = [
      {
        id: "document",
        name: `${id}${this.__documentSuffix}`,
        version: "1.0",
        clock: {
          // interval为有效时间，currentTime表示起始点，multiplier表示时钟速度
          interval: startISOstring + "/" + endISOstring,
          currentTime: startISOstring, // 当前时间
          multiplier: 90, // 乘数
          range: "LOOP_STOP",
          step: "SYSTEM_CLOCK_MULTIPLIER",
        },
      },
      {
        id: `${id}${this.__orbitSuffix}`,
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
          // show: true,
          resolution: 120,
          // leadTime: leadTime,
          // trailTime: trailTime,
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
          // cartographicDegrees: lnglatDatas, // 点的位置由经度、纬度以及高程来表示
          cartesian: lnglatDatas,
          // cartographicRadians: lnglatDatas, // 点的位置由经度、纬度以及高程来表示
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

    const satOptions = null;
    const oribtOldOptions = null;

    const OldLnglatData: any = null;

    // 是否显示卫星
    if (options.isShowSat) {
    }
    const layerObj = {
      options,
      orbitIns,
      orbitCZML,
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
            let start = Cesium.JulianDate.fromDate(new Date(options.startTime));
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
            this.csBaseHandle!.viewer.clock.multiplier = 3;
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
        this.csBaseHandle.fitToLayerSourceByID(this.__Id(options.id));
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
