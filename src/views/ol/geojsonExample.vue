<template>
  <div id="ol_container" class="wh_100p_100p"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

import OlMapGeojsonHelper from "./geojsonExample";
import type { GeojsonOptions } from "@/utils/map/ol/geojsonLayersTypes";

import { gaodeMap, googleMap, bingMap, bingLightMap, mapboxBasic, mapboxAllBlue, popupType } from "./MapConst";
import GUI from "lil-gui";
import { nanoid } from "nanoid";

import { createFill, createStroke, createCircle, createText } from "@/utils/map/ol/style";
import { mapEventType } from "@/utils/map/ol/olConstant";

import { Style } from "ol/style";

import staticImagePopup from "./components/staticImagePopup.vue";
import staticImagePopup2 from "./components/staticImagePopup2.vue";

import geojson11 from "@/assets/json/geometryProvince/11.json";
import geojson12 from "@/assets/json/geometryProvince/12.json";
import geojson13 from "@/assets/json/geometryProvince/13.json";
import geojson14 from "@/assets/json/geometryProvince/14.json";
import geojson15 from "@/assets/json/geometryProvince/15.json";
import geojson21 from "@/assets/json/geometryProvince/21.json";
import geojson22 from "@/assets/json/geometryProvince/22.json";
import geojson23 from "@/assets/json/geometryProvince/23.json";
import geojson31 from "@/assets/json/geometryProvince/31.json";
import geojson41 from "@/assets/json/geometryProvince/41.json";
import maptest from "@/assets/json/map.json";
import ChinaTest from "@/assets/json/China.json";
import geojsonDraw from "@/assets/json/geojsonDraw.json";

onMounted(() => {
  initMap();
  // addGeojson(geojsonsSource.geojson1);
  addGeojson(geojsonsSource.geojson2);
  // addGeojson(geojsonsSource.geojson3);
  // addGeojson(geojsonsSource.geojson4);
  // addGeojson(geojsonsSource.geojson5);
  // addGeojson(geojsonsSource.geojson6);
  // addGeojson(geojsonsSource.geojson7);
  // addGeojson(geojsonsSource.geojson8);
  // addGeojson(geojsonsSource.geojson9);
  // addGeojson(geojsonsSource.geojson10);
  // addGeojson(geojsonsSource.geojson11);
  initGUI();
});

onUnmounted(() => {
  disposeMap();
});

let mapIns: OlMapGeojsonHelper | null = null;
let GUIIns: GUI | null = null;
const mapContrl = {
  bgLayer: gaodeMap,
  geojson1: true,
  geojson2: true,
  geojson3: true,
  geojson4: true,
  geojson5: true,
  geojson6: true,
  geojson7: true,
  geojson8: true,
  geojson9: true,
  geojson10: true,
  geojson11: true,
};
function initMap() {
  mapIns = new OlMapGeojsonHelper("ol_container", window.devicePixelRatio);
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

  const imgFolder = GUIIns!.addFolder();
  imgFolder.title("geojson控制");
  imgFolder
    .add(mapContrl, "geojson1")
    .name("1 澳门 普通 通过 URL")
    .onChange((value: any) => {
      if (value) {
        addGeojson(geojsonsSource.geojson1);
      } else {
        removeGeojson(geojsonsSource.geojson1);
      }
    });

  imgFolder
    .add(mapContrl, "geojson2")
    .name("2 北京 普通 通过 Data")
    .onChange((value: any) => {
      if (value) {
        addGeojson(geojsonsSource.geojson2);
      } else {
        removeGeojson(geojsonsSource.geojson2);
      }
    });

  imgFolder
    .add(mapContrl, "geojson3")
    .name("3 香港 URL 样式")
    .onChange((value: any) => {
      if (value) {
        addGeojson(geojsonsSource.geojson3);
      } else {
        removeGeojson(geojsonsSource.geojson3);
      }
    });

  imgFolder
    .add(mapContrl, "geojson4")
    .name("4 台湾 URL 样式函数")
    .onChange((value: any) => {
      if (value) {
        addGeojson(geojsonsSource.geojson4);
      } else {
        removeGeojson(geojsonsSource.geojson4);
      }
    });

  imgFolder
    .add(mapContrl, "geojson5")
    .name("5 天津 Data 样式")
    .onChange((value: any) => {
      if (value) {
        addGeojson(geojsonsSource.geojson5);
      } else {
        removeGeojson(geojsonsSource.geojson5);
      }
    });

  imgFolder
    .add(mapContrl, "geojson6")
    .name("6 河北 Data 样式函数")
    .onChange((value: any) => {
      if (value) {
        addGeojson(geojsonsSource.geojson6);
      } else {
        removeGeojson(geojsonsSource.geojson6);
      }
    });

  imgFolder
    .add(mapContrl, "geojson7")
    .name("7 山西 Data 普通 hover 随鼠标")
    .onChange((value: any) => {
      if (value) {
        addGeojson(geojsonsSource.geojson7);
      } else {
        removeGeojson(geojsonsSource.geojson7);
      }
    });

  imgFolder
    .add(mapContrl, "geojson8")
    .name("8 吉林 Data 普通 hover 居中 回调")
    .onChange((value: any) => {
      if (value) {
        addGeojson(geojsonsSource.geojson8);
      } else {
        removeGeojson(geojsonsSource.geojson8);
      }
    });

  imgFolder
    .add(mapContrl, "geojson9")
    .name("9 上海 Data vnode click 回调")
    .onChange((value: any) => {
      if (value) {
        addGeojson(geojsonsSource.geojson9);
      } else {
        removeGeojson(geojsonsSource.geojson9);
      }
    });

  imgFolder
    .add(mapContrl, "geojson10")
    .name("10 昆明 样式自定义数据")
    .onChange((value: any) => {
      if (value) {
        addGeojson(geojsonsSource.geojson10);
      } else {
        removeGeojson(geojsonsSource.geojson10);
      }
    });

  imgFolder
    .add(mapContrl, "geojson11")
    .name("11 绘制数据 vnode click 回调")
    .onChange((value: any) => {
      if (value) {
        addGeojson(geojsonsSource.geojson11);
      } else {
        removeGeojson(geojsonsSource.geojson11);
      }
    });
}

const customT = (name: string) => {
  return `$t_${name}`;
};

const testStyleFunc = (feature: any) => {
  if (feature) {
    const text = feature.get("name") ?? "";
    const tempStyle = {
      width: 3,
      fillColor: "rgba(0 ,255, 0, 0.2)",
      color: "rgba(0 ,255, 255, 1)",
      radius: 12,
    };

    const textStyle = {
      width: 3,
      fillColor: "rgba(255 ,255, 255, 0.2)",
      color: "rgba(255 ,0, 0, 1)",
      radius: 12,
      text: text,
    };
    return new Style({
      fill: createFill(tempStyle),
      stroke: createStroke(tempStyle),
      image: createCircle(tempStyle),
      text: createText(textStyle),
    });
  }
};

const geojsonsSource = {
  geojson1: {
    id: "geojson_test_1",
    url: "/geojson/demo/82.json",
  },
  geojson2: {
    id: "geojson_test_2",
    data: ChinaTest,
  },
  geojson3: {
    id: "geojson_test_3",
    url: "/geojson/demo/81.json",
    style: {
      fillColor: [255, 0, 0, 0.5],
      color: "rgba(255 ,255, 0, 1)",
    },
  },
  geojson4: {
    id: "geojson_test_4",
    url: "/geojson/demo/71.json",
    styleFunction: testStyleFunc,
  },
  geojson5: {
    id: "geojson_test_5",
    data: geojson12,
    style: {
      width: 5,
      fillColor: [255, 255, 0, 0.5],
      color: "rgba(255 , 0, 255, 1)",
      fontFillColor: [255, 0, 0, 0.5],
      fontColor: "rgba(0 , 255, 255, 1)",
    },
  },
  geojson6: {
    id: "geojson_test_6",
    data: geojson13,
    styleFunction: testStyleFunc,
  },
  geojson7: {
    id: "geojson_test_7",
    data: geojson14,
    isPopup: true,
    popupType: popupType.normal,
    hasClose: true,
    eventType: mapEventType.pointermove,
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
  geojson8: {
    id: "geojson_test_8",
    data: geojson22,
    isPopup: true,
    popupType: popupType.normal,
    hasClose: true,
    eventType: mapEventType.pointermove,
    popupIsCenter: true,
    styleFunction: testStyleFunc,
    htmlString: `
    <div class="col_nw_fs_center ol_cus_image_wraper">
      <div class="row_nw_center_center ol_cus_image_title">singleclick 测试</div>
      <div class="row_nw_fs_center ol_cus_image_label">image_test_3</div>
      <div class="row_nw_fs_center ol_cus_image_label">我是图片信息3</div>
    </div>
    `,
    callback: (feature: any, options: any) => {
      const name = feature.get("name") || "无名字";
      options.htmlString = `
    <div class="col_nw_fs_center ol_cus_image_wraper">
      <div class="row_nw_center_center ol_cus_image_title">singleclick 测试</div>
      <div class="row_nw_fs_center ol_cus_image_label">image_test_5</div>
      <div class="row_nw_fs_center ol_cus_image_label">我是图片信息5</div>
      <div class="row_nw_fs_center ol_cus_image_label">城市名：${name}</div>
    </div>
    `;
    },
    delay: 50,
    debounce: true,
    debounceOption: {
      leading: true,
      trailing: true,
    },
  },
  geojson9: {
    id: "geojson_test_9",
    data: geojson31,
    isPopup: true,
    popupType: popupType.vnode,
    hasClose: true,
    eventType: mapEventType.singleclick,
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
      const name = feature.get("name") || "无名字";
      options.vNode = staticImagePopup2;
      let randomStr = nanoid(10);
      options.vNodeData = {
        name: `VueNode标题_${randomStr}`,
        longitude: "149.757575E",
        latitude: "30.435657N",
        satellite: `城市名：${name}`,
        time: "2023-07-31 12:00:00",
        x: 180,
        y: 1620,
      };
    },
  },
  geojson10: {
    id: "geojson_test_10",
    data: maptest,
  },
  geojson11: {
    id: "geojson_test_11",
    data: geojsonDraw,
    isPopup: true,
    popupType: popupType.vnode,
    hasClose: true,
    eventType: mapEventType.singleclick,
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
      let name = "无名字";
      let featureName = feature.get("name");
      let editProps = feature.get("editProps");
      if (featureName) {
        name = featureName;
      } else if (editProps) {
        if (editProps.name) {
          name = editProps.name;
        }
      }
      options.vNode = staticImagePopup2;
      let randomStr = nanoid(10);
      options.vNodeData = {
        name: `VueNode标题_${randomStr}`,
        longitude: "149.757575E",
        latitude: "30.435657N",
        satellite: `城市名：${name}`,
        time: "2023-07-31 12:00:00",
        x: 180,
        y: 1620,
      };
    },
  },
};

function addGeojson(MapImageOptions: GeojsonOptions) {
  if (mapIns) {
    mapIns.addGeojsonLayer(MapImageOptions);
  }
}

function removeGeojson(MapImageOptions: GeojsonOptions) {
  if (mapIns) {
    mapIns.removeGeojsonLayer(MapImageOptions);
  }
}
</script>

<style lang="scss" scoped></style>
