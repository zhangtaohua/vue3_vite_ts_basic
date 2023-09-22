<template>
  <div class="col_nw_fs_center wh_100p_100p">
    <div class="row_nw_center_center rj_rpt_module_title">工具箱</div>
    <div class="col_nw_fs_center rj_rpt_module_w">
      <div v-for="report in reportsModule" :key="report.id" class="row_nw_fs_center rj_rpt_module_i">
        <div class="row_nw_center_center rj_rpt_module_icon">
          <component :is="report.icon" />
        </div>
        <div class="row_nw_fs_center rj_rpt_module_it" :class="{ rj_rpt_module_it_dis: !report.isEnable }">
          {{ report.name }}
        </div>
        <div
          :draggable="report.isEnable"
          class="rj_rpt_module_itm"
          :class="{ rj_rpt_module_itm_dis: !report.isEnable }"
          @dragstart="moduleDragstartHandle(report.code)"
          @drag="moduleDragHandle"
          @dragend="moduleDragendHandle"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reportsModule } from "./reportsMeta";
import { useReportModuleCodeStore } from "@/stores/reports";
const reportModuleCode = useReportModuleCodeStore();

// 此处传入并记录了 模块的 code
function moduleDragstartHandle(report: string) {
  reportModuleCode.setCode(report);
  // 暂时不在这里刷新显示，而是在拖拽完成后再刷新显示
  // reportModuleCode.setRefresh();
  return true;
}
function moduleDragHandle() {
  return true;
}
function moduleDragendHandle() {
  return true;
}
</script>

<style scoped>
.rj_rpt_module_title {
  width: 100%;
  height: 60px;
  margin-top: 60px;
  font-size: 24px;
}

.rj_rpt_module_w {
  width: 100%;
  height: auto;
}

.rj_rpt_module_i {
  position: relative;
  width: 100%;
  height: 40px;
}

.rj_rpt_module_icon {
  width: 40px;
  height: 40px;
}

.rj_rpt_module_it {
  width: calc(100% - 40px);
  height: 100%;
  font-size: 16px;
}

.rj_rpt_module_it_dis {
  color: #666;
  font-size: 12px;
}

.rj_rpt_module_itm {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.rj_rpt_module_itm_dis {
  cursor: default;
}
</style>
