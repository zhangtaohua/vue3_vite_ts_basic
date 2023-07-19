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

import MapDrawTools from "./components/MapDrawTools.vue";

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

const drawSource = {};

function actionChangeHandle(action: any) {
  console.log("draw action", action);
  mapIns?.draw(action).then((res) => {
    console.log("shapes", res);
  });
}
</script>

<style lang="scss" scoped></style>
