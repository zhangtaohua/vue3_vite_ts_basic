<template>
  <div v-show="isShowEcharts" class="row_nw_center_center wh_100p_100p">
    <div :id="echartsId" class="row_nw_center_center wh_100p_100p"></div>
  </div>
  <div v-show="!isShowEcharts" class="wh_100p_100p">
    <EchartsErrorNoData />
  </div>
</template>

<script lang="ts">
import EchartsErrorNoData from "./EchartsErrorNoData.vue";
import { useReportEchartsStore } from "@/stores/reports";

import * as echarts from "echarts";
import ecStat from "echarts-stat";
import { defineComponent, onMounted, ref, watch, nextTick, onUnmounted } from "vue";

export default defineComponent({
  name: "EchartsOptionScatter",
  components: {
    EchartsErrorNoData,
  },
  props: {
    echartsId: {
      type: String,
      default: "rj",
    },
    echartsOptions: {
      type: Object,
      default() {
        return {
          isHasData: false,
          options: {},
        };
      },
    },
  },
  setup(
    props: {
      echartsId: string;
      echartsOptions: any;
    },
    ctx,
  ) {
    const echartsId = props.echartsId;

    // See https://github.com/ecomfe/echarts-stat
    // @ts-ignore
    echarts.registerTransform(ecStat.transform.regression);

    const isShowEcharts = ref(true);
    const echartsHandler: any = {};
    const reportsEcharts = useReportEchartsStore();

    // onMounted(() => {
    //   updateEchartsOptions({})
    // })

    onUnmounted(() => {
      destroyEcharts();
    });

    watch(
      () => props.echartsOptions,
      () => {
        handleEchartOptionData(props.echartsOptions);
      },
      {
        immediate: true,
        deep: true,
      },
    );

    function handleEchartOptionData(echartsOptions: any) {
      console.log("画图", echartsOptions);
      const echartOption = echartsOptions;
      if (echartOption.isHasData) {
        isShowEcharts.value = true;
      } else {
        isShowEcharts.value = false;
      }
      nextTick(() => {
        updateEchartsOptions(echartOption.options);
      });
    }

    function initEcharts() {
      echartsHandler.dom = document.getElementById(echartsId);
      if (echartsHandler.dom) {
        echartsHandler.dom.removeAttribute("_echarts_instance_");
        echartsHandler.handler = echarts.init(echartsHandler.dom);
        echartsHandler.width = echartsHandler.dom.clientWidth;
      }
    }

    function updateEchartsOptions(optionsNew: any) {
      initEcharts();
      if (echartsHandler.handler) {
        echartsHandler.handler.setOption(optionsNew);
        const parentId = props.echartsOptions.parentId;
        if (parentId) {
          reportsEcharts.setEchartsInstance(parentId, echartsHandler);
        }
      }
    }

    // function resizeEcharts() {
    //   if (echartsHandler.handler) {
    //     echartsHandler.handler.resize();
    //   }
    // }

    function destroyEcharts() {
      if (echartsHandler.handler) {
        echartsHandler.handler.dispose();
      }
    }

    return {
      isShowEcharts,
    };
  },
});
</script>

<style lang="scss" scoped></style>
