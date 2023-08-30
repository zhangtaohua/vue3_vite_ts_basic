<template>
  <div id="cesium_container" class="wh_100p_100p"></div>
  <MapDrawTools @onChange="actionChangeHandle" />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

import CsMapHelper from "./drawExample";
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
import grocery from "@/assets/images/test/grocery.png";

import staticImagePopup from "../ol/components/staticImagePopup.vue";
import staticImagePopup2 from "../ol/components/staticImagePopup2.vue";

import { popupType } from "@/utils/map/geoConstant";
import * as Cesium from "cesium";
import { screenEventType } from "@/utils/map/cesium/csConstant";
import { nanoid } from "nanoid";

import {
  MAP_DRAW_TEXT,
  MAP_DRAW_POINT,
  MAP_DRAW_SQUARE,
  MAP_DRAW_RECTANGLE,
  MAP_DRAW_POLYGON,
  MAP_DRAW_LINE,
  MAP_DRAW_CIRCLE,
  MAP_DRAW_GEOMETRY_CIRCLE,
  MAP_DRAW_GEODESIC_CIRCLE,
  MAP_MEASURE_DISTANCE,
  MAP_MEASURE_AREA,
  MAP_DRAW_CLEAR,
} from "@/utils/map/geoConstant";

import MapDrawTools from "../ol/components/MapDrawTools.vue";

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

const testCb = (name: string) => {
  return (action: string, data: any) => {
    console.log(`Test1_Draw__${name}:`, action, data);
  };
};

const testCb2 = (name: string) => {
  return (action: string, data: any) => {
    console.log(`Test2_Draw__${name}:`, action, data);
  };
};

const customT = (name: string) => {
  return `$t_${name}`;
};

const drawSource = {
  [MAP_DRAW_POINT]: {
    shape: MAP_DRAW_POINT,
    isClear: true,
    isFreehand: false,
    needModify: false,
    once: false,
    callback: testCb(MAP_DRAW_POINT),
    isShowAction: false,
    isShowLngLat: true,
  },
  [MAP_DRAW_SQUARE]: {
    shape: MAP_DRAW_SQUARE,
    isClear: true,
    isFreehand: false,
    needModify: true,
    once: false,
    callback: testCb2(MAP_DRAW_SQUARE),
    isShowSegments: true,
    isShowLngLat: true,
    isShowLabel: true,
    isShowAction: true,
  },
  [MAP_DRAW_RECTANGLE]: {
    shape: MAP_DRAW_RECTANGLE,
    isClear: false,
    isFreehand: false,
    needModify: false,
    once: false,
    callback: testCb(MAP_DRAW_RECTANGLE),
    isShowSegments: true,
    isShowAction: true,
  },
  [MAP_DRAW_POLYGON]: {
    shape: MAP_DRAW_POLYGON,
    isClear: true,
    isFreehand: false,
    needModify: true,
    once: false,
    callback: testCb(MAP_DRAW_POLYGON),
    isShowSegments: true,
    isShowLngLat: true,
    isShowLabel: true,
    isShowAction: true,
  },
  [MAP_DRAW_LINE]: {
    shape: MAP_DRAW_LINE,
    isClear: true,
    isFreehand: true,
    needModify: true,
    once: false,
    callback: testCb(MAP_DRAW_LINE),
    isShowSegments: true,
    isShowLngLat: true,
    isShowLabel: true,
    isShowAction: true,
  },
  [MAP_DRAW_GEOMETRY_CIRCLE]: {
    shape: MAP_DRAW_GEOMETRY_CIRCLE,
    isClear: true,
    isFreehand: false,
    needModify: true,
    once: false,
    callback: testCb(MAP_DRAW_GEOMETRY_CIRCLE),
  },
  [MAP_DRAW_GEODESIC_CIRCLE]: {
    shape: MAP_DRAW_GEODESIC_CIRCLE,
    isClear: true,
    isFreehand: false,
    needModify: true,
    once: false,
    callback: testCb(MAP_DRAW_GEODESIC_CIRCLE),
  },
  [MAP_MEASURE_DISTANCE]: {
    shape: MAP_MEASURE_DISTANCE,
    isClear: true,
    isFreehand: false,
    needModify: true,
    once: false,
    callback: testCb(MAP_MEASURE_DISTANCE),
    isShowSegments: true,
    isShowLngLat: true,
    isShowLabel: true,
  },
  [MAP_MEASURE_AREA]: {
    shape: MAP_MEASURE_AREA,
    isClear: true,
    isFreehand: false,
    needModify: true,
    once: false,
    callback: testCb(MAP_MEASURE_AREA),
    isShowSegments: true,
    isShowLngLat: true,
    isShowLabel: true,
  },
};

function actionChangeHandle(action: any) {
  console.log("draw action", action, drawSource[action]);
  if (action === MAP_DRAW_CLEAR) {
    cesiumIns!.clearDraw();
  } else {
    cesiumIns?.draw(drawSource[action]);
  }
}

function initMap() {
  cesiumIns = new CsMapHelper("cesium_container", onlySphereOptions);
  cesiumIns.addBgLayer(mapboxBasic);
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

  const imgFolder = GUIIns.addFolder();
  imgFolder.title("目标点控制");
}
</script>

<style lang="scss" scoped></style>
