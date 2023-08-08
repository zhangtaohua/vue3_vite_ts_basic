import * as Cesium from "cesium";
import type { SingleImageOptions } from "./singleImageLayersTypes";
import CesiumBase from "./base";
import { earthExtent } from "../geoConstant";
import { nanoid } from "nanoid";

import { popupType } from "../geoConstant";
import { getCenterFromExtent } from "../geoCommon";

import CsVueNodePopup from "./vueNodePopupLayers";
import type { VueNodeOptions } from "./vueNodePopupLayersTypes";

import CsScreenEvent from "./screenEvent";
import type { EventOptions } from "./screenEventTypes";
import { getCsColor, getCsCartesian2, getCsCartesian3 } from "./csTools";

export default class CsSingleImageLayers {
  public csBaseHandle: CesiumBase | null = null;
  public viewer: any = null;
  public imageryLayers: any = null;
  public entities: any = null;

  private __layers: any = null;
  private __layerIdPrefix = "SINGLE_IMAGERY_";

  public vuePopupIns: CsVueNodePopup | null = null;
  public mapEventIns: CsScreenEvent | null = null;

  constructor(mapBaseIns: CesiumBase) {
    this.csBaseHandle = mapBaseIns;
    this.viewer = mapBaseIns.viewer;
    this.imageryLayers = mapBaseIns.imageryLayers;
    this.entities = mapBaseIns.viewer.entities;
    this.__layers = new Map();

    this.vuePopupIns = new CsVueNodePopup(mapBaseIns);
    this.mapEventIns = new CsScreenEvent(mapBaseIns);
  }

  public destructor() {
    this.vuePopupIns?.destructor();
    this.mapEventIns?.destructor();

    this.clearLayer();
    this.csBaseHandle = null;
    this.imageryLayers = null;
    this.entities = null;
    this.__layers = null;
  }

  private __Id(id: string) {
    return `${this.__layerIdPrefix}${id}`;
  }

  private __Name(name: string) {
    return `${this.__layerIdPrefix}${name}`;
  }

  public vNodePopupCb = (options: SingleImageOptions) => {
    return (event: any) => {
      const pickPositon = event.position || event.endPosition; //  || event.startPosition
      const pick = this.viewer!.scene.pick(pickPositon);
      if (pick != undefined) {
        const entity = pick.id;
        const entityId = entity.properties.id;

        if (entityId == options.id) {
          // 如果用户传入了回调，那么 调用 ，可能会更新popup
          if (options.event?.callback) {
            options.event?.callback(event, options);
            if (options.popup && options.popup.isUpdate) {
              let position: any = options.position;
              if (!position) {
                const center = getCenterFromExtent(options.extent);
                if (center) {
                  position = [center[0], center[1], 0];
                } else {
                  position = [0, 0, 0];
                }
              }
              const popupOpt = {
                ...options.popup,
                position: position,
                id: options.id,
                name: options.name,
              };
              this.vuePopupIns?.updateLayer(popupOpt as VueNodeOptions);
            }
          }
          this.vuePopupIns?.showPopupByID(options.id);
        }
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

  public async createLayer(
    options: SingleImageOptions = {
      url: "",
      id: "",
      name: "",
      extent: [],
    },
  ) {
    if (!options.url || !options.id) {
      return null;
    }
    const id = this.__Id(options.id);
    let name = options.name ? options.name : nanoid(10);
    name = this.__Name(name);

    let extent = earthExtent;
    if (options.extent && options.extent.length && options.extent.length === 4) {
      extent = options.extent;
    }
    let position: any = options.position;
    if (!position) {
      const center = getCenterFromExtent(options.extent);
      if (center) {
        position = [center[0], center[1], 0];
      } else {
        position = [0, 0, 0];
      }
      options.position = position;
    }

    const zIndex = this.csBaseHandle!.getCurrentzIndex(options.zIndex);
    const rectangleExtent = Cesium.Rectangle.fromDegrees(extent[0], extent[1], extent[2], extent[3]);

    const singleImageOptions = {
      rectangle: rectangleExtent,
    };
    const provider = await Cesium.SingleTileImageryProvider.fromUrl(options.url, singleImageOptions);
    const layer = new Cesium.ImageryLayer(provider);
    layer.name = name;
    layer.id = id;

    const rectangle: any = {
      id: id,
      name: name,
      position: position,
      show: true,
      rectangle: {
        id: options.id,
        coordinates: rectangleExtent,
        height: 0,
        material: Cesium.Color.WHITE.withAlpha(0.01),
        show: true,
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

      rectangle.label = {
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
      provider,
      layer,
      rectangle,
      zIndex,
      entity: null,
    };
    return layerObj;
  }

  public addTrigerPopupLayer = (options: SingleImageOptions) => {
    if (options.popup) {
      let position: any = options.position;
      if (!position) {
        const center = getCenterFromExtent(options.extent);
        if (center) {
          position = [center[0], center[1], 0];
        } else {
          position = [0, 0, 0];
        }
      }

      const popupOpt = {
        ...options.popup,
        position: position,
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

  public async addLayer(options: SingleImageOptions) {
    if (this.csBaseHandle) {
      const layerObj = await this.createLayer(options);
      if (layerObj) {
        this.imageryLayers.add(layerObj.layer);
        const entity = this.entities.add(layerObj.rectangle);
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

  public flyToView(options: SingleImageOptions) {
    if (this.csBaseHandle) {
      if (options.extent) {
        this.csBaseHandle.fitToExtent(options.extent);
        return true;
      }
    } else {
      return false;
    }
  }

  public hasLayer(options: SingleImageOptions) {
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

  public removeLayer(options: SingleImageOptions, destroy = true) {
    return this.removeLayerByID(options.id, destroy);
  }

  public removeLayerByID(id: string, destroy: boolean) {
    if (this.csBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        this.imageryLayers.remove(layerObj.layer, destroy);
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

  public clearLayer(destroy = true) {
    if (this.csBaseHandle && this.__layers.size) {
      this.__layers.forEach((layerObj: any) => {
        this.imageryLayers.remove(layerObj.layer, destroy);
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

  public setLayerOpacity(options: SingleImageOptions, opacity: number) {
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

  public showHiddenLayer(options: SingleImageOptions, isShow: boolean) {
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
