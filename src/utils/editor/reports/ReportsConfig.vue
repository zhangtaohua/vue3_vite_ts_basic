<template>
  <div class="col_nw_fs_center wh_100p_100p">
    <div class="row_nw_fs_center rj_rpt_config_title">
      {{ currentModuleVnode.reportModule.vnode.props.tool.name }}配置项：
    </div>
    <div class="col_nw_fs_center rj_rpt_config_work">
      <div class="col_nw_fs_center rj_rpt_config_c">
        <component :is="currentTool" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, shallowRef, watch } from "vue";
import { reportsNameCode } from "./reportsMeta";
import BlankFixed from "./BlankFixed.vue";

import RichEditor from "./RichEditor.vue";
// import EchartsLine from "./EchartsLine.vue";
// import EchartsBar from "./EchartsBar.vue";
// import EchartsPie from "./EchartsPie.vue";
// import EchartsScatter from "./EchartsScatter.vue";
// import ImageryComparator from "./ImageryComparator.vue";

// import ImageryAnnotation from "./ImageryAnnotation.vue";
// import ImageryInsert from "./ImageryInsert.vue";

import { useReportModuleCodeStore, useReportModuleVnodeStore } from "@/stores/reports";

const reportsCodeModule = {
  [reportsNameCode.blank_bug_fixed]: BlankFixed,
  [reportsNameCode.rich_editor]: RichEditor,
  // [reportsNameCode.image_comparison]: ImageryComparator,

  // [reportsNameCode.echarts_line]: EchartsLine,
  // [reportsNameCode.echarts_bar]: EchartsBar,
  // [reportsNameCode.echarts_pie]: EchartsPie,
  // [reportsNameCode.echarts_scatter]: EchartsScatter,

  // [reportsNameCode.image_annotation]: ImageryAnnotation,
  // [reportsNameCode.image_insertion]: ImageryInsert,
};

const currentReportModuleCode = useReportModuleCodeStore();
const currentModuleVnode = useReportModuleVnodeStore();
const currentTool = shallowRef<any>(BlankFixed);

watch(
  () => currentReportModuleCode.isRefresh,
  () => {
    updateConfigTool(currentReportModuleCode.code);
  },
  {
    deep: true,
    immediate: false,
  },
);

function updateConfigTool(code: string) {
  // fixed 两个富文本组件之间切换的bug!!!!
  currentTool.value = reportsCodeModule[reportsNameCode.blank_bug_fixed];
  nextTick(() => {
    currentTool.value = reportsCodeModule[code];
  });
}
</script>

<style scoped>
.rj_rpt_config_title {
  width: 100%;
  height: 60px;
  margin-top: 16px;
  padding-left: 1rem;
  font-size: 24px;
}

.rj_rpt_config_work {
  width: 100%;
  height: calc(100% - 76px);
}

.rj_rpt_config_c {
  width: 100%;
  height: 100%;
  scrollbar-width: none;
  -ms-overflow-style: none;
  overflow-x: overlay;
  overflow-y: scroll;
  scroll-behavior: smooth;
}

.rj_rpt_config_c::-webkit-scrollbar {
  display: none;
}
</style>
