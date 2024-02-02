<template>
  <div id="map_container" class="wh_100p_100p"></div>
  <div class="row_nw_fs_fs header_menu">
    <MapFileTools />
    <MapDrawTools />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import MapDrawTools from "./components/MapDrawTools.vue";
import MapFileTools from "./components/MapFileTools.vue";

import mapGlBase from "@/utils/map/maplibregl/base.ts";
import { mapXYZUrl } from "@/utils/map/sourceUrl";

onMounted(() => {
  initMap();
});

onUnmounted(() => {
  disposeMap();
});

let maplibreglIns: mapGlBase | null = null;
function initMap() {
  // maplibreglIns = new mapGlBase("map_container", window.devicePixelRatio);
}

function disposeMap() {}
</script>

<style lang="scss" scoped>
.header_menu {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  width: 100vw;
  height: 3rem;
  background: rgb(255 255 0 / 20%);
}
</style>
