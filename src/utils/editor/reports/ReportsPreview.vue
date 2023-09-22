<template>
  <div class="col_nw_fs_center wh_100p_100p">
    <div class="row_nw_center_center rj_rpt_preview_title">
      {{ renderData.title }}
    </div>
    <div v-if="renderData.hasData" class="col_nw_fs_center rj_rpt_preview_work">
      <div class="col_nw_fs_center rj_rpt_preview_c">
        <!-- 顶装饰 -->
        <div class="row_nw_sb_center rj_rpt_preview_dcb">
          <div class="rj_rpt_preview_dcg"></div>
          <div class="rj_rpt_preview_dcg"></div>
        </div>
        <!-- 主要内容渲染 -->
        <div class="col_nw_fs_center rj_rpt_preview_rc">
          <div
            v-for="order in renderData.order"
            :key="renderData.vnodes[order].props.id"
            class="row_nw_fs_center rj_rpt_preview_m"
          >
            <component
              :is="reportsCodePreview[renderData.vnodes[order].node.code]"
              :configData="renderData.vnodes[order]"
            />
          </div>
        </div>
        <!-- 底部装饰 -->
        <div class="row_nw_sb_center rj_rpt_preview_dcb">
          <div class="rj_rpt_preview_dcg"></div>
          <div class="rj_rpt_preview_dcg"></div>
        </div>
      </div>
    </div>
    <div v-else class="col_nw_fs_center rj_rpt_preview_work">
      <div class="row_nw_center_center rj_rpt_preview_nodata">
        {{ renderData.message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, defineProps, watch } from "vue";
import RichEditorPreviewVue from "./RichEditorPreview.vue";
import EchartsLinePreview from "./EchartsLinePreview.vue";
import EchartsBarPreview from "./EchartsBarPreview.vue";
import EchartsPiePreview from "./EchartsPiePreview.vue";
import EchartsScatterPreview from "./EchartsScatterPreview.vue";
import ImageryComparatorPreview from "./ImageryComparatorPreview.vue";
import ImageryInsertPreview from "./ImageryInsertPreview.vue";

// import { getUuidReportsData } from "@/api/reportsManagement";

import { reportsNameCode } from "./reportsMeta";

const props = defineProps({
  reportuuid: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "report",
  },
});

const reportsCodePreview = {
  [reportsNameCode.rich_editor]: RichEditorPreviewVue,
  [reportsNameCode.image_comparison]: ImageryComparatorPreview,

  [reportsNameCode.echarts_line]: EchartsLinePreview,
  [reportsNameCode.echarts_bar]: EchartsBarPreview,
  [reportsNameCode.echarts_pie]: EchartsPiePreview,
  [reportsNameCode.echarts_scatter]: EchartsScatterPreview,

  [reportsNameCode.image_insertion]: ImageryInsertPreview,
};

const renderData = reactive({
  title: "",
  order: [],
  vnodes: {},
  hasData: false,
  message: "",
});

function resetRenderData(message: string) {
  renderData.title = "";
  renderData.vnodes = {};
  renderData.order = [];
  renderData.hasData = false;
  renderData.message = message;
}

// function getReportByUuidRequest() {
//   if (props.reportuuid) {
//     const reqData = {
//       uuid: props.reportuuid,
//     };
//     getUuidReportsData(reqData)
//       .then((res: any) => {
//         console.log("getReportByUuidRequest ok", res);
//         if (res.code == 0 && res.data && res.data.reportData) {
//           const reportData = res.data.reportData;

//           renderData.title = res.data.name;
//           renderData.vnodes = reportData.vnodes;
//           renderData.order = reportData.order;
//           renderData.hasData = true;
//         } else {
//           resetRenderData("暂无数据");
//         }
//       })
//       .catch((err: any) => {
//         console.log("getReportByUuidRequest err", err);
//         resetRenderData("请求出错,请重试");
//       });
//   } else {
//     resetRenderData("暂无数据");
//   }
// }

watch(
  () => props.reportuuid,
  () => {
    if (props.reportuuid) {
      // getReportByUuidRequest();
    }
  },
  {
    immediate: true,
  },
);
</script>

<style scoped>
.rj_rpt_preview_title {
  width: 100%;
  height: 60px;
  margin-top: 16px;
  font-size: 24px;
}

.rj_rpt_preview_work {
  width: 100%;
  height: calc(100% - 76px);
}

.rj_rpt_preview_c {
  width: 23cm;
  height: 98%;
  background-color: rgb(255 255 255 / 80%);
}

.rj_rpt_preview_dcb {
  width: 100%;
  height: 1cm;
}

.rj_rpt_preview_dcg {
  width: 1cm;
  height: 1cm;
  background-color: rgb(0 0 0 / 10%);
}

.rj_rpt_preview_rc {
  width: 21cm;
  height: calc(100% - 2cm);
  overflow-x: overlay;
  overflow-y: scroll;
  background-color: rgb(255 255 255 / 80%);
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
}

.rj_rpt_preview_rc::-webkit-scrollbar {
  display: none;
}

.rj_rpt_preview_m {
  position: relative;
  width: 100%;
  height: auto;
}

.rj_rpt_preview_m:hover {
  outline: 1px solid rgb(0 0 0 / 50%);
}

.rj_rpt_preview_nodata {
  width: 100%;
  height: 200px;
  color: #faad14;
  font-weight: bold;
  font-size: 2rem;
}
</style>
