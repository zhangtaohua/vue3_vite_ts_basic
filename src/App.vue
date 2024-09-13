<template>
  <div class="wh_100vw_100vh app_container">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, provide, onMounted } from "vue";

import workerUrl from "gdal3.js/dist/package/gdal3.js?url";
import dataUrl from "gdal3.js/dist/package/gdal3WebAssembly.data?url";
import wasmUrl from "gdal3.js/dist/package/gdal3WebAssembly.wasm?url";
import initGdalJs from "gdal3.js";
let Gdal = null;

const initGdalHandle = () => {
  const GdalPaths = {
    wasm: wasmUrl,
    data: dataUrl,
    js: workerUrl,
  };

  initGdalJs({ paths: GdalPaths, useWorker: true }).then((GdalTemp) => {
    Gdal = GdalTemp;
    console.log("initGdalJs done!", GdalTemp.drivers.raster);
  });

  // initGdalJs({ path: "https://cdn.jsdelivr.net/npm/gdal3.js@2.8.0/dist/package", useWorker: false }).then(
  //   (GdalTemp) => {
  //     globalUseVar.Gdal = GdalTemp;
  //     console.log("initGdalJs done!", Gdal, Gdal.drivers.raster);
  //   },
  // );
};

onMounted(() => {
  // 这了 清除 通用查询 和 专业查询 切换 已绘制的图形
  // setDrawAction({ action: mapDrawAction.clear });
  initGdalHandle();
});
</script>

<style scoped>
.app_container {
  margin: 0;
  padding: 0;
  overflow: scroll;
  scroll-behavior: smooth;
}

.app_container::-webkit-scrollbar {
  display: none;
  width: 0;
}
</style>
