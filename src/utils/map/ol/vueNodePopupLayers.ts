import { Map as olMap, Overlay } from "ol";
import { nanoid } from "nanoid";
import lodash from "lodash";
import { createApp } from "vue";

import OlBase from "./base";
import { VueNodeOptions } from "./vueNodePopupLayersTypes";

export default class OlVueNodePopup {
  public olBaseHandle: OlBase | null = null;
  public handle: olMap | null = null;
  public mapDomContainner: HTMLElement | null;

  private __layers: any = null;
  private __layerIdPrefix = "VUE_OVERLAY_";

  public __defaultTT = (name: string) => {
    return name;
  };

  constructor(mapBaseIns: OlBase) {
    this.olBaseHandle = mapBaseIns;
    this.handle = mapBaseIns.handle;
    this.mapDomContainner = this.handle.getTargetElement();
    this.__layers = new Map();
  }

  public destructor = () => {
    this.clearLayer();
    this.handle = null;
    this.olBaseHandle = null;
    this.__layers = null;
  };

  private __Id(id: string) {
    return `${this.__layerIdPrefix}${id}`;
  }

  private __Name(name: string) {
    return `${this.__layerIdPrefix}${name}`;
  }

  public createLayer(options: VueNodeOptions) {
    const vNodeData = options.vNodeData;
    const id = options.id;
    const vNode = options.vNode; // 这个就是 vue 文件
    const name = options.name ? options.name : nanoid(10);
    let wrapX = options.wrapX;
    if (lodash.isNull(wrapX) || lodash.isUndefined(wrapX)) {
      wrapX = true;
    }
    let $t = this.__defaultTT;
    if (options.$t) {
      $t = options.$t;
    }

    const overlayInstance = createApp(vNode, {
      id,
      name,
      vNodeData,
      wrapX,
      $t,
      destory: this.destructor,
    });

    const overlayDomContainner = document.createElement("div");
    // overlayDomContainner.className = 'ol_info_popup'

    const overlayInstanceReal = overlayInstance.mount(overlayDomContainner); //根据模板创建一个面板
    this.mapDomContainner?.appendChild(overlayDomContainner);

    const layer = new Overlay({
      element: overlayDomContainner,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });

    layer.set("id", this.__Id(options.id));
    layer.set("name", this.__Name(name));

    const position = options.position;

    const layerObj = {
      layer,
      position,
    };
    return layerObj;
  }

  public addLayer(options: VueNodeOptions) {
    if (this.handle) {
      const layerObj = this.createLayer(options);
      if (layerObj) {
        this.handle.addOverlay(layerObj.layer);
        this.showLayerById(options.id, options.position);
        this.__layers.set(this.__Id(options.id), layerObj);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public hasLayer(options: VueNodeOptions) {
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

  public removeLayer(options: VueNodeOptions) {
    return this.removeLayerByID(options.id);
  }

  public removeLayerByID(id: string) {
    if (this.handle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        this.handle.removeOverlay(layerObj.layer);
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
      // 	this.handle.removeOverlay(layerObj.layer)
      // }
      this.__layers.forEach((layerObj: any) => {
        this.handle.removeOverlay(layerObj.layer);
      });
      this.__layers.clear();
      return true;
    } else {
      return false;
    }
  }

  // need arrow funcion!!!
  public hiddenLayerByID = (id: string) => {
    if (this.olBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        layerObj.layer.setPosition(undefined);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  public showLayerById = (id: string, coordinate: Array<number>) => {
    if (this.olBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        layerObj.layer.setPosition(coordinate);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };
}
