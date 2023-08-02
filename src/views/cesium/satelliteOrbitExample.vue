<template>
  <div id="cesium_container" class="wh_100p_100p"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

import CsMapHelper from "./satelliteOrbitExample";
import { cesiumViewMode } from "@/utils/map/cesium/csConstant";

import negx_left from "@/assets/images/cesium/negx_left.png";
import posx_right from "@/assets/images/cesium/posx_right.png";
import negy_bottom from "@/assets/images/cesium/negy_bottom.png";
import posy_top from "@/assets/images/cesium/posy_top.png";
import negz_front from "@/assets/images/cesium/negz_front.png";
import posz_back from "@/assets/images/cesium/posz_back.png";

import GUI from "lil-gui";

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

// 除了 orbit1 orbit2 参数较完整，其他轨道参数不全，使用时可能不对
// 记得把 startTime 和 endTime 修改了包含当前时间。
const orbitsSource = {
  orbit1: {
    id: "orbit_test_1",
    tle1: "1 48250U 21033C   23186.03111480  .00030307  00000+0  68550-3 0  9995",
    tle2: "2 48250  97.3131 260.4665 0005488 321.4670  38.6186 15.43089270121883",
    name: "QL-4",
    startTime: "2023-08-01 15:00:00",
    endTime: "2023-08-02 15:00:00",
    timeInterval: 90000,
    style: {
      fillColor: [255, 255, 255, 0.5],
      color: "rgba(255 ,0, 0, 1)",
    },
    isShowSat: true,
    satStyleFunction: satStyleFunc,
    oldOrbitStyle: {
      width: 3,
      fillColor: [255, 0, 0, 0.5],
      color: "rgba(125 ,0, 0, 0.8)",
    },
    model: {
      url: "/static/satellite.gltf",
    },
    receiver: {
      id: "receiver_1",
      name: "香港",
      position: [114, 22, 0],
      hasModel: true,
      model: {
        url: "/static/receiver.glb",
        minimumPixelSize: 64,
        maximumScale: 20000,
        scale: 0.25,
      },
    },
  },
  orbit2: {
    id: "orbit_test_2",
    tle1: "1 48248U 21033A   23186.01782116  .00015399  00000+0  46284-3 0  9994",
    tle2: "2 48248  97.3167 258.0705 0007317 337.2116  22.8802 15.34469003121729",
    name: "FS-1",
    startTime: "2023-07-19 15:00:00",
    endTime: "2023-07-20 15:00:00",
    timeInterval: 30000,
    style: {
      fillColor: [255, 255, 255, 0.5],
      color: "rgba(0 ,255, 0, 1)",
    },
    isShowSat: true,
    satStyleFunction: satStyleFunc,
    oldOrbitStyle: {
      width: 3,
      fillColor: [255, 0, 0, 0.5],
      color: "rgba(0 ,125, 0, 0.8)",
    },
  },
  orbit3: {
    id: "orbit_test_3",
    tle1: "1 48251U 21033D   23185.99209335  .00020227  00000+0  72079-3 0  9998",
    tle2: "2 48251  97.3174 259.5856 0015493  66.4588 293.8278 15.28836488121817",
    name: "GB-SAR-1",
    startTime: "2023-07-18 15:20:00",
    endTime: "2023-07-18 16:20:00",
    timeInterval: 30000,
    styleFunction: testStleFunc,
  },
  orbit4: {
    id: "orbit_test_4",
    tle1: "1 48257U 21033K   23186.03136664  .00029119  00000+0  35459-3 0  9994",
    tle2: "2 48257  97.2442 268.0779 0071854 337.3009  22.5073 15.57301240122917",
    name: "JZJ-1",
    startTime: "2023-07-18 15:20:00",
    endTime: "2023-07-18 16:20:00",
    timeInterval: 30000,
  },
  orbit5: {
    id: "orbit_test_5",
    tle1: "1 49315U 21091A   23186.04261382  .00029733  00000+0  76703-3 0  9990",
    tle2: "2 49315  97.4530  19.8010 0011301 224.2703 135.7640 15.39060246 95799",
    name: "JZJ-2",
    startTime: "2023-07-18 15:20:00",
    endTime: "2023-07-18 16:20:00",
    timeInterval: 30000,
  },
  orbit6: {
    id: "orbit_test_6",
    tle1: "1 51824U 22019A   23185.99633048  .00006876  00000+0  37104-3 0  9999",
    tle2: "2 51824  97.4728 258.0480 0018121  19.8441 340.3492 15.14922810 74432",
    name: "XR-7",
    startTime: "2023-07-18 15:20:00",
    endTime: "2023-07-18 16:20:00",
    timeInterval: 30000,
  },
  orbit7: {
    id: "orbit_test_7",
    tle1: "1 54682U 22167A   23186.02744172  .00010641  00000+0  55910-3 0  9994",
    tle2: "2 54682  97.5600 323.5826 0011260 268.8262  91.1681 15.15824845 31404",
    name: "JZJ_1_05",
    startTime: "2023-07-18 15:20:00",
    endTime: "2023-07-18 16:20:00",
    timeInterval: 30000,
  },
  orbit8: {
    id: "orbit_test_8",
    tle1: "1 54693U 22167M   23186.03690441  .00012985  00000+0  66474-3 0  9996",
    tle2: "2 54693  97.5658 323.8805 0011933 268.8042  91.1823 15.16683862 31379",
    name: "JZJ_1_06",
    startTime: "2023-07-18 15:20:00",
    endTime: "2023-07-18 16:20:00",
    timeInterval: 30000,
  },
  orbit9: {
    id: "orbit_test_9",
    tle1: "1 55257U 23007K   23185.99171623  .00010010  00000+0  34572-3 0  9998",
    tle2: "2 55257  97.3574 258.3925 0008437  45.2896 314.9030 15.30104561 26083",
    name: "QL-3",
    startTime: "2023-07-18 15:20:00",
    endTime: "2023-07-18 16:20:00",
    timeInterval: 30000,
  },
  orbit10: {
    id: "orbit_test_10",
    tle1: "1 55258U 23007L   23186.03089480  .00014086  00000+0  46239-3 0  9994",
    tle2: "2 55258  97.3586 258.6731 0007727  46.3770 313.8112 15.31669790 26102",
    name: "QL-2",
    startTime: "2023-07-18 15:20:00",
    endTime: "2023-07-18 16:20:00",
    timeInterval: 30000,
  },
};

function initMap() {
  cesiumIns = new CsMapHelper("cesium_container", onlySphereOptions);
  cesiumIns.addBgLayer(gaodeMap);
  cesiumIns.addSatelliteOrbit(orbitsSource.orbit1);
}

function disposeMap() {
  if (cesiumIns) {
    cesiumIns!.destructor();
    GUIIns!.destroy();
  }
}

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
}
</script>

<style lang="scss" scoped></style>
