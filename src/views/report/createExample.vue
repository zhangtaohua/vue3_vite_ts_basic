<template>
  <div class="row_nw_sb_fs rj_rpt_module_wraper">
    <div class="row_nw_sb_fs rj_rpt_module_tools">
      <ReportsModules />
    </div>

    <div class="row_nw_sb_fs rj_rpt_module_preview">
      <ReportsCreatePreview />
    </div>

    <div class="row_nw_sb_fs rj_rpt_module_config">
      <ReportsConfig />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import ReportsModules from "@/utils/editor/reports/ReportsModules.vue";
import ReportsCreatePreview from "@/utils/editor/reports/ReportsCreatePreview.vue";
import ReportsConfig from "@/utils/editor/reports/ReportsConfig.vue";
</script>

<style scoped>
.rj_rpt_module_wraper {
  position: relative;
  width: 100%;
  height: 100%;
  scrollbar-width: none;
  -ms-overflow-style: none;
  overflow: hidden;
  scroll-behavior: smooth;
}

.rj_rpt_module_wraper::-webkit-scrollbar {
  display: none;
}

.rj_rpt_module_tools {
  width: 160px;
  height: 100%;
  background-color: white;
}

.rj_rpt_module_preview {
  flex-grow: 1;
  width: auto;
  min-width: 23cm;
  height: 100%;
  background-color: blanchedalmond;
}

.rj_rpt_module_config {
  width: 900px;
  min-width: 900px;
  height: 100%;
  background-color: white;
}

.rj_rpt_module_mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgb(0 0 0 / 45%);
}
</style>
