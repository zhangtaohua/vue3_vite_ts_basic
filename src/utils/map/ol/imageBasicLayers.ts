import { Map as olMap } from "ol";
import StaticImage from "ol/source/ImageStatic";
import ImageLayer from "ol/layer/Image";
import { getCenter } from "ol/extent";

import { nanoid } from "nanoid";

import OlBase from "./base";
import type { StaticImageBasicOptions } from "./imageBasicLayersTypes";

import { transformExtentTo3857, getAngleOfNorthFromCoordinates, getEastRadiansFromRectCoords } from "./olTools";

import { getRectangleFromExtent, getExtentFromRectCoords } from "../geoCommon";
import { earthExtent, isCustomizeFlag, customMeta } from "../geoConstant";

export default class OlStaticImageBasicLayers {
  public olBaseHandle: OlBase | null = null;
  public handle: olMap | null = null;
  private __layers: any = null;
  private __layerIdPrefix = "IMAGE_BASIC_";

  constructor(mapBaseIns: OlBase) {
    this.olBaseHandle = mapBaseIns;
    this.handle = mapBaseIns.handle;
    this.__layers = new Map();
  }

  public destructor() {
    this.clearLayer();
    this.olBaseHandle = null;
    this.handle = null;
    this.__layers.clear();
    this.__layers = null;
  }

  private __Id(id: string) {
    return `${this.__layerIdPrefix}${id}`;
  }

  private __Name(name: string) {
    return `${this.__layerIdPrefix}${name}`;
  }

  public createLayer(
    options: StaticImageBasicOptions = {
      url: "",
      id: "",
      name: "",
      zIndex: 0,
      extent: earthExtent,
      wrapX: true,
      opacity: 1,
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

          let name = options.name ? options.name : nanoid(10);
          name = this.__Name(name);
          const id = this.__Id(options.id);
          const zIndex = options.zIndex ? options.zIndex : this.olBaseHandle!.getCurrentzIndex();

          const meta = {
            [isCustomizeFlag]: true,
            [customMeta]: options,
          };

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
                // console.log("imgRes", wrapImg, img.width, img.height);
                const canvasNew = document.createElement("canvas");
                const contextCva = canvasNew.getContext("2d");

                const diagonalLength = Math.sqrt(img.width * img.width + img.height * img.height);
                const width1 = Math.abs(diagonalLength * Math.cos(vectorOneAngle));
                const width2 = Math.abs(diagonalLength * Math.cos(vectorTwoAngle));
                const realWidth = width1 > width2 ? width1 : width2;

                const height1 = Math.abs(diagonalLength * Math.sin(vectorOneAngle));
                const height2 = Math.abs(diagonalLength * Math.sin(vectorTwoAngle));
                const realHeight = height1 > height2 ? height1 : height2;

                // console.log("wH", width1, width2, realWidth, height1, height2, realHeight);
                // 计算旋转后的画布大小
                canvasNew.width = realWidth > img.width ? Math.ceil(realWidth) : img.width;
                canvasNew.height = realHeight > img.height ? Math.ceil(realHeight) : img.height;

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
            zIndex: zIndex,
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

      const meta = {
        [isCustomizeFlag]: true,
        [customMeta]: options,
      };

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
        zIndex: zIndex,
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
      };
      return layerObj;
    }
  }

  public addLayer(options: StaticImageBasicOptions) {
    if (this.handle) {
      const layerObj = this.createLayer(options);
      if (layerObj) {
        this.handle.addLayer(layerObj.layer);
        this.__layers.set(this.__Id(options.id), layerObj);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public fitToView(options: StaticImageBasicOptions) {
    if (this.olBaseHandle) {
      if (options.extent) {
        this.olBaseHandle.fitToExtent(options.extent);
        return true;
      }
    } else {
      return false;
    }
  }

  public hasLayer(options: StaticImageBasicOptions) {
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

  public removeLayer(options: StaticImageBasicOptions) {
    return this.removeLayerByID(options.id);
  }

  public removeLayerByID(id: string) {
    if (this.handle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        this.handle.removeLayer(layerObj.layer);
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
    if (this.handle && this.__layers.size) {
      // for (let [key, layerObj] of this.__layers.entries()) {
      // 	this.handle.removeLayer(layerObj.layer)
      // }
      this.__layers.forEach((layerObj: any) => {
        this.handle.removeLayer(layerObj.layer);
      });
      this.__layers.clear();
      return true;
    } else {
      return false;
    }
  }

  public setLayerOpacity(options: StaticImageBasicOptions, opacity: number) {
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

  public showHiddenLayer(options: StaticImageBasicOptions, isShow: boolean) {
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

  public getExtent(options: StaticImageBasicOptions) {
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

  public getCenter(options: StaticImageBasicOptions) {
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
