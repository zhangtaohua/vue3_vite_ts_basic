<template>
  <div id="ol_container" class="wh_100p_100p"></div>
  <MapDrawTools @onChange="actionChangeHandle" />
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted } from "vue";

import OlDrawHelper from "./drawLabelExample";
import { DawnLineOptions } from "@/utils/map/ol/dawnLineLayersTypes";

import { gaodeMap, googleMap, bingMap, bingLightMap, mapboxBasic, mapboxAllBlue, popupType } from "./MapConst";
import GUI from "lil-gui";
import { nanoid } from "nanoid";

import { createFill, createStroke, createCircle, createText } from "@/utils/map/ol/style";
import { mapEventType } from "@/utils/map/ol/olConstant";

import { Style } from "ol/style";

import drawGeojsonData from "@/assets/json/geojsonDraw.json";

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
  bgLayer: mapboxBasic,
  getGeojson: getGeojsonFunc,
  saveGeojson: saveGeojsonFunc,
  addGeojson: addGeojsonFunc,
  removeGeojson: removeGeojsonFunc,
};

function getGeojsonFunc() {
  mapIns.getGeojsonData();
}

function saveGeojsonFunc() {
  mapIns.saveGeojsonData();
}

// 注意加载旧的文件，由于旧文件中没有记录旧有的回调函数
// 所以，如果对旧的geojson 进行了修改，是不会单独触发回调的，
// 只能通过获取所有geojson 文件来获取所有的geojson
// 或者如下所示，在设置项中增加一个回调函数来处理。
function addGeojsonFunc() {
  const testOpt = {
    id: "testDraw_id",
    data: drawGeojsonData,
    callback: (action: string, data: any) => {
      console.log(`加载旧有draw回调函数:`, action, data);
    },
    isShowAction: true, // 为了加载数据后就可以编辑 ，如果不要编辑设置为false
  };
  mapIns?.addGeojsonData(testOpt);
}

function removeGeojsonFunc() {
  const testOpt = {
    id: "testDraw_id",
    data: drawGeojsonData,
  };
  mapIns?.removeGeojsonData(testOpt);
}

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
  imgFolder.title("操作");

  imgFolder.add(mapContrl, "getGeojson");
  imgFolder.add(mapContrl, "saveGeojson");
  imgFolder.add(mapContrl, "addGeojson");
  imgFolder.add(mapContrl, "removeGeojson");
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
    isShowSegments: false,
    isShowLngLat: false,
    isShowLabel: false,
    isShowAction: true,
  },
  [MAP_DRAW_POINT]: {
    shape: MAP_DRAW_POINT,
    isClear: false,
    isFreehand: false,
    needModify: false,
    once: false,
    callback: testCb(MAP_DRAW_POINT),
    isShowSegments: true,
    isShowLngLat: true,
    isShowLabel: true,
    isShowAction: true,
  },
  [MAP_DRAW_SQUARE]: {
    shape: MAP_DRAW_SQUARE,
    isClear: false,
    isFreehand: false,
    needModify: false,
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
    isShowLngLat: true,
    isShowLabel: true,
    isShowAction: true,
  },
  [MAP_DRAW_POLYGON]: {
    shape: MAP_DRAW_POLYGON,
    isClear: false,
    isFreehand: false,
    needModify: true,
    once: false,
    callback: testCb(MAP_DRAW_POLYGON),
    isShowLngLat: true,
    isShowAction: true,
  },
  [MAP_DRAW_LINE]: {
    shape: MAP_DRAW_LINE,
    isClear: false,
    isFreehand: true,
    needModify: false,
    once: false,
    callback: testCb(MAP_DRAW_LINE),
    isShowLabel: true,
    isShowAction: true,
  },
  [MAP_DRAW_GEOMETRY_CIRCLE]: {
    shape: MAP_DRAW_GEOMETRY_CIRCLE,
    isClear: false,
    isFreehand: false,
    needModify: false,
    once: false,
    callback: testCb(MAP_DRAW_GEOMETRY_CIRCLE),
    isShowAction: true,
  },
  [MAP_DRAW_GEODESIC_CIRCLE]: {
    shape: MAP_DRAW_GEODESIC_CIRCLE,
    isClear: false,
    isFreehand: false,
    needModify: false,
    once: false,
    callback: testCb(MAP_DRAW_GEODESIC_CIRCLE),
    isShowAction: true,
  },
  [MAP_MEASURE_DISTANCE]: {
    shape: MAP_MEASURE_DISTANCE,
    isClear: false,
    isFreehand: false,
    needModify: false,
    once: false,
    callback: testCb(MAP_MEASURE_DISTANCE),
    isShowSegments: true,
    isShowLngLat: true,
    isShowLabel: true,
    isShowAction: true,
  },
  [MAP_MEASURE_AREA]: {
    shape: MAP_MEASURE_AREA,
    isClear: false,
    isFreehand: false,
    needModify: false,
    once: false,
    callback: testCb(MAP_MEASURE_AREA),
    isShowSegments: true,
    isShowLngLat: true,
    isShowLabel: true,
    isShowAction: true,
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
