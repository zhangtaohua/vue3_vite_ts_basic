<template>
  <div class="col_nw_fs_fs rj_rpt_line_preview_w">
    <div class="row_nw_fs_center rj_rpt_line_preview_t">
      {{ configData.node.title }}
    </div>
    <div class="row_nw_fs_center rj_rpt_line_preview_c">
      <EchartsOptionBase :echartsId="echartsId" :echartsOptions="echartsOptions" />
    </div>
    <div class="row_nw_center_center rj_rpt_line_preview_l">
      {{ configData.node.name }}
    </div>

    <div class="rj_rpt_line_preview_s" v-html="configData.node.conclusion"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, defineProps } from "vue";
import EchartsOptionBase from "@/components/echarts/EchartsOptionBase.vue";

import { EchartsPieType, simplePieOptions, pieSeriesOptions, circleSeriesOptions } from "@/common/echarts/pieOptions";
import lodash from "lodash";
import { nanoid } from "nanoid";

const props = defineProps({
  configData: {
    type: Object,
    default() {
      return {};
    },
  },
});

const echartsId = ref("echarts_par_" + nanoid(10));
const echartsOptions = reactive({
  isHasData: true,
  parentId: "",
  options: lodash.cloneDeep(simplePieOptions),
});

watch(
  () => props.configData,
  (newValue, oldValue) => {
    updateEchartsOptions(newValue, oldValue);
  },
  {
    deep: true,
    immediate: true,
  },
);

// 查看数据是否需要更新
function checkUpdateEchartsOptions(newData: any, oldData: any): boolean {
  if (!oldData) {
    return true;
  } else {
    const xKeys = ["pie_type"];
    const yKeys = ["name", "value"];
    for (let i = 0; i < xKeys.length; i++) {
      const compKey = xKeys[i];
      if (newData[compKey] != oldData[compKey]) {
        return true;
      }
    }
    const yNewData = newData.dataset;
    const yOldData = oldData.dataset;
    if (!yOldData.length) {
      return true;
    } else if (yNewData.length != yOldData.length) {
      return true;
    }
    for (let ind = 0; ind < yNewData.length; ind++) {
      for (let i = 0; i < yKeys.length; i++) {
        const compKey = yKeys[i];
        if (yNewData[ind][compKey] != yOldData[ind][compKey]) {
          return true;
        }
      }
    }
  }
  return false;
}

function updateEchartsOptions(newPieData: any, oldPieData: any) {
  // 这样判断也不好，最好是看看能不能分开
  // 不然每输入一个字都会来判断一下。
  const oldPassData = oldPieData && oldPieData.node && oldPieData.node.chart ? oldPieData.node.chart : undefined;
  let isNeedRePaint = checkUpdateEchartsOptions(newPieData.node.chart, oldPassData);
  if (isNeedRePaint && newPieData.node.chart) {
    const { pie_type, dataset } = newPieData.node.chart;
    if (dataset && dataset.length && dataset[0].value) {
      const options = lodash.cloneDeep(simplePieOptions);
      let pieSeriesDataTemp: any = {};
      if (pie_type == EchartsPieType.circle) {
        pieSeriesDataTemp = lodash.cloneDeep(circleSeriesOptions);
        pieSeriesDataTemp.data = dataset;
      } else {
        pieSeriesDataTemp = lodash.cloneDeep(pieSeriesOptions);
        pieSeriesDataTemp.data = dataset;
      }
      options.series.push(pieSeriesDataTemp);
      echartsOptions.isHasData = true;
      echartsOptions.options = options;
      echartsOptions.parentId = newPieData.props.id;
    } else {
      echartsOptions.isHasData = false;
      echartsOptions.options = {};
      echartsOptions.parentId = "";
    }
  }
}
</script>

<style scoped>
.rj_rpt_line_preview_w {
  width: 100%;
  height: auto;
  min-height: 32rem;
  margin-bottom: 0.5rem;
}

.rj_rpt_line_preview_t {
  width: 100%;
  height: 3rem;
  padding-left: 1rem;
  color: black;
  font-size: 1.5rem;
}

.rj_rpt_line_preview_c {
  width: 100%;
  height: 32rem;
  margin-bottom: 0.5rem;
}

.rj_rpt_line_preview_l {
  width: 100%;
  height: auto;
  font-size: 0.75rem;
}

.rj_rpt_line_preview_s {
  width: 100%;
  height: auto;
  padding: 0.75rem;
}
</style>
