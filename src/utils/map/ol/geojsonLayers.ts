import { Map as olMap } from "ol";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Style } from "ol/style";
import { GeoJSON } from "ol/format";

import { nanoid } from "nanoid";

import OlBase from "./base";
import { transformExtentTo3857 } from "./olTools";
import { earthExtent } from "../geoConstant";

import { GeojsonOptions } from "./typeinfo";

import { createFill, createStroke, createCircle, createText, createGeoPoint, geojsonStyleFunction } from "./style";

export default class OpenLayersGeoJson {
  public olBaseHandle: OlBase | null = null;
  public handle: olMap | null = null;
  private __layers: any = null;
  private __layerIdPrefix = "GEOJSON_";

  constructor(mapBaseIns: OlBase) {
    this.olBaseHandle = mapBaseIns;
    this.handle = mapBaseIns.handle;
    this.__layers = new Map();
  }

  public destructor() {
    this.clearLayer();
    this.olBaseHandle = null;
    this.handle = null;
    this.__layers = null;
  }

  private __Id(id: string) {
    return `${this.__layerIdPrefix}${id}`;
  }

  private __Name(name: string) {
    return `${this.__layerIdPrefix}${name}`;
  }

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
    if (!options.url || !options.id) {
      return null;
    }

    const source = new VectorSource({
      url: options.url,
      format: new GeoJSON(),
    });

    const zIndex = options.zIndex ? options.zIndex : this.olBaseHandle!.getCurrentzIndex();
    const layer = new VectorLayer({
      source: source,
      zIndex: zIndex,
    });

    const name = options.name ? options.name : nanoid(10);
    layer.set("id", this.__Id(options.id));
    layer.set("name", this.__Name(name));

    source.on("addfeature", (result) => {
      let style = null;
      if (options.styleFunction) {
        style = options.styleFunction(result.feature);
      } else {
        const fillColor = result.feature?.get("fillColor") ?? "rgba(20 ,20, 20, 0.2)";
        const color = result.feature?.get("color") ?? "rgba(20 ,20, 20, 1)";
        if (options.style) {
          options.style.fillColor = fillColor;
          options.style.color = color;
        } else {
          options.style = {};
          options.style.fillColor = fillColor;
          options.style.color = color;
          options.style.radius = 12;
        }
        // !!! 这里目前一定有错，后期确定了一定要修改
        style = new Style({
          fill: createFill(options.style),
          stroke: createStroke(options.style),
          image: createCircle(options.style),
          text: createText(options.style),
        });
      }
      result.feature?.setStyle(style);
      const typeStr = options.type ?? "RJ_Geometry";
      result.feature?.set("type", typeStr);
      result.feature?.set("custom", true);
      // console.log(result.feature)
    });

    source.on("featuresloadend", (result) => {
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

  toggleStyleFunction = (feature: any) => {
    let fillColor = feature.get("fillColor") ?? "rgba(24, 144, 255, .2)";
    let color = feature.get("color") ?? "rgba(24, 144, 255, 1)";
    let name = feature?.get("name") ?? "";
    const isShow = feature?.get("isRjRjRjUseFeatues") ?? true;
    if (!isShow) {
      fillColor = "rgba(255 ,0, 0, 0)";
      color = "rgba(255 ,0, 0, 0)";
      name = "";
    }
    const optionStyle = {
      fillColor: fillColor,
      color: color,
      width: 2,
      radius: 12,
      text: name,
    };

    const textOptionStyle = {
      fillColor: "rgba(255 ,255, 255, 0.2)",
      color: "rgba(20 ,20, 20, 1)",
      width: 2,
      text: name,
    };
    return new Style({
      fill: createFill(optionStyle),
      stroke: createStroke(optionStyle),
      image: createCircle(optionStyle),
      text: createText(textOptionStyle),
    });
  };

  public createLayerByData(options: GeojsonOptions) {
    if (!options.data || !options.id) {
      return null;
    }
    // if (!options.data.features) {
    //   return null;
    // }
    // [left, bottom, right, top]
    // let extent = earthExtent;
    // if (
    //   options.extent &&
    //   options.extent.length &&
    //   options.extent.length === 4
    // ) {
    //   extent = options.extent;
    // }
    // extent = transformExtentTo3857(extent);

    const GeoJsonReader = new GeoJSON({
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857",
    });

    const source = new VectorSource({
      features: GeoJsonReader.readFeatures(options.data),
    });

    const zIndex = options.zIndex ? options.zIndex : this.olBaseHandle!.getCurrentzIndex();

    const layer = new VectorLayer({
      source: source,
      style: this.toggleStyleFunction,
      // style: geojsonStyleFunction,
      zIndex: zIndex,
    });

    layer.setProperties({
      customize: true,
      customMeta: options,
    });

    const name = options.name ? options.name : nanoid(10);
    layer.set("id", this.__Id(options.id));
    layer.set("name", this.__Name(name));

    const layerObj = {
      options,
      source,
      layer,
    };
    return layerObj;
  }

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

  public removeLayer(options: GeojsonOptions) {
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
      this.__layers.forEach((layerObj: any, key: any) => {
        this.handle!.removeLayer(layerObj.layer);
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
