// 用来加载icon 或者小图片。

import * as Cesium from "cesium";
import type { BillboardsOptions } from "./billboardLayersTypes";
import type { PointOptions } from "./pointLayersTypes";
import type {
  EllipseOptions,
  PolygonOptions,
  PolylineOptions,
  RectangleOptions,
  LabelOptions,
} from "./entityBasicLayersTypes";

import type { CsPopupOptions, CsScreenEventOptions, CsEntityLabelOptions } from "./baseTypes";

import CesiumBase from "./base";
import { nanoid } from "nanoid";

import { getCsColor, getCsCartesian2, getCsCartesian3 } from "./csTools";

export default class CsBasicEntityLayers {
  public csBaseHandle: CesiumBase | null = null;
  public viewer: any = null;
  public entities: any = null;
  public pinBuilder: any = null;

  private __layers: any = null;
  private __layerIdPrefix = "BASIC_ENTITY_";

  constructor(mapBaseIns: CesiumBase) {
    this.csBaseHandle = mapBaseIns;
    this.viewer = mapBaseIns.viewer;
    this.entities = mapBaseIns.viewer.entities;
    this.__layers = new Map();

    this.pinBuilder = new Cesium.PinBuilder();
  }

  public destructor() {
    this.clearEntities();
    this.csBaseHandle = null;
    this.viewer = null;
    this.entities = null;
    this.__layers = null;
    this.pinBuilder = null;
  }

  private __Id(id: string) {
    return `${this.__layerIdPrefix}${id}`;
  }

  private __Name(name: string) {
    return `${this.__layerIdPrefix}${name}`;
  }

  public async makePinFromImage(image: any, color: any, size: number) {
    try {
      const url = Cesium.buildModuleUrl(image);
      const pinCanvas = await this.pinBuilder.fromUrl(url, color, size);
      return pinCanvas.toDataURL();
    } catch (error: any) {
      return this.pinBuilder.fromColor(color, 48).toDataURL();
    }
  }
  public async addBillboardLayer(options: BillboardsOptions) {
    if (!options.billboard || !options.id) {
      return null;
    }

    const id = this.__Id(options.id);
    let name = options.name ? options.name : nanoid(10);
    name = this.__Name(name);

    let position: any = [0, 0, 0];
    if (options.position && options.position.length && options.position.length === 3) {
      position = options.position;
      position = Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]);
    } else if (options.position instanceof Cesium.Cartesian3) {
      position = options.position;
    }

    const billboardOpt = options.billboard;
    const scale = billboardOpt.scale ? billboardOpt.scale : 1;
    const color = getCsColor(billboardOpt.color, Cesium.Color.WHITE);
    const pixelOffset = getCsCartesian2(billboardOpt.pixelOffset);
    const eyeOffset = getCsCartesian2(billboardOpt.eyeOffset);

    let imageUrl: any = billboardOpt.image;
    const pinOpt = options.pin;
    if (pinOpt) {
      const pinColortemp = pinOpt.color || billboardOpt.color;
      const pinColor = getCsColor(pinColortemp, Cesium.Color.WHITE);
      const size = pinOpt.size || 32;
      if (pinOpt.image) {
        imageUrl = await this.makePinFromImage(pinOpt.image, pinColor, size);
      } else if (billboardOpt.image) {
        imageUrl = await this.makePinFromImage(billboardOpt.image, pinColor, size);
      } else if (pinOpt.text) {
        imageUrl = this.pinBuilder.fromText(pinOpt.text, pinColor, size).toDataURL();
      } else {
        imageUrl = this.pinBuilder.fromColor(pinColor, size).toDataURL();
      }
    }

    const billboard: any = {
      id: id,
      name: name,
      position: position,
      billboard: {
        id: options.id,
        image: imageUrl,
        // imageSubRegion: billboardOpt.imageSubRegion,
        show: billboardOpt.show,
        // 该属性指定标签在屏幕空间中距此标签原点的像素偏移量
        pixelOffset: pixelOffset,
        eyeOffset: eyeOffset,
        // heightReference: billboardOpt.heightReference ?? Cesium.HeightReference.NONE,
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
        // width: billboardOpt.width,
        // 高度（以像素为单位）
        // height: billboardOpt.height,
        // scaleByDistance: billboardOpt.scaleByDistance,
        // translucencyByDistance: billboardOpt.translucencyByDistance,
        // pixelOffsetScaleByDistance: billboardOpt.pixelOffsetScaleByDistance,
        // 大小是否以米为单位
        sizeInMeters: billboardOpt.sizeInMeters ?? false,
        // distanceDisplayCondition: billboardOpt.distanceDisplayCondition,
        disableDepthTestDistance: billboardOpt.disableDepthTestDistance,
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

    const entity = this.entities.add(billboard);

    const layerObj = {
      options,
      entity,
      type: "billboard",
      entityOpt: billboard,
    };
    this.__layers.set(id, layerObj);
  }

  public setBillboardLayerOpacity(options: BillboardsOptions, opacity: number) {
    return this.setBillboardLayerOpacityByID(options.id, opacity);
  }

  public setBillboardLayerOpacityByID(id: string, opacity: number) {
    if (this.csBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        // layerObj.entity.billboard.color = new Cesium.Color(1.0, 1.0, 1.0, opacity);
        const entity = layerObj.entity;
        if (entity.billboard) {
          entity.billboard!.color = entity.billboard!.color.getValue().withAlpha(opacity);
        }

        if (entity.label) {
          entity.label!.fillColor = entity.label!.fillColor.getValue().withAlpha(opacity);
          if (entity.label!.backgroundColor) {
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

  public async addEllipseLayer(options: EllipseOptions) {
    if (!options.ellipse || !options.id) {
      return null;
    }

    const id = this.__Id(options.id);
    let name = options.name ? options.name : nanoid(10);
    name = this.__Name(name);

    let position: any = [0, 0, 0];
    if (options.position && options.position.length && options.position.length === 3) {
      position = options.position;
      position = Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]);
    } else if (options.position instanceof Cesium.Cartesian3) {
      position = options.position;
    }

    const ellipseOpt = options.ellipse;
    const height = ellipseOpt.height ? ellipseOpt.height : 0;
    const granularity = ellipseOpt.granularity ? ellipseOpt.granularity : Cesium.Math.RADIANS_PER_DEGREE;
    const fill = ellipseOpt.fill ?? true;
    const color = getCsColor(ellipseOpt.color || ellipseOpt.material, Cesium.Color.WHITE);
    const outlineColor = getCsColor(ellipseOpt.outlineColor, Cesium.Color.WHITE);

    const ellipse: any = {
      id: id,
      name: name,
      position: position,
      ellipse: {
        id: options.id,
        show: true,
        semiMajorAxis: ellipseOpt.semiMajorAxis,
        semiMinorAxis: ellipseOpt.semiMinorAxis,
        height: height,

        heightReference: ellipseOpt.heightReference,
        extrudedHeight: ellipseOpt.extrudedHeight,
        extrudedHeightReference: ellipseOpt.extrudedHeightReference,

        rotation: ellipseOpt.rotation ?? 0.0,
        stRotation: ellipseOpt.stRotation ?? 0.0,
        granularity: granularity,

        fill: fill,
        material: color,
        outline: ellipseOpt.outline ?? false,
        outlineColor: outlineColor,
        outlineWidth: ellipseOpt.outlineWidth || 0,
        numberOfVerticalLines: ellipseOpt.numberOfVerticalLines,
        shadows: ellipseOpt.shadows,
        distanceDisplayCondition: ellipseOpt.distanceDisplayCondition,
        classificationType: ellipseOpt.classificationType,
        zIndex: ellipseOpt.zIndex,
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

      ellipse.label = {
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

    const entity = this.entities.add(ellipse);

    const layerObj = {
      options,
      entity,
      type: "ellipse",
      entityOpt: ellipse,
    };
    this.__layers.set(id, layerObj);
  }

  public setEllipseLayerOpacity(options: EllipseOptions, opacity: number) {
    return this.setEllipseLayerOpacityByID(options.id, opacity);
  }

  public setEllipseLayerOpacityByID(id: string, opacity: number) {
    if (this.csBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        // layerObj.entity.billboard.color = new Cesium.Color(1.0, 1.0, 1.0, opacity);
        const entity = layerObj.entity;
        if (entity.ellipse) {
          entity.ellipse!.material = entity.ellipse!.material.getValue().withAlpha(opacity);
          entity.ellipse!.outlineColor = entity.ellipse!.outlineColor.getValue().withAlpha(opacity);
        }

        if (entity.label) {
          entity.label!.fillColor = entity.label!.fillColor.getValue().withAlpha(opacity);
          if (entity.label!.backgroundColor) {
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

  public addPointLayer(options: PointOptions) {
    if (!options.point || !options.id) {
      return null;
    }

    const id = this.__Id(options.id);
    let name = options.name ? options.name : nanoid(10);
    name = this.__Name(name);

    let position: any = [0, 0, 0];
    if (options.position && options.position.length && options.position.length === 3) {
      position = options.position;
      position = Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]);
    } else if (options.position instanceof Cesium.Cartesian3) {
      position = options.position;
    }

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

    const entity = this.entities.add(point);

    const layerObj = {
      options,
      entity,
      type: "point",
      entityOpt: point,
    };
    this.__layers.set(id, layerObj);
  }

  public setPointLayerOpacity(options: PointOptions, opacity: number) {
    return this.setPointLayerOpacityByID(options.id, opacity);
  }

  public setPointLayerOpacityByID(id: string, opacity: number) {
    if (this.csBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        const entity = layerObj.entity;
        if (entity.point) {
          entity.point!.color = entity.point!.color.getValue().withAlpha(opacity);
          entity.point!.outlineColor = entity.point!.outlineColor.getValue().withAlpha(opacity);
        }

        if (entity.label) {
          entity.label!.fillColor = entity.label!.fillColor.getValue().withAlpha(opacity);
          if (entity.label!.backgroundColor) {
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

  public addPolygonLayer(options: PolygonOptions) {
    if (!options.polygon || !options.id) {
      return null;
    }

    const id = this.__Id(options.id);
    let name = options.name ? options.name : nanoid(10);
    name = this.__Name(name);

    let position: any = [0, 0, 0];
    if (options.position && options.position.length && options.position.length === 3) {
      position = options.position;
      position = Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]);
    } else if (options.position instanceof Cesium.Cartesian3) {
      position = options.position;
    }

    const polygonOpt = options.polygon;

    const color = getCsColor(polygonOpt.color || polygonOpt.material, Cesium.Color.RED);
    const outlineColor = getCsColor(polygonOpt.outlineColor, Cesium.Color.WHITE);

    const polygon: any = {
      id: id,
      name: name,
      position: position,
      polygon: {
        show: true,
        hierarchy: polygonOpt.hierarchy,
        // height: polygonOpt.height ?? 0,
        // heightReference: polygonOpt.heightReference ?? Cesium.HeightReference.NONE,
        // extrudedHeight: polygonOpt.extrudedHeight,
        // extrudedHeightReference: polygonOpt.extrudedHeightReference ?? Cesium.HeightReference.NONE,
        stRotation: polygonOpt.stRotation ?? 0.0,
        granularity: polygonOpt.granularity ?? Cesium.Math.RADIANS_PER_DEGREE,
        fill: polygonOpt.fill ?? true,
        material: color,
        outline: polygonOpt.outline ?? false,
        outlineColor: outlineColor,
        outlineWidth: polygonOpt.outlineWidth ?? 1.0,
        perPositionHeight: polygonOpt.perPositionHeight ?? false,
        closeTop: polygonOpt.closeTop ?? true,
        closeBottom: polygonOpt.closeBottom ?? true,
        arcType: polygonOpt.arcType ?? Cesium.ArcType.GEODESIC,
        shadows: polygonOpt.shadows ?? Cesium.ShadowMode.DISABLED,
        // distanceDisplayCondition: polygonOpt.distanceDisplayCondition,
        // classificationType: polygonOpt.classificationType ?? Cesium.ClassificationType.BOTH,
        // zIndex: polygonOpt.zIndex ?? 0,
        // textureCoordinates: polygonOpt.textureCoordinates,
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

      polygon.label = {
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

    const entity = this.entities.add(polygon);

    const layerObj = {
      options,
      entity,
      type: "polygon",
      entityOpt: polygon,
    };
    this.__layers.set(id, layerObj);
  }

  public setPolygonLayerOpacity(options: PolygonOptions, opacity: number) {
    return this.setPolygonLayerOpacityByID(options.id, opacity);
  }

  public setPolygonLayerOpacityByID(id: string, opacity: number) {
    if (this.csBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        const entity = layerObj.entity;
        if (entity.polygon) {
          entity.polygon!.material = entity.polygon!.material.getValue().withAlpha(opacity);
          entity.polygon!.outlineColor = entity.polygon!.outlineColor.getValue().withAlpha(opacity);
        }

        if (entity.label) {
          entity.label!.fillColor = entity.label!.fillColor.getValue().withAlpha(opacity);
          if (entity.label!.backgroundColor) {
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

  public addRectangleLayer(options: RectangleOptions) {
    if (!options.rectangle || !options.id) {
      return null;
    }

    const id = this.__Id(options.id);
    let name = options.name ? options.name : nanoid(10);
    name = this.__Name(name);

    let position: any = [0, 0, 0];
    if (options.position && options.position.length && options.position.length === 3) {
      position = options.position;
      position = Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]);
    } else if (options.position instanceof Cesium.Cartesian3) {
      position = options.position;
    }

    const rectangleOpt = options.rectangle;

    const color = getCsColor(rectangleOpt.color || rectangleOpt.material, Cesium.Color.RED);
    const outlineColor = getCsColor(rectangleOpt.outlineColor, Cesium.Color.WHITE);

    const rectangle: any = {
      id: id,
      name: name,
      position: position,
      rectangle: {
        show: true,
        coordinates: rectangleOpt.coordinates,
        // height: rectangleOpt.height ?? 1,
        // heightReference: rectangleOpt.heightReference ?? Cesium.HeightReference.NONE,
        // extrudedHeight: rectangleOpt.extrudedHeight,
        // extrudedHeightReference: rectangleOpt.extrudedHeightReference ?? Cesium.HeightReference.NONE,
        rotation: rectangleOpt.rotation ?? 0.0,
        stRotation: rectangleOpt.stRotation ?? 0.0,
        granularity: rectangleOpt.granularity ?? Cesium.Math.RADIANS_PER_DEGREE,
        fill: rectangleOpt.fill ?? true,
        material: color,
        outline: rectangleOpt.outline ?? false,
        outlineColor: outlineColor,
        outlineWidth: rectangleOpt.outlineWidth ?? 1.0,

        shadows: rectangleOpt.shadows ?? Cesium.ShadowMode.DISABLED,
        // distanceDisplayCondition:
        //   rectangleOpt.distanceDisplayCondition ?? new Cesium.DistanceDisplayCondition(0.0, Number.MAX_VALUE),
        // classificationType: rectangleOpt.classificationType ?? Cesium.ClassificationType.BOTH,
        // zIndex: rectangleOpt.zIndex ?? 0,
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

    const entity = this.entities.add(rectangle);

    const layerObj = {
      options,
      entity,
      type: "rectangle",
      entityOpt: rectangle,
    };
    this.__layers.set(id, layerObj);
  }

  public setRectangleLayerOpacity(options: RectangleOptions, opacity: number) {
    return this.setRectangleLayerOpacityByID(options.id, opacity);
  }

  public setRectangleLayerOpacityByID(id: string, opacity: number) {
    if (this.csBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        const entity = layerObj.entity;
        if (entity.rectangle) {
          entity.rectangle!.material = entity.rectangle!.material.getValue().withAlpha(opacity);
          entity.rectangle!.outlineColor = entity.rectangle!.outlineColor.getValue().withAlpha(opacity);
        }

        if (entity.label) {
          entity.label!.fillColor = entity.label!.fillColor.getValue().withAlpha(opacity);
          if (entity.label!.backgroundColor) {
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

  public addPolylineLayer(options: PolylineOptions) {
    if (!options.polyline || !options.id) {
      return null;
    }

    const id = this.__Id(options.id);
    let name = options.name ? options.name : nanoid(10);
    name = this.__Name(name);

    let position: any = [0, 0, 0];
    if (options.position && options.position.length && options.position.length === 3) {
      position = options.position;
      position = Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]);
    } else if (options.position instanceof Cesium.Cartesian3) {
      position = options.position;
    }

    const polylineOpt = options.polyline;

    const color = getCsColor(polylineOpt.color || polylineOpt.material, Cesium.Color.RED);
    const depthFailMaterial = getCsColor(polylineOpt.depthFailMaterial, Cesium.Color.WHITE);

    const polyline: any = {
      id: id,
      name: name,
      position: position,
      polyline: {
        show: true,
        positions: polylineOpt.positions,
        width: polylineOpt.width ?? 1,
        // granularity: polylineOpt.granularity ?? Cesium.Math.RADIANS_PER_DEGREE,

        material: color,
        depthFailMaterial: depthFailMaterial,
        // material: new Cesium.PolylineGlowMaterialProperty({
        //   // eslint-disable-next-line new-cap
        //   color: Cesium.Color.WHEAT,
        // }),
        // depthFailMaterial: new Cesium.PolylineGlowMaterialProperty({
        //   // eslint-disable-next-line new-cap
        //   color: Cesium.Color.WHEAT,
        // }),

        // arcType: polylineOpt.arcType ?? Cesium.ArcType.GEODESIC,
        clampToGround: polylineOpt.clampToGround ?? true,
        shadows: polylineOpt.shadows ?? Cesium.ShadowMode.DISABLED,
        // distanceDisplayCondition:
        //   polylineOpt.distanceDisplayCondition ?? new Cesium.DistanceDisplayCondition(0.0, Number.MAX_VALUE),
        // classificationType: polylineOpt.classificationType ?? Cesium.ClassificationType.BOTH,
        // zIndex: polylineOpt.zIndex ?? 0,
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

      polyline.label = {
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

    const entity = this.entities.add(polyline);

    const layerObj = {
      options,
      entity,
      type: "polyliine",
      entityOpt: polyline,
    };
    this.__layers.set(id, layerObj);
  }

  public setPolylineLayerPositionsByID(id: string, positions: any) {
    if (this.csBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        const entity = layerObj.entity;
        if (entity.polyline) {
          entity.polyline!.positions = positions;
        }
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public setPolylineLayerOpacity(options: PolylineOptions, opacity: number) {
    return this.setPolylineLayerOpacityByID(options.id, opacity);
  }

  public setPolylineLayerOpacityByID(id: string, opacity: number) {
    if (this.csBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        const entity = layerObj.entity;
        if (entity.polyline) {
          entity.polyline!.material = entity.polyline!.material.getValue().withAlpha(opacity);
          if (entity.polyline!.depthFailMaterial) {
            entity.polyline!.depthFailMaterial = entity.polyline!.depthFailMaterial.getValue().withAlpha(opacity);
          }
        }

        if (entity.label) {
          entity.label!.fillColor = entity.label!.fillColor.getValue().withAlpha(opacity);
          if (entity.label!.backgroundColor) {
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

  public addLabelLayer(options: LabelOptions) {
    if (!options.label || !options.id) {
      return null;
    }

    const id = this.__Id(options.id);
    let name = options.name ? options.name : nanoid(10);
    name = this.__Name(name);

    let position: any = [0, 0, 0];
    if (options.position && options.position.length && options.position.length === 3) {
      position = options.position;
      position = Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]);
    } else if (options.position instanceof Cesium.Cartesian3) {
      position = options.position;
    }

    const labelOpt = options.label;

    const text = labelOpt.text || options.name;
    const labelScale = labelOpt.scale ?? 1;
    const font = labelOpt.font || "14px MicroSoft YaHei";
    const style = labelOpt.style || Cesium.LabelStyle.FILL;
    const fillColor = getCsColor(labelOpt.fillColor, Cesium.Color.WHITE);
    const backgroundColor = getCsColor(labelOpt.backgroundColor, Cesium.Color.WHITE);
    const pixelOffset = getCsCartesian2(labelOpt.pixelOffset);

    const label: any = {
      id: id,
      name: name,
      position: position,
      label: {
        ...labelOpt,
        text: text,
        scale: labelScale,
        font: font,
        style: style,
        fillColor: fillColor,
        pixelOffset: pixelOffset, //偏移量
        backgroundColor: backgroundColor,
      },
      properties: options,
    };

    const entity = this.entities.add(label);

    const layerObj = {
      options,
      entity,
      type: "label",
      entityOpt: label,
    };

    this.__layers.set(id, layerObj);
    return true;
  }

  public setLabelLayerOpacity(options: LabelOptions, opacity: number) {
    return this.setLabelLayerOpacityByID(options.id, opacity);
  }

  public setLabelLayerOpacityByID(id: string, opacity: number) {
    if (this.csBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        const entity = layerObj.entity;
        if (entity.label) {
          entity.label!.fillColor = entity.label!.fillColor.getValue().withAlpha(opacity);
          if (entity.label!.backgroundColor) {
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

  public hasLayer(options: any) {
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

  public removeLayer(options: any) {
    return this.removeLayerByID(options.id);
  }

  public removeLayerByID(id: string) {
    if (this.csBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        // this.entities.removeById(this.__Id(id));
        this.entities.remove(layerObj.entity);
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
      });
      this.__layers.clear();
      return true;
    } else {
      return false;
    }
  }

  public showHiddenLayer(options: any, isShow: boolean) {
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
