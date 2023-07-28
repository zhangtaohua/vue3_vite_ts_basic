<template>
  <div id="cesium_container" class="wh_100p_100p"></div>
</template>

<script setup lang="ts">
import CesiumBase from "@/utils/map/cesium/base";
import urlTemplateLayers from "@/utils/map/cesium/urlTemplateLayers";
import type { UrlTemplateOptions } from "@/utils/map/cesium/urlTemplateLayersTypes";

import { mapXYZUrl } from "@/utils/map/sourceUrl";
import { cesiumViewMode } from "@/utils/map/cesium/csConstant";

import negx_left from "@/assets/images/cesium/negx_left.png";
import posx_right from "@/assets/images/cesium/posx_right.png";
import negy_bottom from "@/assets/images/cesium/negy_bottom.png";
import posy_top from "@/assets/images/cesium/posy_top.png";
import negz_front from "@/assets/images/cesium/negz_front.png";
import posz_back from "@/assets/images/cesium/posz_back.png";

import { onMounted, onUnmounted } from "vue";

onMounted(() => {
  initMap();
});

onUnmounted(() => {
  disposeMap();
});

const onlySphereOptions = {
  language: "zh_CN",
  pixelRatio: window.devicePixelRatio,
  viewMode: cesiumViewMode.scene3D,
  isShowtimeline: false,
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

let cesiumIns: CesiumBase | null = null;
let urlLayerIns: urlTemplateLayers | null = null;

function initMap() {
  cesiumIns = new CesiumBase("cesium_container", onlySphereOptions);
  urlLayerIns = new urlTemplateLayers(cesiumIns);

  let urlLayerOptions: UrlTemplateOptions = {
    id: "urlTest",
    url: mapXYZUrl.aMap_img_single,
  };
  urlLayerIns.addLayer(urlLayerOptions);
  setTimeout(() => {
    // urlLayerIns.removeLayer(urlLayerOptions);
    // urlLayerIns.clearLayer(urlLayerOptions);
    urlLayerIns.showHiddenLayer(urlLayerOptions, false);
    setTimeout(() => {
      urlLayerIns.showHiddenLayer(urlLayerOptions, true);
    }, 2000);
  }, 10000);
}

function disposeMap() {
  if (cesiumIns) {
    urlLayerIns!.destructor();
    cesiumIns!.destructor();
  }
}
</script>

<style lang="scss" scoped></style>
