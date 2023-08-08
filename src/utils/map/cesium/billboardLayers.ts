// 用来加载icon 或者小图片。

import * as Cesium from "cesium";
import type { BillboardsOptions } from "./billboardLayersTypes";
import CesiumBase from "./base";
import { nanoid } from "nanoid";

import { popupType } from "../geoConstant";

import CsVueNodePopup from "./vueNodePopupLayers";
import type { VueNodeOptions } from "./vueNodePopupLayersTypes";

import CsScreenEvent from "./screenEvent";
import type { EventOptions } from "./screenEventTypes";

import { getCsColor, getCsCartesian2, getCsCartesian3 } from "./csTools";
export default class CsBillboardLayers {
  public csBaseHandle: CesiumBase | null = null;
  public viewer: any = null;
  public entities: any = null;

  private __layers: any = null;
  private __layerIdPrefix = "BILLBOARD_ENTITY_";

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

  public vNodePopupCb = (options: BillboardsOptions) => {
    return (event: any) => {
      const pickPositon = event.position || event.endPosition; //  || event.startPosition
      const pick = this.viewer!.scene.pick(pickPositon);
      // console.log("Billboard_PopupCb", event, pick);
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
    options: BillboardsOptions = {
      id: "",
      name: "",
      position: [],
      billboard: {
        image: "",
      },
    },
  ) {
    if (!options.billboard || !options.id) {
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

    const billboardOpt = options.billboard;
    const scale = billboardOpt.scale ? billboardOpt.scale : 1;
    const color = getCsColor(billboardOpt.color, Cesium.Color.WHITE);
    const pixelOffset = getCsCartesian2(billboardOpt.pixelOffset);
    const eyeOffset = getCsCartesian2(billboardOpt.eyeOffset);

    const billboard: any = {
      id: id,
      name: name,
      position: position,
      billboard: {
        id: options.id,
        image: billboardOpt.image,
        imageSubRegion: billboardOpt.imageSubRegion,
        show: billboardOpt.show,
        // 该属性指定标签在屏幕空间中距此标签原点的像素偏移量
        pixelOffset: pixelOffset,
        eyeOffset: eyeOffset,
        heightReference: billboardOpt.heightReference ?? Cesium.HeightReference.NONE,
        // 相对于坐标的水平位置
        horizontalOrigin: billboardOpt.horizontalOrigin ?? Cesium.HorizontalOrigin.CENTER,
        // 相对于坐标的垂直位置
        verticalOrigin: billboardOpt.verticalOrigin ?? Cesium.VerticalOrigin.CENTER,
        // 应用于图像的统一比例。比例大于会1.0放大标签，而比例小于会1.0缩小标签。
        scale: scale,
        // 设置颜色和透明度
        color: color,
        rotation: 0.0,
        alignedAxis: billboardOpt.alignedAxis ?? Cesium.Cartesian3.ZERO,
        // 宽度（以像素为单位）
        width: billboardOpt.width,
        // 高度（以像素为单位）
        height: billboardOpt.height,
        scaleByDistance: billboardOpt.scaleByDistance,
        translucencyByDistance: billboardOpt.translucencyByDistance,
        pixelOffsetScaleByDistance: billboardOpt.pixelOffsetScaleByDistance,
        // 大小是否以米为单位
        sizeInMeters: billboardOpt.sizeInMeters ?? false,
        distanceDisplayCondition: billboardOpt.distanceDisplayCondition,
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

      billboard.label = {
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
      billboard,
      entity: null,
    };
    return layerObj;
  }

  public addTrigerPopupLayer = (options: BillboardsOptions) => {
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

  public addLayer(options: BillboardsOptions) {
    if (this.csBaseHandle) {
      const layerObj = this.createLayer(options);
      // console.log("layerObj", layerObj);
      if (layerObj) {
        const entity = this.entities.add(layerObj.billboard);
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

  public flyToView(options: BillboardsOptions) {
    if (this.csBaseHandle) {
      if (options.position) {
        this.csBaseHandle.flyToPosition(options.position);
        return true;
      }
    } else {
      return false;
    }
  }

  public hasLayer(options: BillboardsOptions) {
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

  public removeLayer(options: BillboardsOptions) {
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

  public setLayerOpacity(options: BillboardsOptions, opacity: number) {
    return this.setLayerOpacityByID(options.id, opacity);
  }

  public setLayerOpacityByID(id: string, opacity: number) {
    if (this.csBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        // layerObj.entity.billboard.color = new Cesium.Color(1.0, 1.0, 1.0, opacity);
        layerObj.entity.billboard.color = layerObj.entity.billboard.color.getValue().withAlpha(opacity);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public setImage(options: BillboardsOptions, image: any) {
    return this.setImageByID(options.id, image);
  }

  public setImageByID(id: string, image: any) {
    if (this.csBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        // 这里可能有错，此方法是在billboard 上才有的。
        layerObj.entity.billboard.setImage(this.__Id(id), image);
        // layerObj.entity.billboard.image = image;
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public showHiddenLayer(options: BillboardsOptions, isShow: boolean) {
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
