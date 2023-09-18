<template>
  <div id="ol_container" class="wh_100p_100p"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

import geoImageExample from "./geoImageExample";
import type { GeoImageExtOptions } from "@/utils/map/ol/imageGeoExtLayersTypes";

import { gaodeMap, googleMap, bingMap, bingLightMap, mapboxBasic, mapboxAllBlue, popupType } from "./MapConst";
import GUI from "lil-gui";
import { nanoid } from "nanoid";

import pexels1 from "@/assets/images/test/pexels1.jpeg";
import pexels2 from "@/assets/images/test/pexels2.jpeg";
import pexels3 from "@/assets/images/test/pexels3.jpg";
import staticImagePopup from "./components/staticImagePopup.vue";
import staticImagePopup2 from "./components/staticImagePopup2.vue";

onMounted(() => {
  initMap();
  addImage(imagesSource.image1);
  addImage(imagesSource.image2);
  addImage(imagesSource.image8);
  initGUI();
});

onUnmounted(() => {
  disposeMap();
});

let mapIns: geoImageExample | null = null;
let GUIIns: GUI | null = null;
const mapContrl = {
  bgLayer: gaodeMap,
  image1: true,
  image2: true,
  image3: true,
  image4: true,
  image5: true,
  image6: true,
  image7: true,
  image8: true,
};
function initMap() {
  mapIns = new geoImageExample("ol_container", window.devicePixelRatio);
  mapIns.addBgLayer(mapContrl.bgLayer);
}

function disposeMap() {
  if (mapIns) {
    mapIns!.destructor();
    GUIIns!.destroy();
  }
}

let randomStr = "22333";
function initGUI() {
  GUIIns = new GUI();
  GUIIns.title("全局控制");

  GUIIns.add(mapContrl, "bgLayer", [gaodeMap, googleMap, bingMap, bingLightMap, mapboxBasic, mapboxAllBlue])
    .name("底图图层")
    .onChange((value: any) => {
      mapIns!.addBgLayer(value);
    });

  const imgFolder = GUIIns.addFolder();
  imgFolder.title("图片控制");
  imgFolder
    .add(mapContrl, "image1")
    .name("1 普通图片")
    .onChange((value: any) => {
      if (value) {
        addImage(imagesSource.image1);
      } else {
        removeImage(imagesSource.image1);
      }
    });

  imgFolder
    .add(mapContrl, "image2")
    .name("2 hover popup")
    .onChange((value: any) => {
      if (value) {
        addImage(imagesSource.image2);
      } else {
        removeImage(imagesSource.image2);
      }
    });

  imgFolder
    .add(mapContrl, "image3")
    .name("3 hover popup 即显")
    .onChange((value: any) => {
      if (value) {
        addImage(imagesSource.image3);
      } else {
        removeImage(imagesSource.image3);
      }
    });

  imgFolder
    .add(mapContrl, "image4")
    .name("4 点击 信息")
    .onChange((value: any) => {
      if (value) {
        addImage(imagesSource.image4);
      } else {
        removeImage(imagesSource.image4);
      }
    });

  imgFolder
    .add(mapContrl, "image5")
    .name("5 点击 信息 回调")
    .onChange((value: any) => {
      if (value) {
        randomStr = nanoid(10);
        addImage(imagesSource.image5);
      } else {
        removeImage(imagesSource.image5);
      }
    });

  imgFolder
    .add(mapContrl, "image6")
    .name("6 点击 vnode 信息")
    .onChange((value: any) => {
      if (value) {
        addImage(imagesSource.image6);
      } else {
        removeImage(imagesSource.image6);
      }
    });

  imgFolder
    .add(mapContrl, "image7")
    .name("7 hover vnode 回调")
    .onChange((value: any) => {
      if (value) {
        randomStr = nanoid(10);
        addImage(imagesSource.image7);
      } else {
        removeImage(imagesSource.image7);
      }
    });

  imgFolder
    .add(mapContrl, "image8")
    .name("8 点击 vnode 回调")
    .onChange((value: any) => {
      if (value) {
        randomStr = nanoid(10);
        addImage(imagesSource.image8);
      } else {
        removeImage(imagesSource.image8);
      }
    });
}
const customT = (name: string) => {
  return `$t_${name}`;
};

const imagesSource = {
  image1: {
    id: "image_test_1",
    url: pexels1,
    bbox: [
      [
        [110.76342809639932, 22.891079537851112],
        [109.41424552021081, 23.76802526908787],
        [108.45920616852678, 22.527492881029403],
        [109.80838874471532, 21.642539335563114],
        [110.76342809639932, 22.891079537851112],
      ],
    ],
  },
  image2: {
    id: "image_test_2",
    url: pexels1,
    bbox: [
      [
        [112.61286938061279, 24.128237174508243],
        [111.7487861576606, 24.721747108615318],
        [111.0969339017493, 23.934401882912525],
        [111.96101712470148, 23.337235771494733],
        [112.61286938061279, 24.128237174508243],
      ],
    ],
    isRotation: true,
    isPopup: true,
    popupType: popupType.normal,
    hasClose: true,
    eventType: "pointermove",
    htmlString: `
    <div class="col_nw_fs_center ol_cus_image_wraper">
      <div class="row_nw_center_center ol_cus_image_title">pointermove 测试</div>
      <div class="row_nw_fs_center ol_cus_image_label">image_test_2</div>
      <div class="row_nw_fs_center ol_cus_image_label">我是图片信息2</div>
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
    eventType: "pointermove",
    htmlString: `
    <div class="col_nw_fs_center ol_cus_image_wraper">
      <div class="row_nw_center_center ol_cus_image_title">singleclick 测试</div>
      <div class="row_nw_fs_center ol_cus_image_label">image_test_3</div>
      <div class="row_nw_fs_center ol_cus_image_label">我是图片信息3</div>
    </div>
    `,
    delay: 50,
    debounce: true,
    debounceOption: {
      leading: true,
      trailing: true,
    },
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
    <div class="col_nw_fs_center ol_cus_image_wraper">
      <div class="row_nw_center_center ol_cus_image_title">singleclick 测试</div>
      <div class="row_nw_fs_center ol_cus_image_label">image_test_4</div>
      <div class="row_nw_fs_center ol_cus_image_label">我是图片信息4</div>
    </div>
    `,
  },
  image5: {
    id: "image_test_5",
    url: pexels1,
    extent: [111, 28, 113, 29],
    isPopup: true,
    popupType: popupType.normal,
    hasClose: true,
    eventType: "singleclick",
    htmlString: `
    <div class="col_nw_fs_center ol_cus_image_wraper">
      <div class="row_nw_center_center ol_cus_image_title">singleclick 测试</div>
      <div class="row_nw_fs_center ol_cus_image_label">image_test_5</div>
      <div class="row_nw_fs_center ol_cus_image_label">我是图片信息5</div>
    </div>
    `,
    callback: (feature: any, options: any) => {
      console.log("外", feature, options);
      options.htmlString = `
    <div class="col_nw_fs_center ol_cus_image_wraper">
      <div class="row_nw_center_center ol_cus_image_title">singleclick 测试</div>
      <div class="row_nw_fs_center ol_cus_image_label">image_test_5</div>
      <div class="row_nw_fs_center ol_cus_image_label">我是图片信息5</div>
      <div class="row_nw_fs_center ol_cus_image_label">新数据${randomStr}</div>
    </div>
    `;
    },
  },
  image6: {
    id: "image_test_6",
    url: pexels2,
    extent: [114, 22, 116, 23],
    isPopup: true,
    popupType: popupType.vnode,
    hasClose: true,
    eventType: "singleclick",
    vNode: staticImagePopup,
    vNodeData: {
      name: "我是VueNode标题",
      longitude: "149.757575E",
      latitude: "30.435657N",
      satellite: "QL_*",
      time: "2023-07-28 12:00:00",
      x: 180,
      y: 1620,
    },
    customT: customT,
  },
  image7: {
    id: "image_test_7",
    url: pexels2,
    extent: [114, 23.5, 116, 24.5],
    isPopup: true,
    popupType: popupType.vnode,
    hasClose: true,
    eventType: "pointermove",
    vNode: staticImagePopup,
    vNodeData: {
      name: "我是VueNode标题",
      longitude: "149.757575E",
      latitude: "30.435657N",
      satellite: "QL_*",
      time: "2023-07-28 12:00:00",
      x: 180,
      y: 1620,
    },
    customT: customT,
    callback: (feature: any, options: any) => {
      console.log("外", feature, options);
      options.vNode = staticImagePopup2;
      options.vNodeData = {
        name: "我是VueNode标题Image7",
        longitude: "149.757575E",
        latitude: "30.435657N",
        satellite: randomStr,
        time: "2023-07-31 12:00:00",
        x: 180,
        y: 1620,
      };
    },
  },
  image8: {
    id: "image_test_8",
    url: pexels3,
    // extent 可给可不给，不给会从 bbox 中计算出来，给可以和bbox一样
    // 也可以只给左下 右上点一维4个点。
    // extent: [
    //   [
    //     [108.86959728872603, 20.060637912154448],
    //     [105.88748348068856, 19.626054243965754],
    //     [106.34950111291971, 16.793640507227252],
    //     [109.3316149209572, 17.235434578797324],
    //     [108.86959728872603, 20.060637912154448],
    //   ],
    // ],
    bbox: [
      [
        [108.86959728872603, 20.060637912154448],
        [105.88748348068856, 19.626054243965754],
        [106.34950111291971, 16.793640507227252],
        [109.3316149209572, 17.235434578797324],
        [108.86959728872603, 20.060637912154448],
      ],
    ],
    isRotation: true,
    rotationInDegree: 0,
    isPopup: true,
    popupType: popupType.vnode,
    hasClose: true,
    eventType: "singleclick",
    vNode: staticImagePopup,
    vNodeData: {
      name: "我是VueNode标题",
      longitude: "149.757575E",
      latitude: "30.435657N",
      satellite: "QL_*",
      time: "2023-07-28 12:00:00",
      x: 180,
      y: 1620,
    },
    customT: customT,
  },
};

function addImage(MapImageOptions: GeoImageExtOptions) {
  if (mapIns) {
    mapIns.addImagesLayer(MapImageOptions);
  }
}

function removeImage(MapImageOptions: GeoImageExtOptions) {
  if (mapIns) {
    mapIns.removeImagesLayer(MapImageOptions);
  }
}
</script>

<style lang="scss" scoped></style>
