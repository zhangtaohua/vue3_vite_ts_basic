<template>
  <div id="cesium_container" class="wh_100p_100p"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

import CsMapHelper from "./modelExample";
import { cesiumViewMode } from "@/utils/map/cesium/csConstant";

import negx_left from "@/assets/images/cesium/negx_left.png";
import posx_right from "@/assets/images/cesium/posx_right.png";
import negy_bottom from "@/assets/images/cesium/negy_bottom.png";
import posy_top from "@/assets/images/cesium/posy_top.png";
import negz_front from "@/assets/images/cesium/negz_front.png";
import posz_back from "@/assets/images/cesium/posz_back.png";

import GUI from "lil-gui";

import pexels1 from "@/assets/images/test/pexels1.jpeg";
import pexels2 from "@/assets/images/test/pexels2.jpeg";
import catImg from "@/assets/images/test/cat.jpg";

import staticImagePopup from "../ol/components/staticImagePopup.vue";
import staticImagePopup2 from "../ol/components/staticImagePopup2.vue";

import { popupType } from "@/utils/map/geoConstant";
import * as Cesium from "cesium";
import { screenEventType } from "@/utils/map/cesium/csConstant";
import { nanoid } from "nanoid";

import {
  gaodeMap,
  googleImgUrlMap,
  googleVecUrlMap,
  googleEarthMap,
  bingMap,
  bingLightMap,
  mapboxBasic,
  mapboxAllBlue,
  osm,
  osmStamen,
  tiandituZh,
  tiandituZhUrl,
  tiandituEn,
} from "./MapConst";

let GUIIns: GUI | null = null;

const mapContrl = {
  bgLayer: gaodeMap,
  allModel: true,
  model1: true,
  model2: true,
  model3: true,
  model4: true,
  model5: true,
  model6: true,
  model7: true,
};

onMounted(() => {
  initMap();
  initGUI();
});

onUnmounted(() => {
  disposeMap();
});

const onlySphereOptions = {
  language: "zh_CN",
  pixelRatio: window.devicePixelRatio,
  viewMode: cesiumViewMode.scene3D,
  isShowtimeline: true,
  isShowHelper: false,
  isShowVr: false,
  isShowModePicker: false,
  isShowGeoSearch: false,
  isShowDefHome: false,
  isShowSkyAtmosphere: false,
  isShowFullScreen: false,
  isShowBaseLayerPicker: false,
  isShowSelectionIndicator: false,
  isShowinfoBox: false,
  isShowAnimation: false,
  mapProjection: null,
  skyBox: {
    positiveX: posx_right,
    negativeX: negx_left,
    positiveY: negy_bottom,
    negativeY: posy_top,
    positiveZ: posz_back,
    negativeZ: negz_front,
  },
};

const fullSphereOptions = {
  language: "zh_CN",
  pixelRatio: window.devicePixelRatio,
  viewMode: cesiumViewMode.scene3D,
  isShowtimeline: true,
  isShowHelper: true,
  isShowVr: true,
  isShowModePicker: true,
  isShowGeoSearch: true,
  isShowDefHome: true,
  isShowSkyAtmosphere: true,
  isShowFullScreen: true,
  isShowBaseLayerPicker: true,
  isShowSelectionIndicator: true,
  isShowinfoBox: true,
  isShowAnimation: true,
  mapProjection: null,
};

let cesiumIns: CsMapHelper | null = null;

const satStyleFunc = (feature: any) => {};
const testStleFunc = (feature: any) => {};

const customT = (name: string) => {
  return `$t_${name}`;
};

const modelSource = {
  model1: {
    id: "target_test_1",
    name: "target_1",
    position: [114, 22, 0],
    model: {
      url: "/static/receiver.glb",
      show: true,
      scale: 1,
      minimumPixelSize: 200,
      maximumScale: 10000,
    },
    label: {
      show: false,
      text: "模型1",
    },
    popup: {
      isPopup: true,
      popupType: popupType.vnode,
      hasClose: true,
      vNode: staticImagePopup,
      vNodeData: {
        name: "我是target_test_1",
        longitude: "149.757575E",
        latitude: "30.435657N",
        satellite: "QL_*",
        time: "2023-07-28 12:00:00",
        x: 180,
        y: 1620,
      },
      customT: customT,
    },
    event: {
      eventType: screenEventType.LEFT_CLICK,
    },
  },
  model2: {
    id: "target_test_2",
    name: "target_2",
    position: [116, 22, 0],
    model: {
      url: "/static/receiver.glb",
      show: true,
      scale: 0.25,
      minimumPixelSize: 100,
    },
    label: {
      show: true,
      text: "模型2",
      pixelOffset: [0, 80],
    },
    popup: {
      isPopup: true,
      popupType: popupType.vnode,
      hasClose: true,
      vNode: staticImagePopup,
      vNodeData: {
        name: "我是target_test_2",
        longitude: "149.757575E",
        latitude: "30.435657N",
        satellite: "QL_*",
        time: "2023-07-28 12:00:00",
        x: 180,
        y: 1620,
      },
      customT: customT,
    },
    event: {
      eventType: screenEventType.MOUSE_MOVE,
    },
  },
  // 无 event 直接显示popup，如果关闭了打不了
  model3: {
    id: "target_test_3",
    name: "target_3",
    position: [118, 22, 0],
    model: {
      url: "/static/receiver.glb",
      show: true,
      scale: 0.25,
      minimumPixelSize: 50,
    },
    label: {
      show: true,
      text: "模型3",
      pixelOffset: [20, 80],
    },
    popup: {
      isPopup: true,
      popupType: popupType.vnode,
      hasClose: true,
      vNode: staticImagePopup,
      vNodeData: {
        name: "我是target_test_3",
        longitude: "149.757575E",
        latitude: "30.435657N",
        satellite: "QL_*",
        time: "2023-07-28 12:00:00",
        x: 180,
        y: 1620,
      },
      customT: customT,
    },
  },
  model4: {
    id: "target_test_4",
    name: "target_4",
    position: [120, 22, 0],
    model: {
      url: "/static/receiver.glb",
      show: true,
      scale: 0.25,
      minimumPixelSize: 160,
      maximumScale: 20000,
    },
    label: {
      show: true,
      text: "模型4",
      pixelOffset: [0, 80],
    },
    popup: {
      isPopup: true,
      popupType: popupType.vnode,
      hasClose: true,
      vNode: staticImagePopup,
      vNodeData: {
        name: "我是target_test_2",
        longitude: "149.757575E",
        latitude: "30.435657N",
        satellite: "QL_*",
        time: "2023-07-28 12:00:00",
        x: 180,
        y: 1620,
      },
      customT: customT,
    },
    event: {
      eventType: screenEventType.LEFT_CLICK,
      callback: (event: any, options: any) => {
        console.log("modelExample_callback", event, options);
        options.popup.isUpdate = true;
        options.popup.vNode = staticImagePopup2;
        options.popup.vNodeData = {
          name: "我是VueNode标题Image7",
          longitude: "149.757575E",
          latitude: "30.435657N",
          satellite: nanoid(10),
          time: "2023-07-31 12:00:00",
          x: 180,
          y: 1620,
        };
      },
    },
  },
};

function initMap() {
  cesiumIns = new CsMapHelper("cesium_container", onlySphereOptions);
  cesiumIns.addBgLayer(mapboxBasic);
  cesiumIns.addTargetModel(modelSource.model1);
  cesiumIns.addTargetModel(modelSource.model2);
  cesiumIns.addTargetModel(modelSource.model3);
  cesiumIns.addTargetModel(modelSource.model4);
}

function disposeMap() {
  if (cesiumIns) {
    cesiumIns!.destructor();
    GUIIns!.destroy();
  }
}

let modelControl1: any = null;
let modelControl2: any = null;
let modelControl3: any = null;
let modelControl4: any = null;
function initGUI() {
  GUIIns = new GUI();
  GUIIns.title("全局控制");

  GUIIns.add(mapContrl, "bgLayer", [
    gaodeMap,
    googleImgUrlMap,
    googleVecUrlMap,
    bingMap,
    bingLightMap,
    mapboxBasic,
    mapboxAllBlue,
    osm,
    osmStamen,
    tiandituZh,
    tiandituZhUrl,
    tiandituEn,
  ])
    .name("底图图层")
    .onChange((value: any) => {
      cesiumIns!.addBgLayer(value);
    });

  const imgFolder = GUIIns.addFolder();
  imgFolder.title("模型控制");

  imgFolder
    .add(mapContrl, "allModel")
    .name("0 所有点")
    .onChange((value: any) => {
      if (value) {
        mapContrl.model1 = true;
        mapContrl.model2 = true;
        mapContrl.model3 = true;
        mapContrl.model4 = true;
        mapContrl.model5 = true;
        cesiumIns!.addTargetModel(modelSource.model1);
        cesiumIns!.addTargetModel(modelSource.model2);
        cesiumIns!.addTargetModel(modelSource.model3);
        cesiumIns!.addTargetModel(modelSource.model4);
      } else {
        cesiumIns?.clearTargetModel();
        mapContrl.model1 = false;
        mapContrl.model2 = false;
        mapContrl.model3 = false;
        mapContrl.model4 = false;
        mapContrl.model5 = false;
      }
      modelControl1.updateDisplay();
      modelControl2.updateDisplay();
      modelControl3.updateDisplay();
      modelControl4.updateDisplay();
    });

  modelControl1 = imgFolder
    .add(mapContrl, "model1")
    .name("1 点 单击显示")
    .onChange((value: any) => {
      if (value) {
        cesiumIns?.addTargetModel(modelSource.model1);
      } else {
        cesiumIns?.removeTargetModel(modelSource.model1);
      }
    });

  modelControl2 = imgFolder
    .add(mapContrl, "model2")
    .name("2 点 move显示")
    .onChange((value: any) => {
      if (value) {
        cesiumIns?.addTargetModel(modelSource.model2);
      } else {
        cesiumIns?.removeTargetModel(modelSource.model2);
      }
    });

  modelControl3 = imgFolder
    .add(mapContrl, "model3")
    .name("3 点 无触发事件 直接显示")
    .onChange((value: any) => {
      if (value) {
        cesiumIns?.addTargetModel(modelSource.model3);
      } else {
        cesiumIns?.removeTargetModel(modelSource.model3);
      }
    });

  modelControl4 = imgFolder
    .add(mapContrl, "model4")
    .name("4 点 单击 回调")
    .onChange((value: any) => {
      if (value) {
        cesiumIns?.addTargetModel(modelSource.model4);
      } else {
        cesiumIns?.removeTargetModel(modelSource.model4);
      }
    });
}
</script>

<style lang="scss" scoped></style>
