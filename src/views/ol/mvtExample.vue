<template>
  <div id="ol_container" class="wh_100p_100p"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

import OlMapGeojsonHelper from "./mvtExample";
import type { GeojsonOptions } from "@/utils/map/ol/geojsonLayersTypes";

import { gaodeMap, googleMap, bingMap, bingLightMap, mapboxBasic, mapboxAllBlue, popupType } from "./MapConst";
import GUI from "lil-gui";
import { nanoid } from "nanoid";

import { createFill, createStroke, createCircle, createText } from "@/utils/map/ol/style";
import { mapEventType } from "@/utils/map/ol/olConstant";

import { Style } from "ol/style";

import staticImagePopup from "./components/staticImagePopup.vue";
import staticImagePopup2 from "./components/staticImagePopup2.vue";

onMounted(() => {
  initMap();
  addGeojson(geojsonsSource.geojson1);
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
    .name("1 mvt 通过 URL")
    .onChange((value: any) => {
      if (value) {
        addGeojson(geojsonsSource.geojson1);
      } else {
        removeGeojson(geojsonsSource.geojson1);
      }
    });
}

const customT = (name: string) => {
  return `$t_${name}`;
};

const testStyleFunc = (feature: any) => {
  if (feature) {
    const featureProps = feature.getProperties();
    const text = featureProps.gas;
    const tempStyle = {
      width: 3,
      fillColor: "rgba(0 ,255, 0, 0.2)",
      color: "rgba(0 ,255, 255, 1)",
      radius: 6,
    };

    const textStyle = {
      width: 3,
      fillColor: "rgba(255 ,255, 255, 0.2)",
      color: "rgba(255 ,0, 0, 1)",
      radius: 6,
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

const rankBaseUrl = "/climateTrace/proxy/sds/api/v1/climateTraces/rank";
const pbfBaseUrl = "/climateTrace/proxy/sds/api/v1/climateTrace/mvt/{z}/{x}/{y}?geomType=point&hasKey=";

const geojsonsSource = {
  geojson1: {
    id: "geojson_test_8",
    url: pbfBaseUrl + "647d13719d5ff6b7926477bf6564a4ce3137322e31372e302e31",
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
      const featureProps = feature.getProperties();
      options.htmlString = `
    <div class="col_nw_fs_center ol_cus_image_wraper">
      <div class="row_nw_center_center ol_cus_image_title">singleclick 测试</div>
      <div class="row_nw_fs_center ol_cus_image_label">image_test_5</div>
      <div class="row_nw_fs_center ol_cus_image_label">我是图片信息5</div>
      <div class="row_nw_fs_center ol_cus_image_label">城市名：${featureProps.emissions_quantity}</div>
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
  geojson0: {
    id: "geojson_test_9",
    url: pbfBaseUrl + "647d13719d5ff6b7926477bf6564a4ce3137322e31372e302e31",
    style: {
      width: 2,
      fillColor: [255, 255, 0, 0.5],
      color: "rgba(255 , 0, 255, 1)",
      fontFillColor: [255, 0, 0, 0.5],
      fontColor: "rgba(0 , 255, 255, 1)",
      radius: 4,
    },
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
      const featureProps = feature.getProperties();
      options.vNode = staticImagePopup2;
      let randomStr = nanoid(10);
      options.vNodeData = {
        name: `VueNode标题_${randomStr}`,
        longitude: featureProps.gas,
        latitude: featureProps.emissions_quantity,
        satellite: featureProps.rank,
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
