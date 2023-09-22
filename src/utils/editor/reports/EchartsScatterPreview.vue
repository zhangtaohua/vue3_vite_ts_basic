<template>
  <div class="col_nw_fs_fs rj_rpt_line_preview_w">
    <div class="row_nw_fs_center rj_rpt_line_preview_t">
      {{ configData.node.title }}
    </div>
    <div class="row_nw_fs_center rj_rpt_line_preview_c">
      <EchartsOptionScatter :echartsId="echartsId" :echartsOptions="echartsOptions" />
    </div>
    <div class="row_nw_center_center rj_rpt_line_preview_l">
      {{ configData.node.name }}
    </div>

    <div class="rj_rpt_line_preview_s" v-html="configData.node.conclusion"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, defineProps } from "vue";
import EchartsOptionScatter from "@/components/echarts/EchartsOptionScatter.vue";

import {
  EchartsRegressionType,
  simpleScatterOptions,
  regressionDatasetOptions,
  scatterSeriesNormalOptions,
  scatterSeriesLineOptions,
} from "@/common/echarts/scatterOptions";
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

const echartsId = ref("echarts_scatter_" + nanoid(10));
const echartsOptions = reactive({
  isHasData: true,
  parentId: "",
  options: lodash.cloneDeep(simpleScatterOptions),
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
    const xKeys = ["regression_type"];
    const yKeys = [0, 1];
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

function updateEchartsOptions(newScatterData: any, oldScatterData: any) {
  // 这样判断也不好，最好是看看能不能分开
  // 不然每输入一个字都会来判断一下。
  const oldPassData =
    oldScatterData && oldScatterData.node && oldScatterData.node.chart ? oldScatterData.node.chart : undefined;
  let isNeedRePaint = checkUpdateEchartsOptions(newScatterData.node.chart, oldPassData);

  if (isNeedRePaint && newScatterData.node.chart) {
    const { regression_type, dataset } = newScatterData.node.chart;
    if (dataset && dataset.length && dataset[0][0]) {
      const options = lodash.cloneDeep(simpleScatterOptions);
      // 压入原始数据
      options.dataset.push({
        source: dataset,
      });
      const seriesData1Temp = lodash.cloneDeep(scatterSeriesNormalOptions);
      options.series.push(seriesData1Temp);

      if (regression_type !== EchartsRegressionType.nonen) {
        const datasetRegressionTemp = lodash.cloneDeep(regressionDatasetOptions[regression_type]);
        options.dataset.push(datasetRegressionTemp);

        const seriesData2Temp = lodash.cloneDeep(scatterSeriesLineOptions);
        options.series.push(seriesData2Temp);
      }
      echartsOptions.isHasData = true;
      echartsOptions.options = options;
      echartsOptions.parentId = newScatterData.props.id;
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
