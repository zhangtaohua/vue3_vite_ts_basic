<template>
  <div id="map_container" class="wh_100p_100p"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

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
  maplibreglIns = new mapGlBase("map_container", window.devicePixelRatio);
}

function disposeMap() {}
</script>

<style lang="scss" scoped></style>
