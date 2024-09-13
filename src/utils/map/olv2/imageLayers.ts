import { Map as olMap } from "ol";
import StaticImage from "ol/source/ImageStatic";
import ImageLayer from "ol/layer/Image";
import { getCenter } from "ol/extent";
import Polygon from "ol/geom/Polygon.js";
import Feature from "ol/Feature";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { transparentPolygonStyle } from "./style";

import { getDistance } from "ol/sphere";

import { nanoid } from "nanoid";

import OlBase from "./base";
import { transformExtentTo3857, getAngleOfNorthFromCoordinates, getEastRadiansFromRectCoords } from "./olTools";
import { earthExtent, popupType, isCustomizeFlag, customMeta } from "../geoConstant";
import { getRectangleFromExtent } from "../geoCommon";
import type { StaticImageOptions } from "./imageLayersTypes";

import OpenLayersMapEvent from "./mapEvent";
import type { EventOptions } from "./mapEventTypes";

import OpenLayerVueNodePopup from "./vueNodePopupLayers";
import type { VueNodeOptions } from "./vueNodePopupLayersTypes";

import OpenLayersPopup from "./popupLayers";

import { mapEventType } from "./olConstant";

import { getExtentFromRectCoords } from "../geoCommon";

export default class OlStaticImageLayers {
  public olBaseHandle: OlBase | null = null;
  public handle: olMap | null = null;

  public vuePopupIns: OpenLayerVueNodePopup | null = null;
  public normalPopupIns: OpenLayersPopup | null = null;
  public mapEventIns: OpenLayersMapEvent | null = null;

  private __mapEventsMap: any = null;
  private __popupInsMap: any = null;
  private __vuepopupInsMap: any = null;

  private __layers: any = null;
  private __layerIdPrefix = "IMAGE_";

  constructor(mapBaseIns: OlBase) {
    this.olBaseHandle = mapBaseIns;
    this.handle = mapBaseIns.handle;
    this.__layers = new Map();
    this.__mapEventsMap = new Map();
    this.__popupInsMap = new Map();
    this.__vuepopupInsMap = new Map();

    this.mapEventIns = new OpenLayersMapEvent(mapBaseIns);
    this.normalPopupIns = new OpenLayersPopup(mapBaseIns);
    this.vuePopupIns = new OpenLayerVueNodePopup(mapBaseIns);
  }

  public destructor() {
    this.normalPopupIns!.destructor();
    this.vuePopupIns!.destructor();
    this.mapEventIns!.destructor();

    this.clearLayer();
    this.olBaseHandle = null;
    this.handle = null;

    this.__layers.clear();
    this.__layers = null;
    this.__mapEventsMap = null;
    this.__popupInsMap = null;
    this.__vuepopupInsMap = null;
  }

  private __Id(id: string) {
    return `${this.__layerIdPrefix}${id}`;
  }

  private __Name(name: string) {
    return `${this.__layerIdPrefix}${name}`;
  }

  public createLayer(
    options: StaticImageOptions = {
      url: "",
      id: "",
      name: "",
      zIndex: 0,
      extent: earthExtent,
      wrapX: true,
      opacity: 1,
      htmlString: "",
    },
  ) {
    if (!options.url || !options.id) {
      return null;
    }
    if (options.isRotation) {
      if (options.extent && options.extent?.length) {
        if (options.extent[0] && options.extent[0].length >= 5) {
          // [left, bottom, right, top]
          let extent = getExtentFromRectCoords(options.extent);
          extent = transformExtentTo3857(extent);

          let extentAngle = 0;
          if (options.rotationInDegree) {
            extentAngle = (options.rotationInDegree * Math.PI) / 180;
          } else {
            extentAngle = getAngleOfNorthFromCoordinates(options.extent);
          }

          const { vectorOneAngle, vectorTwoAngle, vectorThreeAngle } = getEastRadiansFromRectCoords(options.extent);
          // console.log("计算的extent", extent);

          let name = options.name ? options.name : nanoid(10);
          name = this.__Name(name);
          const id = this.__Id(options.id);
          const zIndex = options.zIndex ? options.zIndex : this.olBaseHandle!.getCurrentzIndex();

          const polygonPoints = getRectangleFromExtent(extent);
          const PloygonOptions = {
            geometry: new Polygon(polygonPoints),
            name: name,
            id: id,
            wrapX: options.wrapX,
          };
          const feature = new Feature(PloygonOptions);
          feature.setStyle(transparentPolygonStyle);

          const meta = {
            [isCustomizeFlag]: true,
            [customMeta]: options,
          };
          feature.setProperties(meta);

          const sourceVector = new VectorSource({
            features: [feature],
            wrapX: options.wrapX,
          });
          sourceVector.setProperties(meta);

          const layerVector = new VectorLayer({
            source: sourceVector,
            zIndex: zIndex,
            declutter: true,
          });
          layerVector.setProperties(meta);

          layerVector.set("id", id + "_vector");
          layerVector.set("name", name + "_vector");

          const imageOptions = {
            url: options.url,
            imageExtent: extent,
            interpolate: true,
            wrapX: options.wrapX,
            // 原始方案 替换了原来的canvas
            imageLoadFunction: (wrapImg: any, url: string) => {
              wrapImg.getImage().src = url;

              wrapImg.getImage().onload = () => {
                const img = wrapImg.getImage();
                const canvasNew = document.createElement("canvas");
                const contextCva = canvasNew.getContext("2d");

                const diagonalLength = Math.sqrt(img.width * img.width + img.height * img.height);

                const width1 = Math.abs(diagonalLength * Math.cos(vectorOneAngle));
                const width2 = Math.abs(diagonalLength * Math.cos(vectorTwoAngle));
                const realWidth = Math.max(width1, width2);

                const height1 = Math.abs(diagonalLength * Math.sin(vectorOneAngle));
                const height2 = Math.abs(diagonalLength * Math.sin(vectorTwoAngle));
                const realHeight = Math.max(height1, height2);

                // 计算旋转后的画布大小
                canvasNew.width = realWidth > img.width ? Math.ceil(realWidth) : img.width;
                canvasNew.height = realHeight > img.height ? Math.ceil(realHeight) : img.height;

                // 这其实是不对的，要用原始的矩形经纬度来算，但是拿不到呀！
                const realAngle = extentAngle;

                // contextCva.moveTo(0, canvasNew.height / 2);
                // contextCva.lineTo(canvasNew.width, canvasNew.height / 2);
                // contextCva.stroke();

                // contextCva.beginPath();
                // contextCva.moveTo(canvasNew.width / 2, 0);
                // contextCva.lineTo(canvasNew.width / 2, canvasNew.height);
                // contextCva.stroke();

                // 平移转换，改变画笔的原点位置为画布的中心点
                contextCva.translate(canvasNew.width / 2, canvasNew.height / 2);
                // 旋转转换，改变画笔的旋转角度
                contextCva.rotate(realAngle);
                // 调用绘制图片的方法把图片绘制到canvas中
                contextCva.drawImage(img, -img.width / 2, -img.height / 2);

                // 还原坐标系
                contextCva.translate(-canvasNew.width / 2, -canvasNew.height / 2);
                contextCva.rotate(-realAngle);
                // 使用 restore()进行恢复
                contextCva.restore();

                // const imgSrc = canvasNew.toDataURL(); //获取图片的DataURL
                wrapImg.setImage(canvasNew);
              };
            },
          };
          const source = new StaticImage(imageOptions);
          source.setProperties(meta);

          const opacity = options.opacity ? options.opacity : 1;
          const layer = new ImageLayer({
            source: source,
            extent: extent,
            zIndex: zIndex + 1,
            opacity: opacity,
          });
          layer.setProperties(meta);
          layer.set("id", id);
          layer.set("name", name);

          const layerObj = {
            options,
            imageOptions,
            source,
            layer,
            layerVector,
          };
          return layerObj;
        }
      }
    } else {
      // [left, bottom, right, top]
      let extent = earthExtent;
      if (options.extent && options.extent.length && options.extent.length === 4) {
        extent = options.extent;
      }
      extent = transformExtentTo3857(extent);
      let name = options.name ? options.name : nanoid(10);
      name = this.__Name(name);
      const id = this.__Id(options.id);
      const zIndex = options.zIndex ? options.zIndex : this.olBaseHandle!.getCurrentzIndex();

      const polygonPoints = getRectangleFromExtent(extent);
      const PloygonOptions = {
        geometry: new Polygon(polygonPoints),
        name: name,
        id: id,
        wrapX: options.wrapX,
      };
      const feature = new Feature(PloygonOptions);
      feature.setStyle(transparentPolygonStyle);
      const meta = {
        [isCustomizeFlag]: true,
        [customMeta]: options,
      };
      feature.setProperties(meta);

      const sourceVector = new VectorSource({
        features: [feature],
        wrapX: options.wrapX,
      });
      sourceVector.setProperties(meta);

      const layerVector = new VectorLayer({
        source: sourceVector,
        zIndex: zIndex,
        declutter: true,
      });
      layerVector.setProperties(meta);

      layerVector.set("id", id + "_vector");
      layerVector.set("name", name + "_vector");

      const imageOptions = {
        url: options.url,
        imageExtent: extent,
        interpolate: true,
        wrapX: options.wrapX,
      };
      const source = new StaticImage(imageOptions);
      source.setProperties(meta);

      const opacity = options.opacity ? options.opacity : 1;
      const layer = new ImageLayer({
        source: source,
        extent: extent,
        zIndex: zIndex + 1,
        opacity: opacity,
      });
      layer.setProperties(meta);
      layer.set("id", id);
      layer.set("name", name);

      const layerObj = {
        options,
        imageOptions,
        source,
        layer,
        layerVector,
      };
      return layerObj;
    }
  }

  public narmalPopupCb = (options: StaticImageOptions) => {
    return (event: any) => {
      console.log(`${options.id}_CB`);
      let pixel = event.pixel;
      // let coordinate = event.coordinate
      if (!pixel.length) {
        pixel = this.handle.getEventPixel(event.originalEvent);
      }
      // if(this.handle.hasFeatureAtPixel(pixel)) {}
      const feature = this.handle.forEachFeatureAtPixel(pixel, function (feature: any) {
        const isCustom = feature.get(isCustomizeFlag);
        const metadata = feature.get(customMeta);
        const id = metadata?.id;
        if (isCustom && id === options.id) {
          return feature;
        }
      });

      if (feature) {
        if (options.callback) {
          options.callback(feature, options);
        }
        const center = this.getCenterById(options.id);
        this.normalPopupIns?.showPopupByID(options.id, center, options.htmlString);
      } else {
        if (options.eventType == mapEventType.pointermove) {
          this.normalPopupIns?.hiddenPopupByID(options.id);
        }
      }
    };
  };

  public vNodePopupCb = (options: StaticImageOptions) => {
    return (event: any) => {
      let pixel = event.pixel;
      if (!pixel.length) {
        pixel = this.handle.getEventPixel(event.originalEvent);
      }
      const feature = this.handle.forEachFeatureAtPixel(pixel, function (feature: any) {
        const isCustom = feature.get(isCustomizeFlag);
        const metadata = feature.get(customMeta);
        const id = metadata?.id;
        if (isCustom && id === options.id) {
          return feature;
        }
      });

      if (feature) {
        if (options.callback) {
          options.callback(feature, options);
          this.vuePopupIns?.updateLayer(options as VueNodeOptions);
        }
        const center = this.getCenterById(options.id);
        this.vuePopupIns?.showPopupByID(options.id, center);
      } else {
        if (options.eventType == mapEventType.pointermove) {
          this.vuePopupIns?.hiddenPopupByID(options.id);
        }
      }
    };
  };

  public addLayer(options: StaticImageOptions) {
    if (this.handle) {
      const layerObj = this.createLayer(options);
      if (layerObj) {
        this.handle.addLayer(layerObj.layerVector);
        this.handle.addLayer(layerObj.layer);
        this.__layers.set(this.__Id(options.id), layerObj);
        const delay = options.delay ?? 300;
        const debounce = options.debounce ?? true;
        const debounceOption = options.debounceOption ?? {};
        if (options.isPopup) {
          // 采用普通的popup
          if (options.popupType == popupType.normal) {
            this.normalPopupIns!.addLayer(options);
            // if (isAdded) {
            //   this.__popupInsMap.set(options, this.normalPopupIns);
            // }

            if (options.eventType) {
              const eventOptions: EventOptions = {
                id: options.id,
                type: options.eventType,
                cb: this.narmalPopupCb(options),
                delay,
                debounce,
                debounceOption,
              };
              this.mapEventIns!.addEvent(eventOptions);
            }
          } else if (options.popupType == popupType.vnode) {
            this.vuePopupIns?.addLayer(options as VueNodeOptions);

            if (options.eventType) {
              const eventOptions: EventOptions = {
                id: options.id,
                type: options.eventType,
                cb: this.vNodePopupCb(options),
                delay,
                debounce,
                debounceOption,
              };
              this.mapEventIns!.addEvent(eventOptions);
            }
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

  public fitToView(options: StaticImageOptions) {
    if (this.olBaseHandle) {
      if (options.extent) {
        this.olBaseHandle.fitToExtent(options.extent, [32, 32, 32, 32]);
        return true;
      }
    } else {
      return false;
    }
  }

  public hasLayer(options: StaticImageOptions) {
    if (this.olBaseHandle && this.__layers.size) {
      return this.__layers.has(this.__Id(options.id));
    }
    return false;
  }

  public hasLayerByID(id: string) {
    if (this.olBaseHandle && this.__layers.size) {
      return this.__layers.has(this.__Id(id));
    }
    return false;
  }

  public removeLayer(options: StaticImageOptions) {
    return this.removeLayerByID(options.id);
  }

  public removeLayerByID(id: string) {
    if (this.handle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        this.handle.removeLayer(layerObj.layer);
        this.handle.removeLayer(layerObj.layerVector);
        this.__layers.delete(this.__Id(id));
        if (layerObj.options && layerObj.options.isPopup) {
          if (layerObj.options.popupType == popupType.normal) {
            this.normalPopupIns!.removeLayerByID(id);
            this.mapEventIns!.removeEventByID(id);
          } else if (layerObj.options.popupType == popupType.vnode) {
            this.vuePopupIns!.removeLayerByID(id);
            this.mapEventIns!.removeEventByID(id);
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

  public clearLayer() {
    if (this.handle && this.__layers.size) {
      // for (let [key, layerObj] of this.__layers.entries()) {
      // 	this.handle.removeLayer(layerObj.layer)
      // }
      this.__layers.forEach((layerObj: any) => {
        this.handle.removeLayer(layerObj.layer);
        this.handle.removeLayer(layerObj.layerVector);
        if (layerObj.options && layerObj.options.isPopup) {
          const id = layerObj.options.id;
          if (layerObj.options.popupType == popupType.normal) {
            this.normalPopupIns!.removeLayerByID(id);
            this.mapEventIns!.removeEventByID(id);
          } else if (layerObj.options.popupType == popupType.vnode) {
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

  public setLayerOpacity(options: StaticImageOptions, opacity: number) {
    return this.setLayerOpacityByID(options.id, opacity);
  }

  public setLayerOpacityByID(id: string, opacity: number) {
    if (this.olBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        layerObj.layer.setOpacity(opacity);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public showHiddenLayer(options: StaticImageOptions, isShow: boolean) {
    return this.showHiddenLayerByID(options.id, isShow);
  }

  public showHiddenLayerByID(id: string, isShow: boolean) {
    if (this.olBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        layerObj.layer.setVisible(isShow);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public getExtent(options: StaticImageOptions) {
    return this.getExtentById(options.id);
  }

  public getExtentById(id: string) {
    if (this.olBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        return layerObj.layer.getExtent();
      } else {
        return [];
      }
    } else {
      return [];
    }
  }

  public getCenter(options: StaticImageOptions) {
    return this.getCenterById(options.id);
  }

  public getCenterById(id: string) {
    if (this.olBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        const extent = layerObj.layer.getExtent();
        return getCenter(extent);
      } else {
        return [];
      }
    } else {
      return [];
    }
  }
}
