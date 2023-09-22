<template>
  <div class="col_nw_fs_center wh_100p_100p">
    <div class="row_nw_fs_center rj_rpt_ian_title">
      <span class="row_nw_center_center rj_rpt_ian_tl">重要说明</span>
    </div>
    <div class="rj_rpt_ina_label">
      由于影像标注功能过于复杂，请先保存文档。然后点击右侧
      <span class="rj_rpt_ina_labelb">影像</span> 菜单。 进入影像管理进行相应操作。操作完成后，再通过
      <span class="rj_rpt_ina_labelb">影像插入</span>
      功能编辑文档。 给您带来不便，请谅解，谢谢！
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";

import { useReportModuleVnodeStore } from "@/stores/reports";

const currentModuleVnode = useReportModuleVnodeStore();

// 测试字段
function initTitleHtml() {
  console.log("isRefresh editor");
}

watch(
  () => currentModuleVnode.reportModule.isRefresh,
  () => {
    initTitleHtml();
  },
  {
    deep: true,
    immediate: true,
  },
);
</script>

<style scoped lang="scss">
.rj_rpt_ian_title {
  width: 96%;
  height: 3.75rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.rj_rpt_ian_tl {
  width: 100%;
  height: 100%;
  font-weight: bold;
  font-size: 2rem;
}

.rj_rpt_ina_label {
  width: 96%;
  height: auto;
  font-size: 1.25rem;
  line-height: 3rem;
}

.rj_rpt_ina_labelb {
  color: #40a9ff;
  font-weight: bold;
}
</style>
