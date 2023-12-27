<template>
  <div id="ol_container" class="wh_100p_100p"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

import OlMapGeojsonHelper from "./geojsonWebGlExample";
import type { GeojsonOptions } from "@/utils/map/ol/geojsonLayersTypes";

import { gaodeMap, googleMap, bingMap, bingLightMap, mapboxBasic, mapboxAllBlue, popupType } from "./MapConst";
import GUI from "lil-gui";
import { nanoid } from "nanoid";

import { createFill, createStroke, createCircle, createText } from "@/utils/map/ol/style";
import { mapEventType } from "@/utils/map/ol/olConstant";

import { Style } from "ol/style";

import staticImagePopup from "./components/staticImagePopup.vue";
import staticImagePopup2 from "./components/staticImagePopup2.vue";

import worldCities from "@/assets/json/world-cities.json";

onMounted(() => {
  initMap();
  addGeojson(geojsonsSource.geojson1);
  // addGeojson(geojsonsSource.geojson2);
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
    .name("1 通过 URL")
    .onChange((value: any) => {
      if (value) {
        addGeojson(geojsonsSource.geojson1);
      } else {
        removeGeojson(geojsonsSource.geojson1);
      }
    });

  imgFolder
    .add(mapContrl, "geojson2")
    .name("2 通过 data")
    .onChange((value: any) => {
      if (value) {
        addGeojson(geojsonsSource.geojson2);
      } else {
        removeGeojson(geojsonsSource.geojson2);
      }
    });
}

const customT = (name: string) => {
  return `$t_${name}`;
};

// https://openlayers.org/workshop/en/webgl/points.html
// 这里也许可以参考到相应的文档。

const predefinedStyles = {
  icons: {
    symbol: {
      symbolType: "image",
      src: "data/icon.png",
      size: [18, 28],
      color: "lightyellow",
      rotateWithView: false,
      offset: [0, 9],
    },
  },
  triangles: {
    symbol: {
      symbolType: "triangle",
      size: 18,
      color: ["interpolate", ["linear"], ["get", "population"], 20000, "#5aca5b", 300000, "#ff6a19"],
      rotateWithView: true,
    },
  },
  "triangles-latitude": {
    symbol: {
      symbolType: "triangle",
      size: ["interpolate", ["linear"], ["get", "population"], 40000, 12, 2000000, 24],
      color: [
        "interpolate",
        ["linear"],
        ["get", "latitude"],
        -60,
        "#ff14c3",
        -20,
        "#ff621d",
        20,
        "#ffed02",
        60,
        "#00ff67",
      ],
      offset: [0, 0],
      opacity: 0.95,
    },
  },
  circles: {
    symbol: {
      symbolType: "circle",
      size: ["interpolate", ["linear"], ["get", "population"], 40000, 8, 2000000, 28],
      color: ["match", ["get", "hover"], 1, "#ff3f3f", "#006688"],
      rotateWithView: false,
      offset: [0, 0],
      opacity: ["interpolate", ["linear"], ["get", "population"], 40000, 0.6, 2000000, 0.92],
    },
  },
  "circles-zoom": {
    symbol: {
      symbolType: "circle",
      size: ["interpolate", ["exponential", 2.5], ["zoom"], 2, 1, 14, 32],
      color: ["match", ["get", "hover"], 1, "#ff3f3f", "#006688"],
      offset: [0, 0],
      opacity: 0.95,
    },
  },
  "rotating-bars": {
    symbol: {
      symbolType: "square",
      rotation: ["*", ["time"], 0.1],
      size: ["array", 4, ["interpolate", ["linear"], ["get", "population"], 20000, 4, 300000, 28]],
      color: ["interpolate", ["linear"], ["get", "population"], 20000, "#ffdc00", 300000, "#ff5b19"],
      offset: ["array", 0, ["interpolate", ["linear"], ["get", "population"], 20000, 2, 300000, 14]],
    },
  },
};

const testStylePopulattion0 = {
  symbol: {
    symbolType: "circle",
    size: 8,
    color: "rgb(255, 0, 0)",
    opacity: 0.2,
  },
  "circle-radius": ["interpolate", ["linear"], ["get", "population"], 40000, 4, 2000000, 14],
  "circle-fill-color": ["match", ["get", "hover"], 1, "#ff3f3f", "#006688"],
  "circle-rotate-with-view": false,
  "circle-displacement": [0, 0],
  "circle-opacity": ["interpolate", ["linear"], ["get", "population"], 40000, 0.6, 2000000, 0.92],
};

const testStylePopulattion = {
  symbol: {
    symbolType: "circle",
    size: ["interpolate", ["linear"], ["get", "population"], 40000, 8, 2000000, 28],
    color: ["match", ["get", "hover"], 1, "#ff3f3f", "#006688"],
    rotateWithView: false,
    offset: [0, 0],
    opacity: ["interpolate", ["linear"], ["get", "population"], 40000, 0.6, 2000000, 0.92],
  },
};

const testStyleZoom2 = {
  // by using an exponential interpolation with a base of 2 we can make it so that circles will have a fixed size
  // in world coordinates between zoom level 5 and 15
  "circle-radius": ["interpolate", ["exponential", 2], ["zoom"], 5, 1.5, 15, 1.5 * Math.pow(2, 10)],
  "circle-fill-color": ["match", ["get", "hover"], 1, "#ff3f3f", "#006688"],
  "circle-displacement": [0, 0],
  "circle-opacity": 0.95,
};

const testStyleZoom = {
  symbol: {
    symbolType: "circle",
    size: ["interpolate", ["exponential", 2.5], ["zoom"], 2, 1, 14, 32],
    color: ["match", ["get", "hover"], 1, "#ff3f3f", "#006688"],
    offset: [0, 0],
    opacity: 0.95,
  },
};

const geojsonsSource = {
  geojson1: {
    id: "geojson_test_1",
    url: "https://openlayers.org/en/latest/examples/data/geojson/world-cities.geojson",
    isPopup: true,
    popupType: popupType.normal,
    hasClose: true,
    eventType: mapEventType.pointermove,
    popupIsCenter: true,
    style: testStylePopulattion,
    htmlString: `
    <div class="col_nw_fs_center ol_cus_image_wraper">
      <div class="row_nw_center_center ol_cus_image_title">singleclick 测试</div>
      <div class="row_nw_fs_center ol_cus_image_label">image_test_3</div>
      <div class="row_nw_fs_center ol_cus_image_label">我是图片信息3</div>
    </div>
    `,
    callback: (feature: any, options: any) => {
      console.log("feature", feature, feature.get("population"));
      const population = feature.get("population") || "0";
      options.htmlString = `
    <div class="col_nw_fs_center ol_cus_image_wraper">
      <div class="row_nw_center_center ol_cus_image_title">singleclick 测试</div>
      <div class="row_nw_fs_center ol_cus_image_label">image_test_5</div>
      <div class="row_nw_fs_center ol_cus_image_label">我是图片信息5</div>
      <div class="row_nw_fs_center ol_cus_image_label">城市名：${population}</div>
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
  geojson2: {
    id: "geojson_test_2",
    data: worldCities,
    isPopup: true,
    popupType: popupType.vnode,
    hasClose: true,
    style: testStyleZoom,
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
      console.log("feature", feature, feature.get("population"));
      const population = feature.get("population") || "0";
      options.vNode = staticImagePopup2;
      let randomStr = nanoid(10);
      options.vNodeData = {
        name: `VueNode标题_${randomStr}`,
        longitude: "149.757575E",
        latitude: "30.435657N",
        satellite: `城市名：${population}`,
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
