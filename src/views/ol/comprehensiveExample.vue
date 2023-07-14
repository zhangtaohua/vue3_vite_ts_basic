<template>
  <div id="ol_container" class="wh_100p_100p"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

import OlBase from "@/utils/map/ol/base";
import xyzLayers from "@/utils/map/ol/xyzLayers";
import type { XYZOptions } from "@/utils/map/ol/xyzLayersTypes";
import { mapXYZUrl } from "@/utils/map/ol/sourceUrl";

onMounted(() => {
  initMap();
});

onUnmounted(() => {
  disposeMap();
});

let olBaseIns: OlBase | null = null;
let xyzLayerIns: xyzLayers | null = null;
function initMap() {
  olBaseIns = new OlBase("ol_container", window.devicePixelRatio);
  xyzLayerIns = new xyzLayers(olBaseIns);

  let XYZLayerOptions: XYZOptions = {
    id: "xyzTest",
    url: mapXYZUrl.aMap_vec,
  };
  xyzLayerIns.addLayer(XYZLayerOptions);
}

function disposeMap() {
  if (xyzLayerIns) {
    xyzLayerIns!.destructor();
    olBaseIns!.destructor();
  }
}
</script>

<style lang="scss" scoped></style>
