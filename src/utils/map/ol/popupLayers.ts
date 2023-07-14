import { Map as olMap, Overlay } from "ol";

import OlBase from "./base";

import type { PopupOption } from "./popupLayersTypes";

export default class OpenLayersPopup {
  public olBaseHandle: OlBase | null = null;
  public handle: olMap | null = null;
  public mapDomContainner: HTMLElement | null;

  private __layers: any = null;
  private __layerIdPrefix = "POPUP_";

  constructor(mapBaseIns: OlBase) {
    this.olBaseHandle = mapBaseIns;
    this.handle = mapBaseIns.handle;
    this.mapDomContainner = this.handle.getTargetElement();

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

  private __IdDom(id: string) {
    return `${this.__layerIdPrefix}${id}_dom`;
  }

  public createLayer(
    options: PopupOption = {
      id: "",
      hasClose: true,
      duration: 250,
    },
  ) {
    if (!options.id) {
      return null;
    }

    const overlayDomContainner = document.createElement("div");
    overlayDomContainner.className = "ol_popup_wrapper";
    overlayDomContainner.id = this.__IdDom(options.id);

    let overlayDomCloser: any = null;
    if (options.hasClose) {
      overlayDomCloser = document.createElement("div");
      overlayDomCloser.className = "ol_popup_closer";
      // overlayDomCloser.innertext = 'x'
      overlayDomCloser.appendChild(document.createTextNode("x"));
      overlayDomContainner.appendChild(overlayDomCloser);
    }

    const overlayDomContent = document.createElement("div");
    overlayDomContent.className = "col_nw_fs_center ol_popup_content";
    overlayDomContainner.appendChild(overlayDomContent);

    this.mapDomContainner?.appendChild(overlayDomContainner);

    const openLayerOverlay = new Overlay({
      id: this.__Id(options.id),
      element: overlayDomContainner,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    });

    let closeFunc = () => {};
    if (options.hasClose) {
      closeFunc = () => {
        openLayerOverlay.setPosition(undefined);
        overlayDomCloser.blur();
        console.log("closeFunc", this.__Id(options.id));
      };
      overlayDomCloser?.addEventListener("click", closeFunc, false);
    }

    const layerObj = {
      options,
      overlayDom: overlayDomContainner,
      overlayCloeseDom: overlayDomCloser,
      overlayCtxDom: overlayDomContent,
      closeFunc: closeFunc,
      overlay: openLayerOverlay,
    };
    return layerObj;
  }

  public addLayer(options: PopupOption) {
    if (this.handle) {
      const layerObj = this.createLayer(options);
      if (layerObj) {
        this.handle.addOverlay(layerObj.overlay);
        this.__layers.set(this.__Id(options.id), layerObj);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public hasLayer(options: PopupOption) {
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

  public removeLayer(options: PopupOption) {
    return this.removeLayerByID(options.id);
  }

  public removeLayerByID(id: string) {
    if (this.handle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        // 移除关闭监听事件
        if (layerObj.overlayCloeseDom) {
          layerObj.overlayCloeseDom.removeEventListener("click", layerObj.closeFunc, false);
        }

        layerObj.overlay.setPosition(undefined);
        this.handle.removeOverlay(layerObj.overlay);

        // 以下有错误 测试用的不用在意
        // let needRemoveDom = document.getElementById(this.__IdDom(id))
        // this.mapDomContainner?.removeChild(layerObj.overlayDom)
        // this.mapDomContainner?.removeChild(needRemoveDom)
        // layerObj.overlayDom = null;
        // layerObj.overlayCloeseDom = null;
        // layerObj.overlayCtxDom = null;
        // layerObj.closeFunc = null;
        // layerObj.overlay = null;

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
        // 移除关闭监听事件
        if (layerObj.overlayCloeseDom) {
          layerObj.overlayCloeseDom.removeEventListener("click", layerObj.closeFunc, false);
        }

        this.handle.removeOverlay(layerObj.overlay);
      });
      this.__layers.clear();
      return true;
    } else {
      return false;
    }
  }

  public showPopup(options: PopupOption, coordinate: any, htmlStr: any) {
    return this.showPopupByID(options.id, coordinate, htmlStr);
  }

  public showPopupByID(id: string, coordinate: any, htmlStr: any) {
    if (this.olBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        layerObj.overlayCtxDom.innerHTML = htmlStr;
        layerObj.overlay.setPosition(coordinate);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public hiddenPopup(options: PopupOption) {
    return this.hiddenPopupByID(options.id);
  }

  public hiddenPopupByID(id: string) {
    if (this.olBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        layerObj.overlay.setPosition(undefined);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
