import { Map as olMap } from "ol";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Style } from "ol/style";
import { GeoJSON } from "ol/format";

import { nanoid } from "nanoid";

import OlBase from "./base";

import { transformExtentTo3857 } from "./olTools";

import type { GeojsonBasicOptions } from "./geojsonBasicLayersTypes";

import { createFill, createStroke, createCircle, createText, getColor, geojsonStyleFunction } from "./style";

import { isCustomizeFlag, customMeta } from "../geoConstant";

export default class OlBasicGeoJson {
  public olBaseHandle: OlBase | null = null;
  public handle: olMap | null = null;
  private __layers: any = null;
  private __layerIdPrefix = "GEOJSON_BASIC_";

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
    options: GeojsonBasicOptions = {
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
    if (!options.url || !options.id) {
      return null;
    }

    const id = this.__Id(options.id);
    let name = options.name ? options.name : nanoid(10);
    name = this.__Name(name);
    const source = new VectorSource({
      url: options.url,
      format: new GeoJSON(),
    });
    source.set("id", id);
    source.set("name", name);

    const zIndex = options.zIndex ? options.zIndex : this.olBaseHandle!.getCurrentzIndex();
    const layer = new VectorLayer({
      source: source,
      zIndex: zIndex,
    });

    layer.set("id", id);
    layer.set("name", name);

    const meta = {
      [isCustomizeFlag]: true,
      [customMeta]: options,
    };
    const styleFunction = this.toggleStyleFunction(options);
    source.on("addfeature", (result: any) => {
      result.feature.setProperties(meta);
      const style = styleFunction(result.feature);
      result.feature?.setStyle(style);
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

  public createLayerByData(options: GeojsonBasicOptions) {
    if (!options.data || !options.id) {
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

    const source = new VectorSource({
      features: GeoJsonReader.readFeatures(options.data),
    });

    source.set("id", id);
    source.set("name", name);
    source.forEachFeature((feature: any) => {
      feature.setProperties(meta);
    });

    const zIndex = options.zIndex ? options.zIndex : this.olBaseHandle!.getCurrentzIndex();
    const styleFunction = this.toggleStyleFunction(options) || geojsonStyleFunction;
    const layer = new VectorLayer({
      source: source,
      style: styleFunction,
      zIndex: zIndex,
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

  public addLayer(options: GeojsonBasicOptions) {
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
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public fitToView(options: GeojsonBasicOptions) {
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

  public hasLayer(options: GeojsonBasicOptions) {
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

  public removeLayer(options: GeojsonBasicOptions) {
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
        this.handle!.removeLayer(layerObj.layer);
      });
      this.__layers.clear();
      return true;
    } else {
      return false;
    }
  }

  public setLayerOpacity(options: GeojsonBasicOptions, opacity: number) {
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

  public showHiddenLayer(options: GeojsonBasicOptions, isShow: boolean) {
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
