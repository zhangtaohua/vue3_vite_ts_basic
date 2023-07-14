<template>
  <div id="ol_container" class="wh_100p_100p"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

import staticImageExample from "./staticImageExample";
import type { MapImageOptions } from "./staticImageExampleTypes";

import { gaodeMap, googleMap, bingMap, bingLightMap, popupType } from "./MapConst";
import GUI from "lil-gui";

import pexels1 from "@/assets/images/test/pexels1.jpeg";
import pexels2 from "@/assets/images/test/pexels2.jpeg";

onMounted(() => {
  initMap();
  initGUI();
  addImage(imagesSource.image1);
  addImage(imagesSource.image2);
});

onUnmounted(() => {
  disposeMap();
});

let mapIns: staticImageExample | null = null;
let GUIIns: GUI | null = null;
const mapContrl = {
  bgLayer: gaodeMap,
};
function initMap() {
  mapIns = new staticImageExample("ol_container", window.devicePixelRatio);
  mapIns.addBgLayer(mapContrl.bgLayer);
}

function disposeMap() {
  if (mapIns) {
    mapIns!.destructor();
    GUIIns.destroy();
  }
}

function initGUI() {
  GUIIns = new GUI();
  GUIIns.title("全局控制");

  GUIIns.add(mapContrl, "bgLayer", [gaodeMap, googleMap, bingMap, bingLightMap])
    .name("底图图层")
    .onChange((value: any) => {
      mapIns.addBgLayer(value);
    });

  // const bgLayerFolder = GUIIns.addFolder();
}
const $t = (name: string) => {
  return `$t_${name}`;
};

const imagesSource = {
  image1: {
    id: "image_test_1",
    url: pexels1,
    extent: [111, 22, 113, 23],
  },
  image2: {
    id: "image_test_2",
    url: pexels1,
    extent: [111, 23.5, 113, 24.5],
    isPopup: true,
    popupType: popupType.normal,
    hasClose: true,
    eventType: "pointermove",
    htmlString: `
    <div class="col_nw_fs_center">
      <div class="row_nw_fs_fs">pointermove 测试</div>
      <div class="row_nw_fs_fs">image_test_2</div>
      <div class="row_nw_fs_fs">我是图片信息2</div>
    </div>
    `,
  },
  image3: {
    id: "image_test_3",
    url: pexels1,
    extent: [111, 25, 113, 26],
    isPopup: true,
    popupType: popupType.normal,
    hasClose: true,
    eventType: "singleclick",
    htmlString: `
    <div class="col_nw_fs_center">
      <div class="row_nw_fs_fs">singleclick 测试</div>
      <div class="row_nw_fs_fs">image_test_3</div>
      <div class="row_nw_fs_fs">我是图片信息3</div>
    </div>
    `,
  },
  image4: {
    id: "image_test_4",
    url: pexels1,
    extent: [111, 26.5, 113, 27.5],
    isPopup: true,
    popupType: popupType.normal,
    hasClose: true,
    eventType: "singleclick",
    htmlString: `
    <div class="col_nw_fs_center">
      <div class="row_nw_fs_fs">singleclick 测试</div>
      <div class="row_nw_fs_fs">image_test_4</div>
      <div class="row_nw_fs_fs">我是图片信息4</div>
    </div>
    `,
  },
  image5: {
    id: "image_test_5",
    url: pexels2,
    extent: [112, 22.5, 114, 23.5],
  },
};
function addImage(MapImageOptions: MapImageOptions) {
  if (mapIns) {
    mapIns.addImagesLayer(MapImageOptions);
  }
}
</script>

<style lang="scss" scoped></style>
