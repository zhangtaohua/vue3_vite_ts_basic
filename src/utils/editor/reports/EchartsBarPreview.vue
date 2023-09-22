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

import { EchartsBarType, simpleBarOptions, barSeriesOptions } from "@/common/echarts/barOptions";
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

const echartsId = ref("echarts_bar_" + nanoid(10));
const echartsOptions = reactive({
  isHasData: true,
  parentId: "",
  options: lodash.cloneDeep(simpleBarOptions),
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
    const xKeys = ["stack_type", "xaxis_data", "xaxis_name", "xaxis_unit"];
    const yKeys = ["data", "name", "unit"];
    for (let i = 0; i < xKeys.length; i++) {
      const compKey = xKeys[i];
      if (newData[compKey] != oldData[compKey]) {
        return true;
      }
    }
    const yNewData = newData.yaxis;
    const yOldData = oldData.yaxis;
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

function updateEchartsOptions(newLineData: any, oldLineData: any) {
  // 这样判断也不好，最好是看看能不能分开
  // 不然每输入一个字都会来判断一下。
  const oldPassData = oldLineData && oldLineData.node && oldLineData.node.chart ? oldLineData.node.chart : undefined;
  let isNeedRePaint = checkUpdateEchartsOptions(newLineData.node.chart, oldPassData);
  if (isNeedRePaint && newLineData.node.chart) {
    const { stack_type, xaxis_name, xaxis_data, xaxis_unit, yaxis } = newLineData.node.chart;
    if (xaxis_data && yaxis.length && yaxis[0].data) {
      const options = lodash.cloneDeep(simpleBarOptions);
      const xaxis_array = xaxis_data.split(",");
      options.xAxis.data = xaxis_array;

      for (let i = 0; i < yaxis.length; i++) {
        const yaxisTemp = yaxis[i].data.split(",");
        let yaxisName = yaxis[i].data;
        if (!yaxisName) {
          yaxisName = `bar${i + 1}`;
        }
        // 如果Y 轴数据多于一条，就要插入更多的series 系列
        if (i > 0) {
          const lineSeriesTemp = lodash.cloneDeep(barSeriesOptions);
          options.series.push(lineSeriesTemp);
        }
        options.series[i].data = yaxisTemp;
        options.series[i].name = yaxisName;
        if (stack_type == EchartsBarType.stack) {
          options.series[i].stack = "total";
        }
      }
      echartsOptions.isHasData = true;
      echartsOptions.options = options;
      echartsOptions.parentId = newLineData.props.id;
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
