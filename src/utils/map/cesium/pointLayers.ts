// 用来加载icon 或者小图片。

import * as Cesium from "cesium";
import type { PointOptions } from "./pointLayersTypes";
import CesiumBase from "./base";
import { nanoid } from "nanoid";

import { popupType } from "../geoConstant";

import CsVueNodePopup from "./vueNodePopupLayers";
import type { VueNodeOptions } from "./vueNodePopupLayersTypes";

import CsScreenEvent from "./screenEvent";
import type { EventOptions } from "./screenEventTypes";

import { getCsColor, getCsCartesian2 } from "./csTools";

export default class CsPointLayers {
  public csBaseHandle: CesiumBase | null = null;
  public viewer: any = null;
  public entities: any = null;

  private __layers: any = null;
  private __layerIdPrefix = "POINT_ENTITY_";

  public vuePopupIns: CsVueNodePopup | null = null;
  public mapEventIns: CsScreenEvent | null = null;

  constructor(mapBaseIns: CesiumBase) {
    this.csBaseHandle = mapBaseIns;
    this.viewer = mapBaseIns.viewer;
    this.entities = mapBaseIns.viewer.entities;
    this.__layers = new Map();

    this.vuePopupIns = new CsVueNodePopup(mapBaseIns);
    this.mapEventIns = new CsScreenEvent(mapBaseIns);
  }

  public destructor() {
    this.vuePopupIns?.destructor();
    this.mapEventIns?.destructor();

    this.clearEntities();
    this.csBaseHandle = null;
    this.viewer = null;
    this.entities = null;
    this.__layers = null;
  }

  private __Id(id: string) {
    return `${this.__layerIdPrefix}${id}`;
  }

  private __Name(name: string) {
    return `${this.__layerIdPrefix}${name}`;
  }

  public vNodePopupCb = (options: PointOptions) => {
    return (event: any) => {
      const pickPositon = event.position || event.endPosition; //  || event.startPosition
      const pick = this.viewer!.scene.pick(pickPositon);
      // console.log("Point_PopupCb", event, pick);
      // let cartesian;
      // if (this.viewer!.scene.mode == Cesium.SceneMode.SCENE3D) {
      //   const ray: any = this.viewer!.camera.getPickRay(event.position);
      //   cartesian = this.viewer!.scene.globe.pick(ray, this.viewer!.scene);
      // } else if (this.viewer!.scene.mode == Cesium.SceneMode.SCENE2D) {
      //   const ellipsoid = this.viewer.scene.globe.ellipsoid;
      //   cartesian = this.viewer!.camera!.pickEllipsoid(event.position, ellipsoid);
      // }
      if (pick != undefined) {
        const entity = pick.id;
        const entityId = entity.properties.id;

        if (entityId == options.id) {
          // 如果用户传入了回调，那么 调用 ，可能会更新popup
          if (options.event?.callback) {
            options.event?.callback(event, options);
            if (options.popup && options.popup.isUpdate) {
              const popupOpt = {
                ...options.popup,
                position: options.position,
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
    };
  };

  public createLayer(
    options: PointOptions = {
      id: "",
      name: "",
      position: [],
      point: {},
    },
  ) {
    if (!options.point || !options.id) {
      return null;
    }

    const id = this.__Id(options.id);
    let name = options.name ? options.name : nanoid(10);
    name = this.__Name(name);

    let position = [0, 0, 0];
    if (options.position && options.position.length && options.position.length === 3) {
      position = options.position;
    }
    position = Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]);

    const pointOpt = options.point;

    const color = getCsColor(pointOpt.color, Cesium.Color.RED);
    const outlineColor = getCsColor(pointOpt.outlineColor, Cesium.Color.WHITE);

    const point: any = {
      id: id,
      name: name,
      position: position,
      point: {
        id: options.id,
        show: pointOpt.show || false,
        pixelSize: pointOpt.pixelSize || 7,
        heightReference: pointOpt.heightReference,
        color: color,
        outlineColor: outlineColor,
        outlineWidth: pointOpt.outlineWidth || 0,
        scaleByDistance: pointOpt.scaleByDistance,
        translucencyByDistance: pointOpt.translucencyByDistance,
        distanceDisplayCondition: pointOpt.distanceDisplayCondition,
        disableDepthTestDistance: pointOpt.disableDepthTestDistance,
      },
      properties: options,
    };

    if (options.label) {
      const labelOpt = options.label;

      const text = labelOpt.text || options.name;
      const labelScale = labelOpt.scale ?? 1;
      const font = labelOpt.font || "14px MicroSoft YaHei";
      const style = labelOpt.style || Cesium.LabelStyle.FILL;
      const fillColor = getCsColor(labelOpt.fillColor, Cesium.Color.WHITE);
      const backgroundColor = getCsColor(labelOpt.backgroundColor, Cesium.Color.WHITE);
      const pixelOffset = getCsCartesian2(labelOpt.pixelOffset);

      point.label = {
        ...labelOpt,
        text: text,
        scale: labelScale,
        font: font,
        style: style,
        fillColor: fillColor,
        pixelOffset: pixelOffset, //偏移量
        backgroundColor: backgroundColor,
      };
    }

    const layerObj = {
      options,
      point,
      entity: null,
    };
    return layerObj;
  }

  public addTrigerPopupLayer = (options: PointOptions) => {
    if (options.popup) {
      const popupOpt = {
        ...options.popup,
        position: options.position,
        id: options.id,
        name: options.name,
      };
      if (popupOpt.popupType == popupType.vnode) {
        this.vuePopupIns?.addLayer(popupOpt as VueNodeOptions);

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
          this.vuePopupIns?.showPopupByID(options.id);
        }
      }
    }
  };

  public addLayer(options: PointOptions) {
    if (this.csBaseHandle) {
      const layerObj = this.createLayer(options);
      // console.log("layerObj", layerObj);
      if (layerObj) {
        const entity = this.entities.add(layerObj.point);
        layerObj["entity"] = entity;
        this.__layers.set(this.__Id(options.id), layerObj);

        this.addTrigerPopupLayer(options);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public flyToView(options: PointOptions) {
    if (this.csBaseHandle) {
      if (options.position) {
        this.csBaseHandle.flyToPosition(options.position);
        return true;
      }
    } else {
      return false;
    }
  }

  public hasLayer(options: PointOptions) {
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

  public removeLayer(options: PointOptions) {
    return this.removeLayerByID(options.id);
  }

  public removeLayerByID(id: string) {
    if (this.csBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        // this.entities.removeById(this.__Id(id));
        this.entities.remove(layerObj.entity);

        if (layerObj.options && layerObj.options.popup.isPopup) {
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

  public clearEntities() {
    if (this.csBaseHandle && this.__layers.size) {
      this.__layers.forEach((layerObj: any) => {
        this.entities.remove(layerObj.entity);

        if (layerObj.options && layerObj.options.popup.isPopup) {
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

  public setLayerOpacity(options: PointOptions, opacity: number) {
    return this.setLayerOpacityByID(options.id, opacity);
  }

  public setLayerOpacityByID(id: string, opacity: number) {
    if (this.csBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        layerObj.entity.point.color = layerObj.entity.point.color.getValue().withAlpha(opacity);
        layerObj.entity.point.outlineColor = layerObj.entity.point.outlineColor.getValue().withAlpha(opacity);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public showHiddenLayer(options: PointOptions, isShow: boolean) {
    return this.showHiddenLayerByID(options.id, isShow);
  }

  public showHiddenLayerByID(id: string, isShow: boolean) {
    if (this.csBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        layerObj.entity.show = isShow;
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
