<template>
  <div v-if="isShow" class="row_nw_center_center rj_rpt_module_wraper">
    <div class="col_nw_fs_center rj_rpt_im_wraper">
      <div class="row_nw_fs_center rj_rpt_tips_t" @click="onclose">请输入信息查询影像：</div>
      <div class="row_nw_fs_center rj_rpt_im_t">
        <span class="row_nw_fs_center rj_rpt_im_tl">平台:</span>
        <a-input v-model:value="search.platformUuid" placeholder="请输入" />
      </div>
      <div class="row_nw_fs_center rj_rpt_im_t">
        <span class="row_nw_fs_center rj_rpt_im_tl">卫星:</span>
        <a-input v-model:value="search.satelliteName" placeholder="请输入" />
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { SearchOutlined, UndoOutlined } from "@ant-design/icons-vue";
import { getAntdvPopupContainer } from "@/utils/common/antdvPositionFixed";
import { wangEditorOlMapType, OlMapElement } from "@/utils/editor/plugin/ol/custom-types";

const props = defineProps({
  vNodeData: {
    type: Object,
    default() {
      return {};
    },
  },
});

const isShow = ref(false);
const dateFormat = "YYYY-MM-DD";
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

// setInterval(() => {
//   console.log("modelTest");
// }, 5000);

let editor: any = null;

const onShow = (editorIns: any) => {
  console.log("onShow", isShow.value, editorIns);
  const children = editorIns.children;
  const length = children.length;
  const lastChild = editorIns.children[length - 1];
  console.log("onShow", editorIns.getNodePosition(lastChild));
  editor = editorIns;
  isShow.value = true;
};

function onclose() {
  isShow.value = false;
}

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
  // editor.insertText(" 你是不是二呀！ ");
  onclose();
  const olElementTag: OlMapElement = {
    type: wangEditorOlMapType,
    title: "OLTest",
    link: "www.baidu.com",
    geojson: null,
    children: [{ text: "" }],
  };
  editor.insertNode(olElementTag);

  // getImagerysRequest(reqData)
  //   .then((res: any) => {
  //     console.log("getImagerysRequest OK", res);
  //     if (res.code === 0 && res.data && res.data.list && res.data.list.length) {
  //       const dataTemp = res.data.list.filter((imagery: any) => imagery.preview !== "");
  //       search.result = dataTemp;
  //     } else {
  //       search.result = [];
  //     }
  //   })
  //   .catch((err: any) => {
  //     console.log("getImagerysRequest error", err);
  //     search.result = [];
  //   });
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

defineExpose({
  showModal: onShow,
  hideModal: onclose,
});
</script>

<style scoped>
.rj_rpt_module_wraper {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99999;
  width: 100vw;
  height: 100vh;
  background: rgb(0 0 0 / 50%);
}

.rj_rpt_im_wraper {
  width: 96%;
  height: 96%;
  overflow-x: overlay;
  overflow-y: scroll;
  background: #fff;
  scrollbar-width: none;
  -ms-overflow-style: none;
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
