<template>
  <div id="cesium_container" class="wh_100p_100p"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

import CsMapHelper from "./pointExample";
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

import staticImagePopup from "../ol/components/staticImagePopup.vue";
import staticImagePopup2 from "../ol/components/staticImagePopup2.vue";

import { popupType } from "@/utils/map/geoConstant";
import { ScreenSpaceEventType, Color } from "cesium";
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
  allPoint: true,
  point1: true,
  point2: true,
  point3: true,
  point4: true,
  point5: true,
  point6: true,
  point7: true,
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

const pointSource = {
  point1: {
    id: "target_test_1",
    name: "target_1",
    position: [114, 22, 0],
    point: {
      show: true,
      pixelSize: 16,
      color: Color.RED,
    },
    label: {
      show: true,
      text: "目标点1",
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
  point2: {
    id: "target_test_2",
    name: "target_2",
    position: [115, 22, 0],
    point: {
      show: true,
      pixelSize: 16,
      color: [0, 255, 0],
    },
    label: {
      show: true,
      text: "目标点2",
      pixelOffset: [0, 20],
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
  point3: {
    id: "target_test_3",
    name: "target_3",
    position: [116, 22, 0],
    point: {
      show: true,
      pixelSize: 16,
      color: [0, 255, 0],
    },
    label: {
      show: true,
      text: "目标点3",
      pixelOffset: [20, 20],
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
  point4: {
    id: "target_test_4",
    name: "target_4",
    position: [117, 22, 0],
    point: {
      show: true,
      pixelSize: 16,
      color: [0, 255, 0],
    },
    label: {
      show: true,
      text: "目标点4",
      pixelOffset: [0, 20],
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
        console.log("pointExample_callback", event, options);
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
  cesiumIns.addBgLayer(gaodeMap);
  cesiumIns.addTargetPoint(pointSource.point1);
  cesiumIns.addTargetPoint(pointSource.point2);
  cesiumIns.addTargetPoint(pointSource.point3);
  cesiumIns.addTargetPoint(pointSource.point4);
}

function disposeMap() {
  if (cesiumIns) {
    cesiumIns!.destructor();
    GUIIns!.destroy();
  }
}

let pointControl1: any = null;
let pointControl2: any = null;
let pointControl3: any = null;
let pointControl4: any = null;
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
  imgFolder.title("目标点控制");

  imgFolder
    .add(mapContrl, "allPoint")
    .name("0 所有点")
    .onChange((value: any) => {
      if (value) {
        mapContrl.point1 = true;
        mapContrl.point2 = true;
        mapContrl.point3 = true;
        mapContrl.point4 = true;
        mapContrl.point5 = true;
        cesiumIns!.addTargetPoint(pointSource.point1);
        cesiumIns!.addTargetPoint(pointSource.point2);
        cesiumIns!.addTargetPoint(pointSource.point3);
        cesiumIns!.addTargetPoint(pointSource.point4);
      } else {
        cesiumIns?.clearTargetPoint();
        mapContrl.point1 = false;
        mapContrl.point2 = false;
        mapContrl.point3 = false;
        mapContrl.point4 = false;
        mapContrl.point5 = false;
      }
      pointControl1.updateDisplay();
      pointControl2.updateDisplay();
      pointControl3.updateDisplay();
      pointControl4.updateDisplay();
    });

  pointControl1 = imgFolder
    .add(mapContrl, "point1")
    .name("1 点 单击显示")
    .onChange((value: any) => {
      if (value) {
        cesiumIns?.addTargetPoint(pointSource.point1);
      } else {
        cesiumIns?.removeTargetPoint(pointSource.point1);
      }
    });

  pointControl2 = imgFolder
    .add(mapContrl, "point2")
    .name("2 点 move显示")
    .onChange((value: any) => {
      if (value) {
        cesiumIns?.addTargetPoint(pointSource.point2);
      } else {
        cesiumIns?.removeTargetPoint(pointSource.point2);
      }
    });

  pointControl3 = imgFolder
    .add(mapContrl, "point3")
    .name("3 点 无触发事件 直接显示")
    .onChange((value: any) => {
      if (value) {
        cesiumIns?.addTargetPoint(pointSource.point3);
      } else {
        cesiumIns?.removeTargetPoint(pointSource.point3);
      }
    });

  pointControl4 = imgFolder
    .add(mapContrl, "point4")
    .name("4 点 单击 回调")
    .onChange((value: any) => {
      if (value) {
        cesiumIns?.addTargetPoint(pointSource.point4);
      } else {
        cesiumIns?.removeTargetPoint(pointSource.point4);
      }
    });
}
</script>

<style lang="scss" scoped></style>
