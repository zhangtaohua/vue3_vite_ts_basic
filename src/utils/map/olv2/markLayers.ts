import { Map as olMap } from "ol";
import Feature from "ol/Feature";
import { Style, Stroke, Icon, Fill, Text } from "ol/style";
import Point from "ol/geom/Point";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { nanoid } from "nanoid";

import OlBase from "./base";
import { transformLongitudeLatitude } from "./olTools";
import type { MarkOptions } from "./markLayersTypes";

import { isCustomizeFlag, customMeta } from "../geoConstant";

export default class OlMarks {
  public olBaseHandle: OlBase | null = null;
  public handle: olMap | null = null;
  private __layers: any = null;
  private __layerIdPrefix = "MARK_";

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
    options: MarkOptions = {
      longitude: 0,
      latitude: 0,
      text: "",
      url: "",
      style: null,
      id: "",
      name: "",
      zIndex: 0,
      wrapX: true,
    },
  ) {
    const center = transformLongitudeLatitude([options.longitude, options.latitude]);
    const id = this.__Id(options.id);
    const name = options.name ? options.name : nanoid(10);

    const MarkOptions = {
      geometry: new Point(center),
      name: name,
      id: id,
      wrapX: options.wrapX,
    };
    const feature = new Feature(MarkOptions);

    let markStyle = options.style;
    if (!markStyle) {
      options.style = markStyle = new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: options.url,
          scale: 0.5,
        }),
        text: new Text({
          font: "bold 12px serif",
          text: options.text,
          offsetY: 10,
          padding: [3, 5, 3, 5],
          fill: new Fill({
            color: [255, 255, 255, 1],
          }),
          // stroke : new Stroke({
          // 	color: [255,255,0,1],
          // 	width: 2
          // }),
          backgroundFill: new Fill({
            color: [255, 12, 15, 1],
          }),
        }),
      });
    }
    feature.setStyle(markStyle);
    feature.setId(id);

    const meta = {
      [isCustomizeFlag]: true,
      [customMeta]: options,
    };
    feature.setProperties(meta);

    const source = new VectorSource({
      features: [feature],
      wrapX: options.wrapX,
    });
    source.setProperties(meta);

    const zIndex = options.zIndex ? options.zIndex : this.olBaseHandle!.getCurrentzIndex();
    const layer = new VectorLayer({
      source: source,
      zIndex: zIndex,
      declutter: true,
    });
    layer.setProperties(meta);

    layer.set("id", this.__Id(options.id));
    layer.set("name", this.__Name(name));
    const layerObj = {
      options,
      MarkOptions,
      feature,
      source,
      layer,
    };
    return layerObj;
  }

  public addLayer(options: MarkOptions) {
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

  public fitToView(options: MarkOptions) {
    if (this.olBaseHandle) {
      this.olBaseHandle.flyToPosition(options.longitude, options.latitude);
      return true;
    } else {
      return false;
    }
  }

  public hasLayer(options: MarkOptions) {
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

  public removeLayer(options: MarkOptions) {
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

  public setLayerOpacity(options: MarkOptions, opacity: number) {
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

  public showHiddenLayer(options: MarkOptions, isShow: boolean) {
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
