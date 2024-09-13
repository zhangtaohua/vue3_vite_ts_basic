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
  private __DomMap: any = null;
  private __layerIdPrefix = "VUE_OVERLAY_";

  public __defaultTT = (name: string) => {
    return name;
  };

  constructor(mapBaseIns: OlBase) {
    this.olBaseHandle = mapBaseIns;
    this.handle = mapBaseIns.handle;
    this.mapDomContainner = this.handle.getTargetElement();
    this.__layers = new Map();
    this.__DomMap = new Map();
  }

  public destructor() {
    this.clearLayer();
    this.handle = null;
    this.olBaseHandle = null;
    this.__layers = null;
    this.__DomMap = null;
  }

  private __Id(id: string) {
    return `${this.__layerIdPrefix}${id}`;
  }

  private __Name(name: string) {
    return `${this.__layerIdPrefix}${name}`;
  }

  public createVueDom = (options: VueNodeOptions) => {
    const vNodeData = options.vNodeData;
    const id = options.id;
    const vNode = options.vNode; // 这个就是 vue 文件
    const name = options.name ? options.name : nanoid(10);
    let wrapX = options.wrapX;
    if (lodash.isNull(wrapX) || lodash.isUndefined(wrapX)) {
      wrapX = true;
    }
    let customT = this.__defaultTT;
    if (options.customT) {
      customT = options.customT;
    }

    const closeFunc = () => {
      this.hiddenPopupByID(options.id);
      // console.log("closeFunc", options.id);
    };

    const overlayInstance = createApp(vNode, {
      ...options,
      id: `${id}_inner`,
      name,
      vNodeData,
      wrapX,
      customT,
      destory: closeFunc,
    });

    const overlayDomContainner = document.createElement("div");
    overlayDomContainner.id = id;
    // 先删除旧的dom
    const oldDom = this.__DomMap.get(id);
    if (oldDom) {
      // 这是错的
      // this.mapDomContainner?.removeChild(oldDom);
      // 这可以
      const oldParen = oldDom?.parentNode;
      oldParen?.removeChild(oldDom);
      this.__DomMap.delete(id);
    }

    const overlayInstanceReal = overlayInstance.mount(overlayDomContainner); //根据模板创建一个面板
    this.mapDomContainner?.appendChild(overlayDomContainner);
    this.__DomMap.set(id, overlayDomContainner);

    return {
      overlayDomContainner,
      name,
    };
  };

  public createLayer(options: VueNodeOptions) {
    const { overlayDomContainner, name } = this.createVueDom(options);

    const layer = new Overlay({
      element: overlayDomContainner,
      autoPan: true,
    });

    layer.set("id", this.__Id(options.id));
    layer.set("name", this.__Name(name));

    const layerObj = {
      layer,
    };
    return layerObj;
  }

  public addLayer(options: VueNodeOptions) {
    if (this.handle) {
      const layerObj = this.createLayer(options);
      if (layerObj) {
        this.handle.addOverlay(layerObj.layer);
        this.__layers.set(this.__Id(options.id), layerObj);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public updateLayer = (options: VueNodeOptions) => {
    if (this.handle) {
      const layerObj = this.__layers.get(this.__Id(options.id));
      if (layerObj) {
        const { overlayDomContainner } = this.createVueDom(options);
        layerObj.layer.setElement(overlayDomContainner);
      }
    }
  };

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

  public showPopup = (options: VueNodeOptions, coordinate: Array<number>) => {
    return this.showPopupByID(options.id, coordinate);
  };

  public showPopupByID = (id: string, coordinate: Array<number>) => {
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

  public hiddenPopup = (options: VueNodeOptions) => {
    return this.hiddenPopupByID(options.id);
  };

  public hiddenPopupAll() {
    if (this.handle && this.__layers.size) {
      this.__layers.forEach((layerObj: any) => {
        layerObj.layer.setPosition(undefined);
      });
      return true;
    } else {
      return false;
    }
  }

  // need arrow funcion!!!
  public hiddenPopupByID = (id: string) => {
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
}
