<template>
  <div id="ol_container" class="wh_100p_100p"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

import OlBase from "@/utils/map/ol/base";
import mapboxLayers from "@/utils/map/ol/mapboxLayers";
import type { MapboxOptions } from "@/utils/map/ol/mapboxLayerTypes";
import { mapboxLocalStyle } from "@/utils/map/ol/sourceUrl";

onMounted(() => {
  initMap();
});

onUnmounted(() => {
  disposeMap();
});

let olBaseIns: OlBase | null = null;
let mapboxLayerIns: mapboxLayers | null = null;
function initMap() {
  olBaseIns = new OlBase("ol_container", window.devicePixelRatio);
  mapboxLayerIns = new mapboxLayers(olBaseIns);

  let mapBoxLayerOptions: MapboxOptions = {
    id: "mapboxTest",
    url: mapboxLocalStyle.all_blue,
    isRemoveOld: true,
  };
  mapboxLayerIns.addLayer(mapBoxLayerOptions);
}

function disposeMap() {
  if (mapboxLayerIns) {
    mapboxLayerIns.destructor();
    olBaseIns!.destructor();
  }
}
</script>

<style lang="scss" scoped></style>
