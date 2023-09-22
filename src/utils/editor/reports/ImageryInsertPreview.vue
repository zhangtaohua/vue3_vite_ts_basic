<template>
  <div class="col_nw_fs_center wh_100p_100p">
    <div v-if="!imageryView.isShow" class="row_nw_center_center rj_rpt_iis_tap_box">
      <span class="row_nw_center_center rj_rpt_iis_tap_tl">影像插入占位</span>
      <div class="h_16r"></div>
    </div>
    <div v-else class="col_nw_fs_fs rj_rpt_iis_box">
      <div class="row_nw_fs_center rj_rpt_iis_title">
        <span class="row_nw_fs_center rj_rpt_iis_tl">{{ imageryView.info.title }}</span>
      </div>
      <div class="h_16r"></div>
      <div class="row_nw_center_center rj_rpt_iis_mapbox" :style="mapStyle" @click.prevent.stop="() => {}">
        <div v-if="mapIsLock" class="rj_rpt_map_mask"></div>
        <div class="row_nw_center_center rj_rpt_map_lock">
          <a-button type="primary" shape="circle" @click="toggleMapLockHandle">
            <template v-if="mapIsLock" #icon><LockOutlined /></template>
            <template v-else #icon><UnlockOutlined /></template>
          </a-button>
        </div>
        <div :id="mapId" class="wh_100p_100p"></div>
      </div>
      <div class="h_16r"></div>
      <div class="row_nw_center_center rj_rpt_iis_label_box">
        <span class="row_nw_center_center rj_rpt_iis_label">{{ imageryView.info.label }}</span>
      </div>
      <div v-show="imageryView.info.rowData.length" class="rj_rpt_iis_tablebox">
        <a-table
          bordered
          :dataSource="imageryView.info.rowData"
          :columns="imageryView.info.columns"
          :pagination="false"
        />
      </div>
      <div class="h_16r"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, watch, reactive, ref, onMounted, onUnmounted, nextTick } from "vue";

import { LockOutlined, UnlockOutlined } from "@ant-design/icons-vue";

import lodash from "lodash";
import { nanoid } from "nanoid";

import OpenLayersBase from "@/composables/ol/base";
import wmtsLayers from "@/composables/ol/wmtsLayers";
import geojsonLayers from "@/composables/ol/geojsonLayers";

import { useReportOLMapStore } from "@/stores/reports";

// import { getAuthToken } from "@/composables/useAuth";

// const authToken = getAuthToken().accessToken;

const defaultMapWidth = 20;
const mapId = "map_" + nanoid(12);

const props = defineProps({
  configData: {
    type: Object,
    default() {
      return {
        node: {},
      };
    },
  },
});

const imageryView = reactive({
  info: {
    title: "",
    label: "影像标注信息如下所示",
    geojson: null,
    columns: null,
    rowData: null,
    wms: "",
    extent: [],
    isUseImagery: true,
  },
  isShow: false,
});

const mapIsLock = ref(true);

const mapStyle = reactive({
  width: defaultMapWidth + "cm",
  heigh: defaultMapWidth + "cm",
});

function toggleMapLockHandle() {
  mapIsLock.value = !mapIsLock.value;
}

function updateImageryInsertOptions() {
  console.log("image_insert_preview", props.configData);
  if (props.configData && props.configData.node && props.configData.node.isHasData) {
    const { node } = props.configData;
    const info = {};
    info.title = node.title;
    info.label = node.label;
    info.geojson = lodash.cloneDeep(node.geojson);

    const columnsShow = node.columns.filter((columnRow: any) => {
      return columnRow.key != "operationAction" && columnRow.isColumnUsed;
    });
    info.columns = columnsShow;

    // info.rowData = lodash.cloneDeep(node.rowData);
    info.rowData = node.rowData.filter((rowData: any) => {
      return rowData.isRjRjRjUseFeatues;
    });

    info.wms = node.imagery.wms;
    info.extent = node.imagery.extent;
    info.isUseImagery = node.isUseImagery;
    imageryView.info = info;
    imageryView.isShow = true;

    const width = node.width || defaultMapWidth;
    const height = node.height || defaultMapWidth;
    mapStyle.width = width + "cm";
    mapStyle.heigh = height + "cm";
  }
}

let baseMapHander = null;
let isCreateBaseHander = false;

let WmtsHander = null;
let isCreateWmtsHander = false;
const wmtsLayerId = "wmts_layer_id";

let GeojsonHander = null;
let isCreateGeojsonHander = false;
const geojsonLayerId = "geojson_layer_id";

const reportsOLMapStore = useReportOLMapStore();

function updateMapShow() {
  createMapHander();
  if (baseMapHander) {
    if (WmtsHander) {
      WmtsHander.removeLayerByID(wmtsLayerId);
      if (imageryView.info.isUseImagery) {
        // 显示 底图
        const wmtsOptions = {
          url: `${imageryView.info.wms}?token=${authToken}`,
          id: wmtsLayerId,
          name: wmtsLayerId,
          extent: imageryView.info.extent,
        };
        WmtsHander.addLayer(wmtsOptions);
        WmtsHander.fitToView(wmtsOptions);
      }
    }

    if (GeojsonHander) {
      GeojsonHander.removeLayerByID(geojsonLayerId);
      if (imageryView.info.geojson) {
        const geojsonOptions = {
          data: imageryView.info.geojson,
          id: geojsonLayerId,
          name: geojsonLayerId,
          extent: imageryView.info.extent,
        };
        GeojsonHander.addLayer(geojsonOptions);
        GeojsonHander.fitToView(geojsonOptions);
      }
    }
  }
}

function createMapHander() {
  if (!isCreateBaseHander) {
    baseMapHander = new OpenLayersBase(mapId);
    isCreateBaseHander = true;
    // 将 地图实例存入到panio 中 方便生成 图片。
    const parentId = props.configData.props.id;
    if (parentId) {
      reportsOLMapStore.setOLMapInstance(parentId, baseMapHander);
    }
  }
  if (!isCreateWmtsHander && baseMapHander) {
    WmtsHander = new wmtsLayers(baseMapHander);
    isCreateWmtsHander = true;
  }
  if (!isCreateGeojsonHander && baseMapHander) {
    GeojsonHander = new geojsonLayers(baseMapHander);
    isCreateGeojsonHander = true;
  }
}

function destroyMapHander() {
  if (baseMapHander) {
    WmtsHander && WmtsHander.destructor();
    baseMapHander.destructor();
  }
  WmtsHander = null;
  baseMapHander = null;
}

watch(
  imageryView,
  () => {
    if (imageryView.isShow) {
      nextTick(() => {
        updateMapShow();
      });
    }
  },
  {
    deep: true,
    immediate: true,
  },
);

watch(
  () => props.configData,
  () => {
    updateImageryInsertOptions();
  },
  {
    deep: true,
    immediate: true,
  },
);

// onMounted(() => {
//   createMapHander();
// })

onUnmounted(() => {
  destroyMapHander();
});
</script>

<style scoped lang="scss">
.rj_rpt_iis_tap_box {
  width: 96%;
  height: 7.5rem;
}

.rj_rpt_iis_tap_tl {
  width: 100%;
  height: 100%;
  color: #333;
  font-weight: bold;
  font-size: 4rem;
}

.rj_rpt_iis_title {
  width: 100%;
  height: auto;
  margin-bottom: 0.5rem;
}

.rj_rpt_iis_tl {
  width: 100%;
  height: 3rem;
  padding-left: 1rem;
  color: black;
  font-size: 1.5rem;
}

.rj_rpt_iis_mapbox {
  position: relative;
  width: 20cm;
  height: 20cm;
  border: 1px solid #333;
}

.rj_rpt_map_mask {
  position: absolute;
  z-index: 2;
  width: 100%;
  height: 100%;
}

.rj_rpt_map_lock {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 3;
  width: 2rem;
  height: 2rem;
}

.rj_rpt_iis_label_box {
  width: 100%;
  height: auto;
  margin-bottom: 0.5rem;
}

.rj_rpt_iis_label {
  flex-wrap: wrap;
  width: 100%;
  height: auto;
  color: #333;
  font-size: 0.75rem;
  text-align: center;
}

.rj_rpt_iis_tablebox {
  width: 100%;
  height: auto;
}

.rj_rpt_iis_box {
  width: 96%;
  height: auto;
}
</style>
