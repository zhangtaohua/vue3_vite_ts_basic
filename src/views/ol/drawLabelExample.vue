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
  addGeojson: "",
};

function getGeojsonFunc() {
  mapIns.getGeojsonData();
}

function saveGeojsonFunc() {
  mapIns.saveGeojsonData();
}

function addGeojsonFunc() {
  const testOpt = {
    id: "testDraw_id",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [54.972162740899364, -48.514568096989265],
          },
          properties: {
            id: "draw_-Yi2gly0AU",
            shape: "Text",
            geoType: "Point",
            coordinates: [54.972162740899364, -48.514568096989265],
            center: [54.972162740899364, -48.514568096989265],
            area: {
              area: 0,
              areaString: "0 m<sup>2</sup>",
            },
            length: {
              length: 0,
              lengthString: "0 m",
            },
            editProps: {
              name: "哈哈哈",
              attributes: {
                properties: [],
                keyValues: [],
                json: {},
              },
            },
            style: {
              geo: {
                width: 2,
                color: "rgba(24, 144, 255, 1)",
                fillColor: "rgba(24, 144, 255, .2)",
                radius: 5,
                radius2: 5,
                lineDash: [0, 0],
                iconWidth: 6,
                iconHeight: 6,
                iconPattern: "pattern",
                iconUrl: "circle",
                iconAnchor: [0.5, 0.5],
                iconOffset: [0, 0],
                arrowPattern: "noNeed",
              },
              vertex: {
                fontSize: 12,
                color: "rgba(255, 255, 255, 1)",
                fillColor: "rgba(0, 0, 0, 0.4)",
              },
              line: {
                fontSize: 12,
                color: "rgba(255, 255, 255, 1)",
                fillColor: "rgba(0, 0, 0, 0.4)",
              },
              label: {
                fontSize: 14,
                color: "rgba(255, 255, 255, 1)",
                fillColor: "rgba(0, 0, 0, 0.7)",
              },
              text: {
                text: "哈哈哈",
                fontSize: 14,
                offsetY: 0,
                offsetX: 0,
                rotation: 0,
                padding: [0, 0, 0, 0],
                textBaseline: "bottom",
                color: "rgba(24, 144, 255, 1)",
                fillColor: "rgba(24, 144, 255, .2)",
              },
            },
          },
        },
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [63.1948608137045, -38.48553320489411],
          },
          properties: {
            id: "draw_Bb6HO-Ieu3",
            shape: "Text",
            geoType: "Point",
            coordinates: [63.1948608137045, -38.48553320489411],
            center: [63.1948608137045, -38.48553320489411],
            area: {
              area: 0,
              areaString: "0 m<sup>2</sup>",
            },
            length: {
              length: 0,
              lengthString: "0 m",
            },
          },
        },
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [80.66809421841542, -62.45371245764521],
                [101.48179871520345, -50.51613913965824],
                [79.6402569593148, -35.405874370782364],
                [58.82655246252677, -51.165183042794546],
                [80.66809421841542, -62.45371245764521],
              ],
            ],
          },
          properties: {
            id: "draw_KbpMrJQea6",
            shape: "Square",
            geoType: "Polygon",
            coordinates: [
              [
                [80.66809421841542, -62.45371245764521],
                [101.48179871520345, -50.51613913965824],
                [79.6402569593148, -35.405874370782364],
                [58.82655246252677, -51.165183042794546],
                [80.66809421841542, -62.45371245764521],
              ],
            ],
            center: [80.15417558886512, -50.84178961138964],
            area: {
              area: 4645194093477.72,
              areaString: "4645194.09 km<sup>2</sup>",
            },
            length: {
              length: 0,
              lengthString: "0 m",
            },
            editProps: {
              name: "",
              attributes: {
                properties: [
                  {
                    name: "keyvalue",
                    values: 10,
                    units: "天",
                    describe: "des",
                  },
                ],
                keyValues: [],
                json: {},
              },
            },
            style: {
              geo: {
                width: 2,
                color: "rgb(5, 160, 69)",
                fillColor: "rgb(200, 230, 202)",
                radius: 5,
                radius2: 5,
                lineDash: [0, 0],
                iconWidth: 6,
                iconHeight: 6,
                iconPattern: "pattern",
                iconUrl: "circle",
                iconAnchor: [0.5, 0.5],
                iconOffset: [0, 0],
                arrowPattern: "noNeed",
              },
              vertex: {
                fontSize: 12,
                color: "rgba(255, 255, 255, 1)",
                fillColor: "rgba(0, 0, 0, 0.4)",
              },
              line: {
                fontSize: 12,
                color: "rgba(255, 255, 255, 1)",
                fillColor: "rgba(0, 0, 0, 0.4)",
              },
              label: {
                fontSize: 14,
                color: "rgba(255, 255, 255, 1)",
                fillColor: "rgba(0, 0, 0, 0.7)",
              },
              text: null,
            },
          },
        },
      ],
    },
  };
  mapIns.saveGeojsonData(testOpt);
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
