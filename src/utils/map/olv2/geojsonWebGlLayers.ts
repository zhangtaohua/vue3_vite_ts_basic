import { Map as olMap } from "ol";
import VectorSource from "ol/source/Vector";
import { getCenter } from "ol/extent";
import { Style } from "ol/style";
import { GeoJSON } from "ol/format";
import WebGLPointsLayer from "ol/layer/WebGLPoints";
// import WebGLPointsLayer from "ol/renderer/webgl/PointsLayer";

import { nanoid } from "nanoid";

import OlBase from "./base";

import OpenLayersMapEvent from "./mapEvent";
import type { EventOptions } from "./mapEventTypes";

import OpenLayerVueNodePopup from "./vueNodePopupLayers";
import type { VueNodeOptions } from "./vueNodePopupLayersTypes";

import OpenLayersPopup from "./popupLayers";

import { transformExtentTo3857 } from "./olTools";

import type { GeojsonOptions } from "./geojsonLayersTypes";

import {
  createFill,
  createStroke,
  createCircle,
  createText,
  getColor,
  createGeoPoint,
  geojsonStyleFunction,
} from "./style";

import { earthExtent, popupType, isCustomizeFlag, customMeta } from "../geoConstant";

import { mapEventType } from "./olConstant";

export default class OlGeojsonLayers {
  public olBaseHandle: OlBase | null = null;
  public handle: olMap | null = null;

  public vuePopupIns: OpenLayerVueNodePopup | null = null;
  public normalPopupIns: OpenLayersPopup | null = null;
  public mapEventIns: OpenLayersMapEvent | null = null;

  private __layers: any = null;
  private __layerIdPrefix = "GEOJSON_WEBGL_";

  public animateId: any = null;

  constructor(mapBaseIns: OlBase) {
    this.olBaseHandle = mapBaseIns;
    this.handle = mapBaseIns.handle;
    this.__layers = new Map();

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
  }

  private __Id(id: string) {
    return `${this.__layerIdPrefix}${id}`;
  }

  private __Name(name: string) {
    return `${this.__layerIdPrefix}${name}`;
  }

  public toggleStyleFunction = (options: any) => {
    return (feature: any) => {
      let fillColor = "rgba(20 ,20, 20, 0.2)";
      let color = "rgba(20 ,20, 20, 1)";
      let width = 2;
      let fontColor = "rgba(20 ,20, 20, 1)";
      let fontFillColor = "rgba(255 ,255, 255, 0.2)";
      let radius = 12;
      let style = null;
      const metadata = feature?.get(customMeta);
      const orgStyle = feature?.get("style");
      if (orgStyle) {
        let fillColorTemp = orgStyle["fillColor"];
        if (fillColorTemp) {
          fillColorTemp = getColor(fillColorTemp);
          fillColor = fillColorTemp;
        }

        let colorTemp = orgStyle["color"];
        if (colorTemp) {
          colorTemp = getColor(colorTemp);
          color = colorTemp;
        }

        let widthTemp = orgStyle["width"];
        if (widthTemp) {
          widthTemp = parseInt(widthTemp);
          if (isNaN(widthTemp)) {
            width = 2;
          } else {
            width = widthTemp;
          }
        }

        let radiusTemp = orgStyle["radius"];
        if (radiusTemp) {
          radiusTemp = parseInt(radiusTemp);
          if (isNaN(radiusTemp)) {
            radius = 2;
          } else {
            radius = radiusTemp;
          }
        }

        let fontFillColorTemp = orgStyle["fontFillColor"];
        if (fontFillColorTemp) {
          fontFillColorTemp = getColor(fontFillColorTemp);
          fontFillColor = fontFillColorTemp;
        }

        let fontColorTemp = orgStyle["fontColor"];
        if (fontColorTemp) {
          fontColorTemp = getColor(fontColorTemp);
          fontColor = fontColorTemp;
        }
      } else if (metadata) {
        const metaStyle = metadata["style"];
        const metaStyleFunc = metadata["styleFunction"];
        if (metaStyle) {
          let fillColorTemp = metaStyle["fillColor"];
          if (fillColorTemp) {
            fillColorTemp = getColor(fillColorTemp);
            fillColor = fillColorTemp;
          }

          let colorTemp = metaStyle["color"];
          if (colorTemp) {
            colorTemp = getColor(colorTemp);
            color = colorTemp;
          }

          let widthTemp = metaStyle["width"];
          if (widthTemp) {
            widthTemp = parseInt(widthTemp);
            if (isNaN(widthTemp)) {
              width = 2;
            } else {
              width = widthTemp;
            }
          }

          let radiusTemp = metaStyle["radius"];
          if (radiusTemp) {
            radiusTemp = parseInt(radiusTemp);
            if (isNaN(radiusTemp)) {
              radius = 2;
            } else {
              radius = radiusTemp;
            }
          }

          let fontFillColorTemp = metaStyle["fontFillColor"];
          if (fontFillColorTemp) {
            fontFillColorTemp = getColor(fontFillColorTemp);
            fontFillColor = fontFillColorTemp;
          }

          let fontColorTemp = metaStyle["fontColor"];
          if (fontColorTemp) {
            fontColorTemp = getColor(fontColorTemp);
            fontColor = fontColorTemp;
          }
        } else if (metaStyleFunc) {
          style = metaStyleFunc(feature);
          return style;
        }
      }

      const name = feature?.get("name") ?? "";
      const optionStyle = {
        fillColor: fillColor,
        color: color,
        width: width,
        radius: radius,
        text: name,
      };

      const textOptionStyle = {
        fillColor: fontFillColor,
        color: fontColor,
        width: width,
        text: name,
      };
      return new Style({
        fill: createFill(optionStyle),
        stroke: createStroke(optionStyle),
        image: createCircle(optionStyle),
        text: createText(textOptionStyle),
      });
    };
  };

  public createLayerByUrl(
    options: GeojsonOptions = {
      url: "",
      id: "",
      name: "",
      zIndex: 0,
      wrapX: true,
      style: {
        fillColor: "rgba(20 ,20, 20, 0.2)",
        color: "rgba(20 ,20, 20, 1)",
      },
    },
  ) {
    if (!options.url || !options.id || !options.style) {
      return null;
    }

    const id = this.__Id(options.id);
    let name = options.name ? options.name : nanoid(10);
    name = this.__Name(name);

    let wrapX = options.wrapX;
    if (wrapX == undefined) {
      wrapX = true;
    }

    const source = new VectorSource({
      url: options.url,
      format: new GeoJSON(),
      wrapX: wrapX,
    });
    source.set("id", id);
    source.set("name", name);

    const zIndex = options.zIndex ? options.zIndex : this.olBaseHandle!.getCurrentzIndex();

    const layer = new WebGLPointsLayer({
      source: source,
      style: options.style,
      disableHitDetection: false,
      zIndex,
    });

    layer.set("id", id);
    layer.set("name", name);

    const meta = {
      [isCustomizeFlag]: true,
      [customMeta]: options,
    };

    source.on("addfeature", (result: any) => {
      result.feature.setProperties(meta);
    });

    source.on("featuresloadend", (result: any) => {
      // this.olBaseHandle!.fitToExtent(source.getExtent(), [0, 0, 0, 0], true)
      this.olBaseHandle!.fitToLayerSourceByID(this.__Id(options.id));
    });

    const layerObj = {
      options,
      source,
      layer,
    };
    return layerObj;
  }

  public createLayerByData(options: GeojsonOptions) {
    if (!options.data || !options.id || !options.style) {
      return null;
    }
    const id = this.__Id(options.id);
    let name = options.name ? options.name : nanoid(10);
    name = this.__Name(name);
    const meta = {
      [isCustomizeFlag]: true,
      [customMeta]: options,
    };

    const GeoJsonReader = new GeoJSON({
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857",
    });

    let wrapX = options.wrapX;
    if (wrapX == undefined) {
      wrapX = true;
    }

    const source = new VectorSource({
      features: GeoJsonReader.readFeatures(options.data),
      wrapX: wrapX,
    });

    source.set("id", id);
    source.set("name", name);
    source.forEachFeature((feature: any) => {
      feature.setProperties(meta);
    });

    const zIndex = options.zIndex ? options.zIndex : this.olBaseHandle!.getCurrentzIndex();

    const layer = new WebGLPointsLayer({
      source: source,
      style: options.style,
      disableHitDetection: false,
      zIndex,
    });

    layer.setProperties(meta);

    layer.set("id", id);
    layer.set("name", name);

    const layerObj = {
      options,
      source,
      layer,
    };
    return layerObj;
  }

  public narmalPopupCb = (options: GeojsonOptions) => {
    return (event: any) => {
      console.log(`Nor: ${options.id}_CB`);
      let pixel = event.pixel;
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
        let position = event.coordinate;
        if (options.popupIsCenter) {
          const featureExtent = feature.getGeometry().getExtent();
          position = getCenter(featureExtent);
        }
        this.normalPopupIns?.showPopupByID(options.id, position, options.htmlString);
      } else {
        if (options.eventType == mapEventType.pointermove) {
          this.normalPopupIns?.hiddenPopupByID(options.id);
        }
      }
    };
  };

  public vNodePopupCb = (options: GeojsonOptions) => {
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
        let position = event.coordinate;
        if (options.popupIsCenter) {
          const featureExtent = feature.getGeometry().getExtent();
          position = getCenter(featureExtent);
        }
        this.vuePopupIns?.showPopupByID(options.id, position);
      } else {
        if (options.eventType == mapEventType.pointermove) {
          this.vuePopupIns?.hiddenPopupByID(options.id);
        }
      }
    };
  };

  public animate = () => {
    console.log("N");
    this.handle.render();
    this.animateId = window.requestAnimationFrame(this.animate);
  };

  public stopAnimate = () => {
    if (this.animateId) {
      window.cancelAnimationFrame(this.animateId);
      this.animateId = null;
    }
  };

  public addLayer(options: GeojsonOptions) {
    if (this.handle) {
      let layerObj: any = null;
      if (options.url) {
        layerObj = this.createLayerByUrl(options);
      } else if (options.data) {
        layerObj = this.createLayerByData(options);
      } else {
        return false;
      }
      if (layerObj) {
        this.handle.addLayer(layerObj.layer);
        this.__layers.set(this.__Id(options.id), layerObj);
        this.animate();
        this.olBaseHandle?.flyToPositionAndZoom(0, 0, 3);

        const delay = options.delay ?? 300;
        const debounce = options.debounce ?? true;
        const debounceOption = options.debounceOption ?? {};
        if (options.isPopup) {
          // 采用普通的popup
          if (options.popupType == popupType.normal) {
            this.normalPopupIns!.addLayer(options);

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

  public fitToView(options: GeojsonOptions) {
    if (this.olBaseHandle) {
      if (options.extent) {
        this.olBaseHandle.fitToExtent(options.extent);
        return true;
      } else {
        this.olBaseHandle.fitToLayerSourceByID(this.__Id(options.id));
        return true;
      }
    } else {
      return false;
    }
  }

  public hasLayer(options: GeojsonOptions) {
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

  public clearFeatures(options: GeojsonOptions) {
    this.clearFeaturesById(options.id);
  }

  public clearFeaturesById(id: string) {
    if (this.handle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        layerObj.source.clear();
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public updateFeaturesData(options: GeojsonOptions) {
    if (!options.data || !options.id) {
      return null;
    }
    this.updateFeaturesDataById(options.id, options.data, options);
  }

  // 没有测试过，暂时不要用
  public updateFeaturesDataById(id: string, geojsonData: any, options: any) {
    if (this.handle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        layerObj.source.clear();
        const GeoJsonReader = new GeoJSON({
          dataProjection: "EPSG:4326",
          featureProjection: "EPSG:3857",
        });
        const features = GeoJsonReader.readFeatures(geojsonData);
        layerObj.source.addFeatures(features);
        const meta = {
          [isCustomizeFlag]: true,
          [customMeta]: options,
        };

        layerObj.source.forEachFeature((feature: any) => {
          feature.setProperties(meta);
        });
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public updateStyle(options: GeojsonOptions) {
    if (!options.style || !options.id) {
      return null;
    }
    this.updateStyleById(options.id, options.style, options);
  }

  public updateStyleById(id: string, newStyle: any, options: any) {
    if (this.handle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        const previousLayer = layerObj.layer;

        const newPointsLayer = new WebGLPointsLayer({
          source: layerObj.source,
          style: newStyle,
          disableHitDetection: true,
        });

        const meta = {
          [isCustomizeFlag]: true,
          [customMeta]: options,
        };

        const id2 = this.__Id(options.id);
        let name = options.name ? options.name : nanoid(10);
        name = this.__Name(name);

        newPointsLayer.setProperties(meta);
        newPointsLayer.set("id", id2);
        newPointsLayer.set("name", name);

        layerObj.layer = newPointsLayer;
        this.handle.addLayer(layerObj.layer);

        if (previousLayer) {
          this.handle.removeLayer(previousLayer);
          previousLayer.dispose();
        }

        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public removeLayer(options: GeojsonOptions) {
    return this.removeLayerByID(options.id);
  }

  public removeLayerByID(id: string) {
    if (this.handle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        this.handle.removeLayer(layerObj.layer);
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
        this.handle!.removeLayer(layerObj.layer);

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

  public setLayerOpacity(options: GeojsonOptions, opacity: number) {
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

  public showHiddenLayer(options: GeojsonOptions, isShow: boolean) {
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
}
