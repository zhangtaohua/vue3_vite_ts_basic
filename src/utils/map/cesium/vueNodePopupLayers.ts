import * as Cesium from "cesium";
import { nanoid } from "nanoid";
import lodash from "lodash";
import { createApp } from "vue";

import CesiumBase from "./base";
import { VueNodeOptions } from "./vueNodePopupLayersTypes";

export default class CsVueNodePopup {
  public csBaseHandle: CesiumBase | null = null;
  public viewer: any = null;
  public mapDomContainner: HTMLElement | null;

  private __layers: any = null;
  private __DomMap: any = null;
  private __layerIdPrefix = "CS_VUE_OVERLAY_";

  public __defaultTT = (name: string) => {
    return name;
  };

  constructor(mapBaseIns: CesiumBase) {
    this.csBaseHandle = mapBaseIns;
    this.viewer = mapBaseIns.viewer;
    this.mapDomContainner = mapBaseIns.viewer.cesiumWidget.container;

    this.__layers = new Map();
    this.__DomMap = new Map();
  }

  public destructor() {
    this.clearLayer();
    this.viewer = null;
    this.mapDomContainner = null;
    this.csBaseHandle = null;

    this.__layers = null;
    this.__DomMap = null;
  }

  private __Id(id: string) {
    return `${this.__layerIdPrefix}${id}`;
  }

  private __Name(name: string) {
    return `${this.__layerIdPrefix}${name}`;
  }

  //场景渲染事件 实时更新窗口的位置 使其与笛卡尔坐标一致
  public postRender(vDom: any, position: any, heightOrg: any) {
    return () => {
      if (!vDom || !vDom.style) return;
      const canvasHeight = this.viewer.scene.canvas.height;
      const windowPosition = new Cesium.Cartesian2();
      Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, position, windowPosition);
      vDom.style.bottom = canvasHeight - windowPosition.y + heightOrg + "px";
      const elWidth = vDom.offsetWidth;
      vDom.style.left = windowPosition.x - elWidth / 2 + "px";

      const camerPosition = this.viewer.camera.position;
      let height = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(camerPosition).height;
      height += this.viewer.scene.globe.ellipsoid.maximumRadius;
      if (
        !(Cesium.Cartesian3.distance(camerPosition, position) > height) &&
        this.viewer.camera.positionCartographic.height < 50000000
      ) {
        vDom.style.display = "block";
      } else {
        vDom.style.display = "none";
      }
    };
  }

  //添加场景事件
  public addPostRender(postRenderFunc: any) {
    this.viewer.scene.postRender.addEventListener(postRenderFunc, this);
  }

  public removePostRender(postRenderFunc: any) {
    this.viewer.scene.postRender.removeEventListener(postRenderFunc, this);
  }

  public removeParentDom(id: string) {
    const oldParentDom = this.__DomMap.get(id);
    if (oldParentDom) {
      const oldGrandFather = oldParentDom?.parentNode;
      oldGrandFather?.removeChild(oldParentDom);
      this.__DomMap.delete(id);
    }
  }

  public createVueDom = (options: VueNodeOptions) => {
    const vNodeData = options.vNodeData;
    const id = options.id;
    const vNode = options.vNode; // 这个就是 vue 文件
    const name = options.name ? options.name : nanoid(10);

    let customT = this.__defaultTT;
    if (options.customT) {
      customT = options.customT;
    }

    const closeFunc = () => {
      this.hiddenPopupByID(options.id);
      console.log("closeFunc", options.id);
    };

    const overlayInstance = createApp(vNode, {
      ...options,
      id: `${id}_inner`,
      name,
      vNodeData,
      customT,
      destory: closeFunc,
    });

    const parentDom = document.createElement("div");
    parentDom.id = id;
    // 先删除旧的dom
    this.removeParentDom(id);

    const overlayInstanceReal = overlayInstance.mount(parentDom); //根据模板创建一个面板
    const vDom = overlayInstanceReal.$el;
    this.mapDomContainner!.appendChild(parentDom);
    this.__DomMap.set(id, parentDom);

    return {
      parentDom,
      vDom,
      name,
    };
  };

  public createLayer(options: VueNodeOptions) {
    const { parentDom, vDom, name } = this.createVueDom(options);

    let positionOrg = [0, 0, 0];
    if (options.position) {
      positionOrg = options.position;
    }
    const position = Cesium.Cartesian3.fromDegrees(positionOrg[0], positionOrg[1], positionOrg[2]);
    const height = positionOrg[2];
    const postRenderFunc = this.postRender(vDom, position, height);

    const layerObj = {
      parentDom,
      vDom,
      name,
      postRenderFunc,
    };
    return layerObj;
  }

  public addLayer = (options: VueNodeOptions) => {
    if (this.csBaseHandle) {
      const layerObj = this.createLayer(options);
      if (layerObj) {
        this.__layers.set(this.__Id(options.id), layerObj);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  public updateLayer = (options: VueNodeOptions) => {
    if (this.csBaseHandle) {
      this.removeLayerByID(options.id);
      this.addLayer(options);
    }
  };

  public hasLayer(options: VueNodeOptions) {
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

  public removeLayer(options: VueNodeOptions) {
    return this.removeLayerByID(options.id);
  }

  public removeLayerByID = (id: string) => {
    if (this.csBaseHandle) {
      let layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        this.removePostRender(layerObj.postRenderFunc);
        this.removeParentDom(id);
        layerObj = null;
        this.__layers.delete(this.__Id(id));
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  public clearLayer() {
    if (this.csBaseHandle && this.__layers.size) {
      this.__layers.forEach((layerObj: any) => {
        this.removePostRender(layerObj.postRenderFunc);
      });
      this.__layers.clear();
      this.__DomMap.clear();
      return true;
    } else {
      return false;
    }
  }

  public showPopup = (options: VueNodeOptions) => {
    return this.showPopupByID(options.id);
  };

  public showPopupByID = (id: string) => {
    if (this.csBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        this.addPostRender(layerObj.postRenderFunc);
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

  // need arrow funcion!!!
  public hiddenPopupByID = (id: string) => {
    if (this.csBaseHandle) {
      const layerObj = this.__layers.get(this.__Id(id));
      if (layerObj) {
        layerObj.vDom.style.display = "none";
        this.removePostRender(layerObj.postRenderFunc);
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };
}
