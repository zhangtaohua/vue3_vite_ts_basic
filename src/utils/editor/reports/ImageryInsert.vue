<template>
  <div class="col_nw_fs_center rj_rpt_im_wraper">
    <div class="row_nw_fs_center rj_rpt_tips_t">请输入信息查询影像：</div>
    <div class="row_nw_fs_center rj_rpt_im_t">
      <span class="row_nw_fs_center rj_rpt_im_tl">平台:</span>
      <PlatformIn v-model:value="search.platformUuid" :defaultSelect="false"></PlatformIn>
    </div>
    <div class="row_nw_fs_center rj_rpt_im_t">
      <span class="row_nw_fs_center rj_rpt_im_tl">卫星:</span>
      <SatelliteIn v-model:value="search.satelliteName" :defaultSelect="false"></SatelliteIn>
    </div>
    <div class="row_nw_fs_center rj_rpt_im_t">
      <span class="row_nw_fs_center rj_rpt_im_tl">标注:</span>
      <a-radio-group v-model:value="search.isAnnotation" :options="searchOptions.isAnnotation" />
    </div>
    <div class="row_nw_fs_center rj_rpt_im_t">
      <span class="row_nw_fs_center rj_rpt_im_tl">名称:</span>
      <a-input v-model:value="search.name" placeholder="请输入" />
    </div>
    <div class="row_nw_fs_center rj_rpt_im_t">
      <span class="row_nw_fs_center rj_rpt_im_tl">经度:</span>
      <a-input v-model:value="search.longitude" placeholder="请输入" />
    </div>
    <div class="row_nw_fs_center rj_rpt_im_t">
      <span class="row_nw_fs_center rj_rpt_im_tl">纬度:</span>
      <a-input v-model:value="search.latitude" placeholder="请输入" />
    </div>
    <div class="row_nw_fs_center rj_rpt_im_t">
      <span class="row_nw_fs_center rj_rpt_im_tl">期号:</span>
      <a-input v-model:value="search.issueNumber" placeholder="请输入" />
    </div>
    <div class="row_nw_fs_center rj_rpt_im_t">
      <span class="row_nw_fs_center rj_rpt_im_tl">时间:</span>
      <a-range-picker
        v-model:value="search.timeRange"
        :format="dateFormat"
        :getPopupContainer="getAntdvPopupContainer"
      />
    </div>

    <div class="row_nw_fe_center rj_rpt_im_t">
      <a-button type="primary" size="medium" @click="searchImageHandle">
        <template #icon><SearchOutlined /></template>
        查询
      </a-button>
      <div class="w_16r"></div>
      <a-button type="primary" size="medium" ghost @click="resetSearchImageHandle">
        <template #icon><UndoOutlined /></template>
        重置
      </a-button>
    </div>

    <div class="h_32r"></div>
    <div v-if="search.result.length" class="col_nw_fs_fs rj_rpt_im_r">
      <div class="row_nw_fs_center rj_rpt_im_rt">影像查询结果：</div>
      <div class="h_8r"></div>
      <div class="row_nw_fs_center rj_rpt_im_rlist">
        <div v-for="(imgsrc, index) in search.result" :key="'imr_' + index" class="col_nw_fs_center rj_rpt_im_rit">
          <img
            class="rj_rpt_im_ritimg"
            :src="`${imgsrc?.preview}?token=${authToken}`"
            alt="imagery"
            @click="getImagerysGeojsonReqHandle(imgsrc)"
          />
          <div v-show="imgsrc.issue" class="row_nw_fs_center rj_rpt_im_ritlabel">{{ imgsrc.issue }}</div>
          <div v-show="imgsrc.platformName" class="row_nw_fs_center rj_rpt_im_ritlabel">{{ imgsrc.platformName }}</div>
          <div v-show="imgsrc.satellite" class="row_nw_fs_center rj_rpt_im_ritlabel">{{ imgsrc.satellite }}</div>
        </div>
      </div>
    </div>

    <div class="h_32r"></div>
    <div v-if="search.isShowGeojson === 1" class="col_nw_fs_fs rj_rpt_im_geo">
      <div class="row_nw_fs_center rj_rpt_im_rt">标注信息：</div>
      <div class="h_8r"></div>
      <div class="col_nw_fs_center rj_rpt_im_geolist">
        <a-radio-group
          v-model:value="search.currentGeoUUid"
          :options="search.geoResultOptions"
          @change="imageryGeojsonSelectHandle"
        />
      </div>
    </div>
    <div v-else-if="search.isShowGeojson < 0" class="col_nw_fs_fs rj_rpt_im_geo">
      <div class="row_nw_fs_center rj_rpt_im_rt">标注信息：</div>
      <div class="h_8r"></div>
      <div v-if="search.isShowGeojson === -1" class="row_nw_center_center rj_rpt_im_geo_warn">没有标注数据</div>
      <div v-else class="row_nw_center_center rj_rpt_im_geo_err">opps~!~, 请重试</div>
    </div>

    <div class="h_32r"></div>
    <div v-if="tableInfo.isShow" class="col_nw_fs_fs rj_rpt_im_table">
      <div class="row_nw_fs_center rj_rpt_im_rt">使用配置：</div>
      <div class="row_nw_fs_center rj_rpt_im_t">
        <span class="row_nw_fs_center rj_rpt_im_tl">标题:</span>
        <a-input v-model:value="selectedInfo.title" placeholder="请输入" />
      </div>
      <div class="row_nw_fs_center rj_rpt_im_t">
        <span class="row_nw_fs_center rj_rpt_im_tl">图注:</span>
        <a-input v-model:value="selectedInfo.label" placeholder="请输入" />
      </div>
      <div class="row_nw_fs_center rj_rpt_im_t">
        <span class="row_nw_fs_center rj_rpt_im_tl">宽度(cm):</span>
        <a-input v-model:value="selectedInfo.width" placeholder="请输入" @blur="imageryWHHandle('width')" />
      </div>
      <div class="row_nw_fs_center rj_rpt_im_t">
        <span class="row_nw_fs_center rj_rpt_im_tl">高度(cm):</span>
        <a-input v-model:value="selectedInfo.height" placeholder="请输入" @blur="imageryWHHandle('height')" />
      </div>
      <div class="row_nw_fs_center rj_rpt_im_t">
        <span class="row_nw_fs_center rj_rpt_im_tl">影像:</span>
        <a-radio-group v-model:value="selectedInfo.isUseImagery" :options="isUseImageryOptions" />
      </div>
      <div class="rj_rpt_im_tbox">
        <a-table
          bordered
          :dataSource="tableInfo.rowData"
          :columns="tableInfo.columns"
          :pagination="false"
          :scroll="{
            x: true,
            y: 360,
          }"
        >
          <template #headerCell="{ column }">
            <template v-if="column.key !== 'operationAction'">
              <a-checkbox v-model:checked="column.isColumnUsed"></a-checkbox>
              {{ column.title }}
            </template>
          </template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'operationAction'">
              <a-radio-group
                v-model:value="record.isRjRjRjUseFeatues"
                :options="isUseImageryOptions"
                @change="geojsonUsedHandle(record)"
              />
            </template>
          </template>
        </a-table>
      </div>
      <div class="h_64r"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, reactive, nextTick } from "vue";
import lodash from "lodash";

import { SearchOutlined, UndoOutlined } from "@ant-design/icons-vue";
import dayjs from "dayjs";
// import type { Dayjs } from "dayjs";
import { getAntdvPopupContainer } from "@/utils/common/antdvPositionFixed";

import { useReportModuleVnodeStore } from "@/stores/reports";

// import PlatformIn from "@/components/forms/PlatformIn.vue";
// import SatelliteIn from "@/components/forms/SatelliteIn.vue";

import { getImagerysRequest, getGeojsonsRequest } from "@/api/platform";

// import { getAuthToken } from "@/composables/useAuth";

// const authToken = getAuthToken().accessToken;
const dateFormat = "YYYY-MM-DD";
const currentModuleVnode = useReportModuleVnodeStore();
const search = reactive({
  platformUuid: null,
  satelliteName: null,
  isAnnotation: 0,
  name: "",
  longitude: "",
  latitude: "",
  issueNumber: "",
  timeRange: [],
  result: [],
  geoResult: {},
  geoResultOptions: [],
  currentGeoUUid: "",
  isShowGeojson: 0,
  isRefresh: 1,
});

const searchOptions = reactive({
  isAnnotation: [
    { label: "全影像", value: 0 },
    { label: "已矢量标注", value: 1 },
    { label: "未矢量标注", value: 2 },
  ],
});

// 测试字段
function initOptions() {
  const vnode = lodash.cloneDeep(currentModuleVnode.reportModule.vnode);
  console.log("isRefresh imageComparator", vnode);
  if (!vnode.node.isHasData) {
    return;
  }
  const node = vnode.node;
  nextTick(() => {
    selectedInfo.imagery = node.imagery || {};
    selectedInfo.isUseImagery = node.isUseImagery || true;

    selectedInfo.title = node.title || "";
    selectedInfo.label = node.label || "";

    selectedInfo.width = node.width || "20";
    selectedInfo.height = node.height || "20";

    selectedInfo.geojson = node.geojson || {};

    tableInfo.columns = node.columns || [];
    tableInfo.rowData = node.rowData || [];
    if (tableInfo.rowData.length) {
      tableInfo.isShow = true;
    } else {
      tableInfo.isShow = false;
    }
  });
}

watch(
  () => currentModuleVnode.reportModule.isRefresh,
  () => {
    initOptions();
  },
  {
    deep: true,
    immediate: true,
  },
);

function searchImageHandle() {
  const reqData = {
    page: 0,
    pagesize: 100,
    issue: search.issueNumber,
    platformUuid: search.platformUuid,
    marked: search.isAnnotation,
    name: search.name,
    satelliteName: search.satelliteName,
    status: "stored",
  };

  console.log("searchImageHandle", reqData, search);
  getImagerysRequest(reqData)
    .then((res: any) => {
      console.log("getImagerysRequest OK", res);
      if (res.code === 0 && res.data && res.data.list && res.data.list.length) {
        const dataTemp = res.data.list.filter((imagery: any) => imagery.preview !== "");
        search.result = dataTemp;
      } else {
        search.result = [];
      }
    })
    .catch((err: any) => {
      console.log("getImagerysRequest error", err);
      search.result = [];
    });
}

function resetSearchImageHandle() {
  search.platformUuid = null;
  search.satelliteName = null;
  search.isAnnotation = 0;
  search.name = "";
  search.longitude = "";
  search.latitude = "";
  search.issueNumber = "";
  search.timeRange = [];
  search.result = [];
  search.geoResult = {};
  search.geoResultOptions = [];
  search.currentGeoUUid = "";
  search.isShowGeojson = 0;
  search.isRefresh = 1;
}

const defaultMaxMapWindth = 20;
const defaultMinMapWindth = 10;
const isUseImageryOptions = [
  { label: "使用", value: true },
  { label: "不使用", value: false },
];
const tableInfo = reactive({
  columns: <Array<any>>[],
  rowData: <Array<any>>[],
  isShow: false,
});
const selectedInfo = reactive({
  imagery: {},
  isUseImagery: true,
  title: "",
  label: "",
  width: defaultMaxMapWindth.toString(),
  height: defaultMaxMapWindth.toString(),
  geojson: null,
});

watch(
  [selectedInfo, () => tableInfo.columns],
  () => {
    // 保存到 pinia 中
    updateVnodeData();
  },
  {
    deep: true,
    immediate: false,
  },
);

function updateVnodeData() {
  const vNode = {
    ...currentModuleVnode.reportModule.vnode,
  };
  console.log("updateVnodeData image_insertion", vNode);
  const code = vNode.node.code;
  vNode.node = lodash.cloneDeep(selectedInfo);
  vNode.node.code = code;
  vNode.node.columns = lodash.cloneDeep(tableInfo.columns);
  vNode.node.rowData = lodash.cloneDeep(tableInfo.rowData);
  vNode.node.isHasData = true;
  currentModuleVnode.setModuleVnode(vNode);
}

function getImagerysGeojsonReqHandle(imageryInfo: any) {
  console.log("imageryInfo", imageryInfo);

  if (imageryInfo && imageryInfo.uuid) {
    // 保存到 pinia 中
    selectedInfo.imagery = lodash.cloneDeep(imageryInfo);

    // 下面是请求此影像的 Geojson 数据
    const reqData = {
      // sort: "",
      // order: "",
      page: 0,
      pagesize: 100,
      // platformUuid: search.platformUuid,
      // platformName: "",
      // projectUuid: "",
      // projectName: "",
      // marked: search.isAnnotation,
      // name: search.name,
      // any: "",
      tiffSummaryUuid: imageryInfo.uuid,
    };
    console.log("getImagerysGeojsonReqHandle", reqData, search);

    getGeojsonsRequest(reqData)
      .then((res: any) => {
        console.log("getImagerysGeojsonReqHandle OK", res);
        if (res.code === 0 && res.data && res.data.list && res.data.list.length) {
          const tempResult = {};
          const resultOption = [];
          for (let i = 0; i < res.data.list.length; i++) {
            const { uuid, name } = res.data.list[i];
            resultOption.push({
              label: name ? name : "UUID_: " + uuid,
              value: uuid,
            });
            tempResult[uuid] = res.data.list[i];
          }
          search.geoResult = tempResult;
          search.geoResultOptions = resultOption;
          search.currentGeoUUid = res.data.list[0].uuid;
          search.isShowGeojson = 1;
          // 调用下面函数 将geojson 数据转换成表格数据
          imageryGeojsonSelectHandle();
        } else {
          search.geoResult = {};
          search.geoResultOptions = [];
          search.currentGeoUUid = "";
          search.isShowGeojson = -1;
        }
      })
      .catch((err: any) => {
        console.log("getImagerysGeojsonReqHandle error", err);
        search.geoResult = {};
        search.geoResultOptions = [];
        search.currentGeoUUid = "";
        search.isShowGeojson = -2;
      });
  }
}

//
function imageryGeojsonSelectHandle() {
  // 解决出geojson 文件显示
  if (search.currentGeoUUid) {
    const geojsonParsed = JSON.parse(search.geoResult[search.currentGeoUUid].geojson);
    console.log("geojsonParsed", geojsonParsed);

    // 这里是获取表格的行标题信息
    const columnSet = new Set();
    if (geojsonParsed.features && geojsonParsed.features.length) {
      for (let i = 0; i < geojsonParsed.features.length; i++) {
        const featureOne = geojsonParsed.features[i];
        if (featureOne.properties) {
          const featureOneKeys = Object.keys(featureOne.properties);
          for (let j = 0; j < featureOneKeys.length; j++) {
            columnSet.add(featureOneKeys[j]);
          }
        }
      }
    }
    columnSet.add("geometryType");
    columnSet.add("operationAction");

    const columnsArray: any = [];
    for (let setValue of columnSet.values()) {
      const columnWidths = {
        default: {
          min: 160,
          max: 200,
        },
        operationAction: {
          min: 185,
          max: 240,
        },
      };
      columnsArray.push({
        title: setValue,
        dataIndex: setValue,
        key: setValue,
        isColumnUsed: true,
      });
    }

    tableInfo.columns = columnsArray;
    console.log("columnsArray", columnSet, columnsArray);

    // 处理 表格内容
    const rowData = [];
    if (geojsonParsed.features && geojsonParsed.features.length) {
      for (let i = 0; i < geojsonParsed.features.length; i++) {
        const featureTemp = geojsonParsed.features[i];
        let rowDataTemp = {};
        if (featureTemp.properties) {
          rowDataTemp = lodash.cloneDeep(featureTemp.properties);
          // 在 geojson 中也增加这条属性
          geojsonParsed.features[i].properties.isRjRjRjUseFeatues = true;
        }
        if (!rowDataTemp.key) {
          rowDataTemp.key = i;
        }
        (rowDataTemp["geometryType"] = (featureTemp.geometry && featureTemp.geometry.type) || "null"),
          (rowDataTemp.rjrjrjIndex = i);
        rowDataTemp.isRjRjRjUseFeatues = true;
        const rowDataTempKeys = Object.keys(rowDataTemp);
        for (let setValue of columnSet.values()) {
          if (!rowDataTempKeys.includes(setValue)) {
            if (setValue != "operationAction") {
              rowDataTemp[setValue] = "";
            }
          }
        }
        // 单独处理others
        if (rowDataTemp.others && rowDataTemp.others.length) {
          let tempOtherStr = "";
          let otherLenght = rowDataTemp.others.length;
          for (let ot = 0; ot < otherLenght; ot++) {
            const ottTemp = rowDataTemp.others[ot];
            let otStr = `${ottTemp.key} : ${ottTemp.value}`;
            if (ot != otherLenght - 1) {
              otStr = otStr + "  #  ";
            }
            tempOtherStr = tempOtherStr + otStr;
          }
          rowDataTemp.others = tempOtherStr;
        }
        rowData.push(rowDataTemp);
      }
    }

    tableInfo.rowData = rowData;
    tableInfo.isShow = true;
    selectedInfo.geojson = geojsonParsed;

    console.log("geojsonParsed", geojsonParsed, tableInfo);
  }
}

// 处理配置项中输入的 宽度 和 高度 参数
function imageryWHHandle(which: string) {
  if (which === "width") {
    let width = parseInt(selectedInfo.width);
    if (isNaN(width)) {
      width = defaultMaxMapWindth;
    } else if (width > defaultMaxMapWindth) {
      width = defaultMaxMapWindth;
    } else if (width < defaultMinMapWindth) {
      width = defaultMinMapWindth;
    }
    selectedInfo.width = width.toString();
  } else if (which === "height") {
    let height = parseInt(selectedInfo.height);
    if (isNaN(height)) {
      height = defaultMaxMapWindth;
    } else if (height > defaultMaxMapWindth) {
      height = defaultMaxMapWindth;
    } else if (height < defaultMinMapWindth) {
      height = defaultMinMapWindth;
    }
    selectedInfo.width = height.toString();
  }
}

// 处理 那一行 geojson 数据被使用。
function geojsonUsedHandle(record: any) {
  console.log("geojsonUsedHandle", record);
  const index = record.rjrjrjIndex;
  const isUseed = record.isRjRjRjUseFeatues;
  if (selectedInfo.geojson && selectedInfo.geojson.features[index]) {
    selectedInfo.geojson.features[index].properties.isRjRjRjUseFeatues = isUseed;
  }
}
</script>

<style scoped lang="scss">
.rj_rpt_im_wraper {
  width: 100%;
  height: 100%;
  scrollbar-width: none;
  -ms-overflow-style: none;
  overflow-x: overlay;
  overflow-y: scroll;
  scroll-behavior: smooth;
}

.rj_rpt_im_wraper::-webkit-scrollbar {
  display: none;
}

.rj_rpt_tips_t {
  flex-shrink: 0;
  width: 96%;
  height: 2rem;
  margin-bottom: 1rem;
  color: #333;
  font-size: 0.875rem;
}

.rj_rpt_im_t {
  flex-shrink: 0;
  width: 96%;
  height: 2.5rem;
}

.rj_rpt_im_tl {
  flex-shrink: 0;
  width: 5rem;
  height: 100%;
  font-size: 1rem;
}

.rj_rpt_im_r {
  width: 96%;
  height: auto;
}

.rj_rpt_im_rt {
  width: 100%;
  height: 2rem;
  margin-bottom: 1rem;
  color: #333;
  font-size: 0.875rem;
}

.rj_rpt_im_rlist {
  width: 100%;
  height: 30rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
  overflow-x: scroll;
  overflow-y: overlay;
  scroll-behavior: smooth;
}

.rj_rpt_im_rit {
  width: auto;
  height: 100%;
  margin-right: 1rem;
}

.rj_rpt_im_rit:focus {
  border: 1px solid #40a9ff;
}

.rj_rpt_im_ritimg {
  width: auto;
  height: calc(100% - 7rem);
  margin-bottom: 0.5rem;
}

.rj_rpt_im_ritlabel {
  width: max-content;
  height: 2rem;
  color: #333;
  font-size: 0.875rem;
}

.rj_rpt_im_i {
  flex-wrap: wrap;
  width: 96%;
  height: auto;
}

.rj_rpt_im_geo {
  width: 96%;
  height: auto;
  margin-top: 2rem;
}

.rj_rpt_im_geo_warn {
  width: 100%;
  height: 3rem;
  color: #faad14;
  font-size: 1.5rem;
}

.rj_rpt_im_geo_err {
  width: 100%;
  height: 3rem;
  color: #ff4d4f;
  font-size: 1.5rem;
}

.rj_rpt_im_table {
  width: 96%;
  height: auto;
  margin-top: 2rem;
}

.rj_rpt_im_tbox {
  width: 100%;
  height: auto;
}
</style>
