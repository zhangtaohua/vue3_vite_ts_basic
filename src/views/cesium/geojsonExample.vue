<template>
  <div id="cesium_container" class="wh_100p_100p"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

import CsMapHelper from "./geojsonExample";
import { cesiumViewMode } from "@/utils/map/cesium/csConstant";

import { makePointStyle, makeLabelStyle } from "@/utils/map/cesium/style";
import { getCsColor } from "@/utils/map/cesium/csTools";

import negx_left from "@/assets/images/cesium/negx_left.png";
import posx_right from "@/assets/images/cesium/posx_right.png";
import negy_bottom from "@/assets/images/cesium/negy_bottom.png";
import posy_top from "@/assets/images/cesium/posy_top.png";
import negz_front from "@/assets/images/cesium/negz_front.png";
import posz_back from "@/assets/images/cesium/posz_back.png";

import GUI from "lil-gui";

import pexels1 from "@/assets/images/test/pexels1.jpeg";
import pexels2 from "@/assets/images/test/pexels2.jpeg";
import catImg from "@/assets/images/test/cat.jpg";

import staticImagePopup from "../ol/components/staticImagePopup.vue";
import staticImagePopup2 from "../ol/components/staticImagePopup2.vue";

import { popupType } from "@/utils/map/geoConstant";
import * as Cesium from "cesium";
import { screenEventType } from "@/utils/map/cesium/csConstant";
import { nanoid } from "nanoid";

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

import {
  gaodeMap,
  googleImgUrlMap,
  googleVecUrlMap,
  googleEarthMap,
  bingMap,
  bingLightMap,
  mapboxBasic,
  mapboxAllBlue,
  osm,
  osmStamen,
  tiandituZh,
  tiandituZhUrl,
  tiandituEn,
} from "./MapConst";

let GUIIns: GUI | null = null;

const mapContrl = {
  bgLayer: gaodeMap,
  allGeojson: true,
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
  geojson12: true,
  geojson13: true,
  geojson14: true,
};

onMounted(() => {
  initMap();
  initGUI();
});

onUnmounted(() => {
  disposeMap();
});

const onlySphereOptions = {
  language: "zh_CN",
  pixelRatio: window.devicePixelRatio,
  viewMode: cesiumViewMode.scene3D,
  isShowtimeline: true,
  isShowHelper: false,
  isShowVr: false,
  isShowModePicker: false,
  isShowGeoSearch: false,
  isShowDefHome: false,
  isShowSkyAtmosphere: false,
  isShowFullScreen: false,
  isShowBaseLayerPicker: false,
  isShowSelectionIndicator: false,
  isShowinfoBox: false,
  isShowAnimation: false,
  mapProjection: null,
  skyBox: {
    positiveX: posx_right,
    negativeX: negx_left,
    positiveY: negy_bottom,
    negativeY: posy_top,
    positiveZ: posz_back,
    negativeZ: negz_front,
  },
};

const fullSphereOptions = {
  language: "zh_CN",
  pixelRatio: window.devicePixelRatio,
  viewMode: cesiumViewMode.scene3D,
  isShowtimeline: true,
  isShowHelper: true,
  isShowVr: true,
  isShowModePicker: true,
  isShowGeoSearch: true,
  isShowDefHome: true,
  isShowSkyAtmosphere: true,
  isShowFullScreen: true,
  isShowBaseLayerPicker: true,
  isShowSelectionIndicator: true,
  isShowinfoBox: true,
  isShowAnimation: true,
  mapProjection: null,
};

let cesiumIns: CsMapHelper | null = null;

const testStyleFunc = (dataSource: any, options: any) => {
  const entities = dataSource.entities.values;
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];

    const radius = 16;
    let fillColor = [124, 124, 255, 0.25];
    fillColor = getCsColor(fillColor, Cesium.GeoJsonDataSource.fill);

    let outlineColor = [0, 0, 255];
    outlineColor = getCsColor(outlineColor, Cesium.GeoJsonDataSource.stroke);

    const outlineWidth = 4;
    // console.log("propStyle", entity, radius, fillColor, outlineColor, outlineWidth);
    const isPointUseMarker = true;
    if (entity.billboard) {
      // 点
      if (isPointUseMarker) {
        entity.billboard.color = fillColor;
      } else {
        // 如果不用 billboard 显示点的话。
        entity.billboard = undefined;
        entity.point = makePointStyle(radius, fillColor, outlineColor, outlineWidth);
      }
    } else if (entity.polygon) {
      // 多边形
      entity.polygon.material = fillColor;
      entity.polygon.outlineColor = outlineColor;
      entity.polygon.outlineWidth = outlineWidth;

      // 计算中心点
      const positions = entity.polygon.hierarchy["_value"].positions;
      const center = Cesium.BoundingSphere.fromPoints(positions).center;
      Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(center, center);
      entity.position = new Cesium.ConstantPositionProperty(center);
    } else if (entity.polyline) {
      // 线段
      entity.polyline.material = fillColor;
      entity.polyline.width = outlineWidth;
    }
    const labelOpt = {
      show: true,
      text: entity.name || "labelTest",
      pixelOffset: [0, 0],
      fillColor: [255, 0, 0],
    };

    if (labelOpt) {
      entity.label = makeLabelStyle(labelOpt);
    }
  }
};

const customT = (name: string) => {
  return `$t_${name}`;
};

const geojsonSource = {
  geojson1: {
    id: "geojson_test_1",
    name: "geojson_1",
    geojson: {
      data: "/geojson/demo/82.json",
    },
  },
  geojson2: {
    id: "geojson_test_2",
    name: "geojson_2",
    geojson: {
      data: geojson11,
      markerColor: [255, 0, 0],
      stroke: [0, 255, 0],
      strokeWidth: 2,
      fill: [0, 255, 255, 0.25],
    },
  },
  geojson3: {
    id: "geojson_test_3",
    name: "geojson_3",
    geojson: {
      data: "/geojson/demo/81.json",
      markerColor: [255, 0, 0],
      stroke: [0, 255, 0],
      strokeWidth: 2,
      fill: [0, 255, 255, 0.25],
    },
    style: {
      radius: 12,
      width: 3,
      color: "rgba(255, 0, 255, 1)",
      fillColor: [255, 0, 0, 0.5],
    },
  },
  geojson4: {
    id: "geojson_test_4",
    name: "geojson_4",
    geojson: {
      data: "/geojson/demo/71.json",
      markerColor: [255, 0, 0],
      stroke: [0, 255, 0],
      strokeWidth: 2,
      fill: [0, 255, 255, 0.25],
    },
    styleFunction: testStyleFunc, // 优先级最低
  },
  geojson5: {
    id: "geojson_test_5",
    name: "geojson_5",
    geojson: {
      data: geojson12,
      markerColor: [255, 0, 0],
      stroke: [0, 255, 0],
      strokeWidth: 2,
      fill: [0, 255, 255, 0.25],
    },
    style: {
      radius: 12,
      width: 5,
      color: "rgba(255 , 0, 255, 1)",
      fillColor: [255, 0, 0, 0.5],
    },
  },
  geojson6: {
    id: "geojson_test_6",
    name: "geojson_6",
    geojson: {
      data: geojson13,
      markerColor: [255, 0, 0],
      stroke: [0, 255, 0],
      strokeWidth: 2,
      fill: [0, 255, 255, 0.25],
    },
    styleFunction: testStyleFunc,
  },
  geojson7: {
    id: "geojson_test_7",
    name: "geojson_7",
    geojson: {
      data: geojson14,
    },
    label: {
      show: true,
      pixelOffset: [0, 0],
    },
    popup: {
      isPopup: true,
      popupType: popupType.vnode,
      hasClose: true,
      vNode: staticImagePopup,
      vNodeData: {
        name: "我是target_test_1",
        longitude: "149.757575E",
        latitude: "30.435657N",
        satellite: "QL_*",
        time: "2023-07-28 12:00:00",
        x: 180,
        y: 1620,
      },
      customT: customT,
    },
    event: {
      eventType: screenEventType.LEFT_CLICK,
    },
  },
  geojson8: {
    id: "geojson_test_8",
    name: "geojson_8",
    geojson: {
      data: geojson22,
    },
    label: {
      show: true,
      pixelOffset: [0, 0],
    },
    popup: {
      isPopup: true,
      popupType: popupType.vnode,
      hasClose: true,
      vNode: staticImagePopup,
      vNodeData: {
        name: "我是target_test_2",
        longitude: "149.757575E",
        latitude: "30.435657N",
        satellite: "QL_*",
        time: "2023-07-28 12:00:00",
        x: 180,
        y: 1620,
      },
      customT: customT,
    },
    event: {
      eventType: screenEventType.MOUSE_MOVE,
    },
  },
  geojson9: {
    id: "geojson_test_9",
    name: "geojson_9",
    geojson: {
      data: geojson31,
    },
    label: {
      show: true,
      pixelOffset: [10, 10],
    },
    popup: {
      isPopup: true,
      popupType: popupType.vnode,
      hasClose: true,
      vNode: staticImagePopup,
      vNodeData: {
        name: "我是target_test_2",
        longitude: "149.757575E",
        latitude: "30.435657N",
        satellite: "QL_*",
        time: "2023-07-28 12:00:00",
        x: 180,
        y: 1620,
      },
      customT: customT,
    },
    event: {
      eventType: screenEventType.LEFT_CLICK,
      // 事件，实体， 原始的设置项
      callback: (event: any, entity: any, options: any) => {
        console.log("cesium geojsonExample_callback", event, entity, options);
        options.popup.isUpdate = true;
        options.popup.vNode = staticImagePopup2;
        options.popup.vNodeData = {
          name: entity.name,
          longitude: "149.757575E",
          latitude: "30.435657N",
          satellite: nanoid(10),
          time: "2023-07-31 12:00:00",
          x: 180,
          y: 1620,
        };
      },
    },
  },
  geojson10: {
    id: "geojson_test_10",
    name: "geojson_10",
    geojson: {
      data: maptest,
      markerColor: [255, 255, 255],
      stroke: [255, 255, 255],
      strokeWidth: 2,
      fill: [255, 255, 255, 0.25],
    },
    style: {
      radius: 12,
      width: 2,
      color: "rgba(255 , 0, 0, 1)",
      fillColor: [255, 0, 0, 0.5],
    },
  },
};

function initMap() {
  cesiumIns = new CsMapHelper("cesium_container", onlySphereOptions);
  cesiumIns.addBgLayer(gaodeMap);
  cesiumIns.addGeojson(geojsonSource.geojson1);
  cesiumIns.addGeojson(geojsonSource.geojson2);
  cesiumIns.addGeojson(geojsonSource.geojson3);
  cesiumIns.addGeojson(geojsonSource.geojson4);
  cesiumIns.addGeojson(geojsonSource.geojson5);
  cesiumIns.addGeojson(geojsonSource.geojson6);
  cesiumIns.addGeojson(geojsonSource.geojson7);
  cesiumIns.addGeojson(geojsonSource.geojson8);
  cesiumIns.addGeojson(geojsonSource.geojson9);
  cesiumIns.addGeojson(geojsonSource.geojson10);
}

function disposeMap() {
  if (cesiumIns) {
    cesiumIns!.destructor();
    GUIIns!.destroy();
  }
}

let geojsonControl1: any = null;
let geojsonControl2: any = null;
let geojsonControl3: any = null;
let geojsonControl4: any = null;
let geojsonControl5: any = null;
let geojsonControl6: any = null;
let geojsonControl7: any = null;
let geojsonControl8: any = null;
let geojsonControl9: any = null;
let geojsonControl10: any = null;
let geojsonControl11: any = null;
let geojsonControl12: any = null;
let geojsonControl13: any = null;
let geojsonControl14: any = null;

function initGUI() {
  GUIIns = new GUI({
    width: 300,
  });
  GUIIns.title("全局控制");

  GUIIns.add(mapContrl, "bgLayer", [
    gaodeMap,
    googleImgUrlMap,
    googleVecUrlMap,
    bingMap,
    bingLightMap,
    mapboxBasic,
    mapboxAllBlue,
    osm,
    osmStamen,
    tiandituZh,
    tiandituZhUrl,
    tiandituEn,
  ])
    .name("底图图层")
    .onChange((value: any) => {
      cesiumIns!.addBgLayer(value);
    });

  const imgFolder = GUIIns.addFolder();
  imgFolder.title("Geojson控制");

  // imgFolder
  //   .add(mapContrl, "allGeojson")
  //   .name("0 所有Geojson")
  //   .onChange((value: any) => {
  //     if (value) {
  //       mapContrl.geojson1 = true;
  //       mapContrl.geojson2 = true;
  //       mapContrl.geojson3 = true;
  //       mapContrl.geojson4 = true;
  //       mapContrl.geojson5 = true;
  //       cesiumIns!.addGeojson(geojsonSource.geojson1);
  //       cesiumIns!.addGeojson(geojsonSource.geojson2);
  //       cesiumIns!.addGeojson(geojsonSource.geojson3);
  //       cesiumIns!.addGeojson(geojsonSource.geojson4);
  //     } else {
  //       cesiumIns?.clearGeojson();
  //       mapContrl.geojson1 = false;
  //       mapContrl.geojson2 = false;
  //       mapContrl.geojson3 = false;
  //       mapContrl.geojson4 = false;
  //       mapContrl.geojson5 = false;
  //     }
  //     geojsonControl1.updateDisplay();
  //     geojsonControl2.updateDisplay();
  //     geojsonControl3.updateDisplay();
  //     geojsonControl4.updateDisplay();
  //   });

  geojsonControl1 = imgFolder
    .add(mapContrl, "geojson1")
    .name("1 澳门 默认样式 通过 URL")
    .onChange((value: any) => {
      if (value) {
        cesiumIns?.addGeojson(geojsonSource.geojson1);
      } else {
        cesiumIns?.removeGeojson(geojsonSource.geojson1);
      }
    });

  geojsonControl2 = imgFolder
    .add(mapContrl, "geojson2")
    .name("2 北京 geojson配置项设置样式 通过 Data")
    .onChange((value: any) => {
      if (value) {
        cesiumIns?.addGeojson(geojsonSource.geojson2);
      } else {
        cesiumIns?.removeGeojson(geojsonSource.geojson2);
      }
    });

  geojsonControl3 = imgFolder
    .add(mapContrl, "geojson3")
    .name("3 香港 style覆盖geojson设置样式 通过 URL")
    .onChange((value: any) => {
      if (value) {
        cesiumIns?.addGeojson(geojsonSource.geojson3);
      } else {
        cesiumIns?.removeGeojson(geojsonSource.geojson3);
      }
    });

  geojsonControl4 = imgFolder
    .add(mapContrl, "geojson4")
    .name("4 台湾 样式函数 覆盖geojson设置样式 通过 URL")
    .onChange((value: any) => {
      if (value) {
        cesiumIns?.addGeojson(geojsonSource.geojson4);
      } else {
        cesiumIns?.removeGeojson(geojsonSource.geojson4);
      }
    });

  geojsonControl5 = imgFolder
    .add(mapContrl, "geojson5")
    .name("5 天津 style覆盖geojson设置样式 通过 Data")
    .onChange((value: any) => {
      if (value) {
        cesiumIns?.addGeojson(geojsonSource.geojson5);
      } else {
        cesiumIns?.removeGeojson(geojsonSource.geojson5);
      }
    });

  geojsonControl6 = imgFolder
    .add(mapContrl, "geojson6")
    .name("6 河北 样式函数 覆盖geojson设置样式 通过 Data")
    .onChange((value: any) => {
      if (value) {
        cesiumIns?.addGeojson(geojsonSource.geojson6);
      } else {
        cesiumIns?.removeGeojson(geojsonSource.geojson6);
      }
    });

  geojsonControl7 = imgFolder
    .add(mapContrl, "geojson7")
    .name("7 山西 Data 单击显示 popup")
    .onChange((value: any) => {
      if (value) {
        cesiumIns?.addGeojson(geojsonSource.geojson7);
      } else {
        cesiumIns?.removeGeojson(geojsonSource.geojson7);
      }
    });

  geojsonControl8 = imgFolder
    .add(mapContrl, "geojson8")
    .name("8 吉林 Data 普通 hover 显示 popup")
    .onChange((value: any) => {
      if (value) {
        cesiumIns?.addGeojson(geojsonSource.geojson8);
      } else {
        cesiumIns?.removeGeojson(geojsonSource.geojson8);
      }
    });

  geojsonControl9 = imgFolder
    .add(mapContrl, "geojson9")
    .name("9 上海 Data 单击显示 popup 且回调")
    .onChange((value: any) => {
      if (value) {
        cesiumIns?.addGeojson(geojsonSource.geojson9);
      } else {
        cesiumIns?.removeGeojson(geojsonSource.geojson9);
      }
    });

  geojsonControl10 = imgFolder
    .add(mapContrl, "geojson10")
    .name("10 昆明 自定义数据 样式")
    .onChange((value: any) => {
      if (value) {
        cesiumIns?.addGeojson(geojsonSource.geojson10);
      } else {
        cesiumIns?.removeGeojson(geojsonSource.geojson10);
      }
    });
}
</script>

<style lang="scss" scoped></style>
