<template>
  <div id="ol_container" class="wh_100p_100p"></div>
  <DateCircle @onChange="TimeChangeHandle" />
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted } from "vue";

import OlDawnLineHelper from "./dawnLineExample";
import { DawnLineOptions } from "@/utils/map/ol/dawnLineLayersTypes";

import { gaodeMap, googleMap, bingMap, bingLightMap, mapboxBasic, mapboxAllBlue, popupType } from "./MapConst";
import GUI from "lil-gui";
import { nanoid } from "nanoid";

import { createFill, createStroke, createCircle, createText } from "@/utils/map/ol/style";
import { mapEventType } from "@/utils/map/ol/olConstant";

import { Style } from "ol/style";

import DateCircle from "./DateCircle.vue";

onMounted(() => {
  initMap();
  initGUI();
});

onUnmounted(() => {
  disposeMap();
});

let mapIns: OlDawnLineHelper | null = null;
let GUIIns: GUI | null = null;
const mapContrl = {
  bgLayer: gaodeMap,
  whichLine: "dawnline1",
};
function initMap() {
  mapIns = new OlDawnLineHelper("ol_container", window.devicePixelRatio);
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
  imgFolder
    .add(mapContrl, "whichLine", ["dawnline1", "dawnline2", "dawnline3"])
    .name("选择线")
    .onChange((value: any) => {
      mapIns!.clearFuncLayer();
      mapIns!.addDawnLineLayer(dawnLinesSource[value]);
    });
}

const testStleFunc = () => {
  const tempStyle = {
    fillColor: "rgba(0 , 255, 0, 0.4)",
    color: "rgba(0 , 255, 0, 1)",
  };
  return new Style({
    fill: createFill(tempStyle),
  });
};

const dawnLinesSource = {
  dawnline1: {
    id: "dawnLine_test_1",
    timestamp: "",
  },
  dawnline2: {
    id: "dawnLine_test_2",
    timestamp: "",
    style: {
      fillColor: [255, 0, 0, 0.4],
      color: "rgba(255 ,0, 0, 1)",
    },
  },
  dawnline3: {
    id: "dawnLine_test_3",
    timestamp: "",
    styleFunction: testStleFunc,
  },
};

let throttleTimer: any = null;
function TimeChangeHandle(dateTime: any) {
  if (throttleTimer) {
    clearTimeout(throttleTimer);
  }
  throttleTimer = setTimeout(() => {
    dawnLinesSource.dawnline1.timestamp = dateTime.timestamp;
    dawnLinesSource.dawnline2.timestamp = dateTime.timestamp;
    dawnLinesSource.dawnline3.timestamp = dateTime.timestamp;
    mapIns!.clearFuncLayer();
    const currentLine = mapContrl.whichLine;
    mapIns!.addDawnLineLayer(dawnLinesSource[currentLine]);
  }, 300);
}
</script>

<style lang="scss" scoped></style>
