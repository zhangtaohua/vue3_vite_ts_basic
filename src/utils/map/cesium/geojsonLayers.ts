// 用来加载icon 或者小图片。

import * as Cesium from "cesium";
import type { GeojsonTopoJSONOptions } from "./geojsonLayersTypes";
import CesiumBase from "./base";
import { nanoid } from "nanoid";

import { popupType, isCustomizeFlag, customMeta } from "../geoConstant";

import CsVueNodePopup from "./vueNodePopupLayers";
import type { VueNodeOptions } from "./vueNodePopupLayersTypes";

import CsScreenEvent from "./screenEvent";
import type { EventOptions } from "./screenEventTypes";

import { getCsColor, getCsCartesian2, getCsCartesian3 } from "./csTools";

import { cesiumViewMode } from "./csConstant";
import { makePointStyle, makeLabelStyle } from "./style";

export default class CsGeojsonLayers {
  public csBaseHandle: CesiumBase | null = null;
  public viewer: any = null;
  public entities: any = null;
  public dataSources: any = null;

  private __layers: any = null;
  private __layerIdPrefix = "Geojson_ENTITY_";

  public vuePopupIns: CsVueNodePopup | null = null;
  public mapEventIns: CsScreenEvent | null = null;
  constructor(mapBaseIns: CesiumBase) {
    this.csBaseHandle = mapBaseIns;
    this.viewer = mapBaseIns.viewer;
    this.entities = mapBaseIns.viewer.entities;
    this.dataSources = mapBaseIns.viewer.dataSources;
    this.__layers = new Map();

    this.vuePopupIns = new CsVueNodePopup(mapBaseIns);
    this.mapEventIns = new CsScreenEvent(mapBaseIns);
  }

  public destructor() {
    this.vuePopupIns?.destructor();
    this.mapEventIns?.destructor();

    this.clearLayer();
    this.csBaseHandle = null;
    this.viewer = null;
    this.entities = null;
    this.dataSources = null;
    this.__layers = null;
  }

  private __Id(id: string) {
    return `${this.__layerIdPrefix}${id}`;
  }

  private __Name(name: string) {
    return `${this.__layerIdPrefix}${name}`;
  }

  public vNodePopupCb = (options: GeojsonTopoJSONOptions) => {
    return (event: any) => {
      const pickPositon = event.position || event.endPosition; //  || event.startPosition
      const pick = this.viewer!.scene.pick(pickPositon);
      if (Cesium.defined(pick)) {
        const entity = pick.id;
        const entityId = entity.properties.id;
        let customMetaNew = null;
        if (entity.properties.customMeta) {
          customMetaNew = entity.properties.customMeta.getValue();
        }

        // console.log("entityId", entityId, entity, customMetaNew, customMetaNew[customMeta].id, options.id);
        if (customMetaNew && customMetaNew[customMeta].id == options.id) {
          // 如果用户传入了回调，那么 调用 ，可能会更新popup
          if (options.event?.callback) {
            options.event?.callback(event, entity, options);
          }
          const positions = entity.position;
          let lngLatHeight: any = {
            longitude: 0,
            latitude: 0,
            height: 0,
            zoom: 0,
          };

          if (positions) {
            lngLatHeight = this.csBaseHandle?.cartesian3ToWgs84(positions["_value"]);
          }
          const popupOpt = {
            ...options.popup,
            position: [lngLatHeight.longitude, lngLatHeight.latitude, 0],
            id: options.id,
            name: options.name,
          };
          this.vuePopupIns?.updateLayer(popupOpt as VueNodeOptions);
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
    };
  };

  public createLayer(
    options: GeojsonTopoJSONOptions = {
      id: "",
      name: "",
      geojson: { data: "" },
    },
  ) {
    if (!options.geojson || !options.id) {
      return null;
    }

    const id = this.__Id(options.id);
    let name = options.name ? options.name : nanoid(10);
    name = this.__Name(name);

    const geojsonOpt = options.geojson;
    const markerColor = getCsColor(geojsonOpt.markerColor, Cesium.GeoJsonDataSource.markerColor);
    const stroke = getCsColor(geojsonOpt.stroke, Cesium.GeoJsonDataSource.stroke);
    const fill = getCsColor(geojsonOpt.fill, Cesium.GeoJsonDataSource.fill);

    // console.log("fill", options.id, fill, Cesium.GeoJsonDataSource.fill);

    const geojsonConfig: any = {
      sourceUri: geojsonOpt.sourceUri || "",
      describe: geojsonOpt.describe || Cesium.GeoJsonDataSource.defaultDescribeProperty,
      markerSize: geojsonOpt.markerSize || Cesium.GeoJsonDataSource.markerSize,
      markerSymbol: geojsonOpt.markerSymbol || Cesium.GeoJsonDataSource.markerSymbol,
      markerColor: markerColor,
      stroke: stroke,
      strokeWidth: geojsonOpt.strokeWidth || Cesium.GeoJsonDataSource.strokeWidth,
      fill: fill,
      clampToGround: geojsonOpt.clampToGround || Cesium.GeoJsonDataSource.clampToGround,
      credit: geojsonOpt.credit || "",
    };

    const geojsonPromsie = Cesium.GeoJsonDataSource.load(geojsonOpt.data, geojsonConfig);
    const layerObj = {
      options,
      geojsonPromsie,
      dataSource: null,
    };
    return layerObj;
  }

  public addTrigerPopupLayer = (options: GeojsonTopoJSONOptions) => {
    if (options.popup) {
      const popupOpt = {
        ...options.popup,
        // position: options.position,
        id: options.id,
        name: options.name,
      };
      if (popupOpt.popupType == popupType.vnode) {
        // 因为每次位置都更新了没有必要
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
        }
        // else {
        //   // 没有事件触发直接显示
        //   this.vuePopupIns?.showPopupByID(options.id);
        // }
      }
    }
  };

  public setGeojsonStyle = (dataSource: any, options: GeojsonTopoJSONOptions) => {
    if (options.styleFunction) {
      options.styleFunction(dataSource, options);
      const entities = dataSource.entities.values;
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        const meta = {
          [isCustomizeFlag]: true,
          [customMeta]: {
            id: options.id,
          },
        };
        entity.properties.addProperty(customMeta, meta);
      }
    } else {
      const entities = dataSource.entities.values;
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        const meta = {
          [isCustomizeFlag]: true,
          [customMeta]: {
            id: options.id,
          },
        };
        entity.properties.addProperty(customMeta, meta);

        const name = entity.name || options.name;
        let propStyle = entity.properties.style;
        const optStyle = options.style;

        let positions: any = null;
        if (propStyle || optStyle) {
          if (propStyle) {
            propStyle = propStyle.getValue();
          } else {
            propStyle = {};
          }
          const radius = propStyle.radius || optStyle.radius || 16;
          let color = propStyle.fillColor || optStyle.fillColor;
          color = getCsColor(color, Cesium.GeoJsonDataSource.fill);

          let outlineColor = propStyle.color || optStyle.color;
          outlineColor = getCsColor(outlineColor, Cesium.GeoJsonDataSource.stroke);

          const outlineWidth =
            Number(propStyle.width) || Number(optStyle.width) || Cesium.GeoJsonDataSource.strokeWidth;

          // console.log("propStyle", entity, radius, color, outlineColor, outlineWidth);
          if (entity.billboard) {
            // 点
            if (options.geojson && options.geojson.isPointUseMarker) {
              entity.billboard.color = color;
            } else {
              // 如果不用 billboard 显示点的话。
              entity.billboard = undefined;
              entity.point = makePointStyle(radius, color, outlineColor, outlineWidth);
            }
          } else if (entity.polygon) {
            // 多边形
            entity.polygon.material = color;
            entity.polygon.outlineColor = outlineColor;
            entity.polygon.outlineWidth = outlineWidth;

            // 计算中心点
            positions = entity.polygon.hierarchy["_value"].positions;
          } else if (entity.polyline) {
            // 线段
            entity.polyline.material = color;
            entity.polyline.width = outlineWidth;

            // 计算中心点
            positions = entity.polyline.positions.getValue();
          }
        } else {
          if (entity.polygon) {
            // 计算中心点
            positions = entity.polygon.hierarchy["_value"].positions;
          } else if (entity.polyline) {
            // 计算中心点
            positions = entity.polyline.positions.getValue();
          }
        }

        if (positions) {
          const center = Cesium.BoundingSphere.fromPoints(positions).center;
          Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(center, center);
          entity.position = new Cesium.ConstantPositionProperty(center);
        }
        if (options.label) {
          entity.label = makeLabelStyle(options.label, name);
        }
      }
    }
  };

  public async addLayer(options: GeojsonTopoJSONOptions) {
    if (this.csBaseHandle) {
      const layerObj = await this.createLayer(options);
      // console.log("layerObj", layerObj);
      if (layerObj) {
        layerObj.geojsonPromsie
          .then((dataSource: any) => {
            this.dataSources.add(dataSource);
            this.setGeojsonStyle(dataSource, options);
            layerObj.dataSource = dataSource;

            this.__layers.set(this.__Id(options.id), layerObj);

            this.addTrigerPopupLayer(options);
          })
          .catch(() => {
            console.log("Geojson add Failed!");
          });
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public flyToView(options: GeojsonTopoJSONOptions) {
    if (this.csBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(options.id));
      if (layerObj) {
        this.viewer.flyTo(layerObj.dataSource);
      }
    } else {
      return false;
    }
  }

  public hasLayer(options: GeojsonTopoJSONOptions) {
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

  public removeLayer(options: GeojsonTopoJSONOptions) {
    return this.removeLayerByID(options.id);
  }

  public removeLayerByID(id: string, destroy = true) {
    if (this.csBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        // this.entities.removeById(this.__Id(id));
        this.dataSources.remove(layerObj.dataSource, destroy);

        if (layerObj.options && layerObj.options.popup && layerObj.options.popup.isPopup) {
          const id = layerObj.options.id;
          if (layerObj.options.popup.popupType == popupType.vnode) {
            this.vuePopupIns!.hiddenPopupByID(id);
            this.vuePopupIns!.removeLayerByID(id);
            this.mapEventIns!.removeEventByID(id);
          }
        }

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
      this.__layers.forEach((layerObj: any) => {
        this.entities.remove(layerObj.entity);

        if (layerObj.options && layerObj.options.popup && layerObj.options.popup.isPopup) {
          const id = layerObj.options.id;
          if (layerObj.options.popup.popupType == popupType.vnode) {
            this.vuePopupIns!.hiddenPopupByID(id);
            this.vuePopupIns!.removeLayerByID(id);
            this.mapEventIns!.removeEventByID(id);
          }
        }
      });
      this.__layers.clear();
      return true;
    } else {
      return false;
    }
  }

  public setLayerOpacity(options: GeojsonTopoJSONOptions, opacity: number) {
    return this.setLayerOpacityByID(options.id, opacity);
  }

  public setLayerOpacityByID(id: string, opacity: number) {
    if (this.csBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        const dataSource = layerObj.dataSource;
        const entities = dataSource.entities.values;
        for (let i = 0; i < entities.length; i++) {
          const entity = entities[i];
          if (entity.polygon) {
            const fillColor = entity.polygon!.material.getValue().color;
            const outlineColor = entity.polygon!.outlineColor.getValue();
            entity.polygon!.material = fillColor.withAlpha(opacity);
            entity.polygon!.outlineColor = outlineColor.withAlpha(opacity);
          }

          // handle Point
          if (entity.point) {
            entity.point!.color = entity.point!.color.getValue().withAlpha(opacity);
            entity.point!.outlineColor = entity.point!.outlineColor.getValue().withAlpha(opacity);
          }

          if (entity.billboard) {
            entity.billboard!.color = entity.billboard!.color.getValue().withAlpha(opacity);
          }

          if (entity.polyline) {
            const fillColor = entity.polygon!.material.getValue().color;
            entity.polyline!.material = fillColor.withAlpha(opacity);
          }

          if (entity.label) {
            entity.label!.fillColor = entity.label!.fillColor.getValue().withAlpha(opacity);
            entity.label!.backgroundColor = entity.label!.backgroundColor.getValue().withAlpha(opacity);
          }
        }
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public showHiddenLayer(options: GeojsonTopoJSONOptions, isShow: boolean) {
    return this.showHiddenLayerByID(options.id, isShow);
  }

  public showHiddenLayerByID(id: string, isShow: boolean) {
    if (this.csBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        layerObj.dataSource.show = isShow;
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
