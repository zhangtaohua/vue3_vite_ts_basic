<template>
  <div id="ol_container" class="wh_100p_100p"></div>
  <MapDrawTools @onChange="actionChangeHandle" />
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted } from "vue";

import OlDrawHelper from "./drawExample";
import { DawnLineOptions } from "@/utils/map/ol/dawnLineLayersTypes";

import { gaodeMap, googleMap, bingMap, bingLightMap, mapboxBasic, mapboxAllBlue, popupType } from "./MapConst";
import GUI from "lil-gui";
import { nanoid } from "nanoid";

import { createFill, createStroke, createCircle, createText } from "@/utils/map/ol/style";
import { mapEventType } from "@/utils/map/ol/olConstant";

import { Style } from "ol/style";

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
  MAP_SELECT_DRAW_MODE,
  MAP_SHOW_PROPS,
  MAP_HIDDEN_PROPS,
  drawModeType,
} from "@/utils/map/geoConstant";

import MapDrawTools from "./components/MapDrawTools.vue";
// import MapDrawTools from "@/utils/map/dom/MapDrawTools.vue";

onMounted(() => {
  initMap();
  initGUI();
});

onUnmounted(() => {
  disposeMap();
});

let mapIns: OlDrawHelper | null = null;
let GUIIns: GUI | null = null;
const mapContrl = {
  bgLayer: gaodeMap,
};
function initMap() {
  mapIns = new OlDrawHelper("ol_container", window.devicePixelRatio);
  mapIns.addBgLayer(mapContrl.bgLayer);
}

function disposeMap() {
  if (mapIns) {
    mapIns!.destructor();
    GUIIns!.destroy();
  }
}

function initGUI() {
  GUIIns = new GUI();
  GUIIns.title("全局控制");

  GUIIns.add(mapContrl, "bgLayer", [gaodeMap, googleMap, bingMap, bingLightMap, mapboxBasic, mapboxAllBlue])
    .name("底图图层")
    .onChange((value: any) => {
      mapIns!.addBgLayer(value);
    });

  const imgFolder = GUIIns.addFolder();
  imgFolder.title("晨昏线");
}

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

const drawSource = {
  [MAP_DRAW_TEXT]: {
    shape: MAP_DRAW_TEXT,
    isClear: false,
    isFreehand: false,
    needModify: false,
    once: false,
    callback: testCb(MAP_DRAW_TEXT),
  },
  [MAP_DRAW_POINT]: {
    shape: MAP_DRAW_POINT,
    isClear: true,
    isFreehand: false,
    needModify: true,
    once: false,
    callback: testCb(MAP_DRAW_POINT),
    isShowSegments: true,
    isShowLngLat: true,
    isShowLabel: true,
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
  },
  [MAP_DRAW_RECTANGLE]: {
    shape: MAP_DRAW_RECTANGLE,
    isClear: false,
    isFreehand: false,
    needModify: false,
    once: false,
    callback: testCb(MAP_DRAW_RECTANGLE),
    isShowSegments: true,
    isShowLngLat: true,
    isShowLabel: true,
  },
  [MAP_DRAW_POLYGON]: {
    shape: MAP_DRAW_POLYGON,
    isClear: true,
    isFreehand: false,
    needModify: true,
    once: true,
    callback: testCb(MAP_DRAW_POLYGON),
    isShowLngLat: true,
  },
  [MAP_DRAW_LINE]: {
    shape: MAP_DRAW_LINE,
    isClear: true,
    isFreehand: true,
    needModify: true,
    once: false,
    callback: testCb(MAP_DRAW_LINE),
    isShowLabel: true,
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

function actionChangeHandle(action: any, value: any) {
  console.log("draw action", action, value);

  if (action === MAP_SELECT_DRAW_MODE) {
    switch (value) {
      case drawModeType.idle: {
        break;
      }
      case drawModeType.draw: {
        mapIns?.draw(drawSource[MAP_DRAW_POLYGON]);
        break;
      }
      case drawModeType.modify: {
        break;
      }
      case drawModeType.edit: {
        break;
      }
      case drawModeType.delete: {
        break;
      }
      default: {
        break;
      }
    }
  } else if (action === MAP_SHOW_PROPS) {
  } else if (action === MAP_HIDDEN_PROPS) {
  } else if (action === MAP_DRAW_CLEAR) {
    mapIns.clearDraw();
  } else {
    mapIns?.draw(drawSource[action]);
  }
}
</script>

<style lang="scss" scoped></style>
