<template>
  <div v-show="isShowEcharts" :ref="(el: any) => { echartBoxRef = el }" class="row_nw_center_center echart_wraper">
    <div :id="echartsId" class="row_nw_center_center wh_100p_100p"></div>
    <div
      v-if="isCanDrag"
      className="echart_wraper_dragger left-top"
      draggable="true"
      @dragstart="mousedownHandle"
      @drag="mousemoveHandle($event, UL)"
      @dragend="mouseupHandle"
    ></div>
    <div
      v-if="isCanDrag"
      className="echart_wraper_dragger right-top"
      draggable="true"
      @dragstart="mousedownHandle"
      @drag="mousemoveHandle($event, UR)"
      @dragend="mouseupHandle"
    ></div>
    <div
      v-if="isCanDrag"
      className="echart_wraper_dragger left-bottom"
      draggable="true"
      @dragstart="mousedownHandle"
      @drag="mousemoveHandle($event, BL)"
      @dragend="mouseupHandle"
    ></div>
    <div
      v-if="isCanDrag"
      className="echart_wraper_dragger right-bottom"
      draggable="true"
      @dragstart="mousedownHandle"
      @drag="mousemoveHandle($event, BR)"
      @dragend="mouseupHandle"
    ></div>
  </div>
  <div v-show="!isShowEcharts" class="wh_100p_100p">
    <EchartsErrorNoData />
  </div>
</template>

<script setup lang="ts">
import EchartsErrorNoData from "./EchartsErrorNoData.vue";

import * as echarts from "echarts";
import { defineComponent, onMounted, ref, watch, nextTick, onUnmounted, reactive, defineExpose } from "vue";
import lodash from "lodash";

import { Transforms, Node } from "slate";
import { IButtonMenu, IDomEditor, DomEditor } from "@wangeditor/core";
import { wangEditorEchartLineType, EchartLineElement } from "@/utils/editor/plugin/echart/line/custom-types";
import { A4EditorWidthPixel, A4EditorHeightPixel } from "@/utils/editor/common/constant";

const props = defineProps({
  echartsId: {
    type: String,
    default: "rj",
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
  editor: {
    type: Object,
    default() {
      return null;
    },
  },
  editorEchartType: {
    type: String,
    default: wangEditorEchartLineType,
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
});

const isShowEcharts = ref(true);
const echartsHandler: any = {};
const echartBoxRef = ref(null);
const isCanDrag = ref(props.isSelected);

const destroyEcharts = () => {
  console.log("destroyEcharts");
  if (echartsHandler.handler) {
    echartsHandler.handler.dispose();
    echartsHandler.handler = null;
    if (echartsHandler.dom) {
      echartsHandler.dom.removeAttribute("_echarts_instance_");
    }
  }
};

const resizeEcharts = () => {
  console.log("resizeEcharts");
  if (echartsHandler.handler) {
    echartsHandler.handler.resize();
  }
};

const setCanResize = (isCan: boolean) => {
  console.log("setCanResize");
  if (echartsHandler.handler) {
    isCanDrag.value = isCan;
  }
};

defineExpose({
  destroyEcharts: destroyEcharts,
  resizeEcharts: resizeEcharts,
  setCanResize: setCanResize,
});

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

watch(
  () => props.isSelected,
  () => {
    isCanDrag.value = props.isSelected;
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
    nextTick(() => {
      updateEchartsOptions(echartOption.options);
    });
  } else {
    isShowEcharts.value = false;
  }
}

function initEcharts() {
  echartsHandler.dom = document.getElementById(props.echartsId);
  if (echartsHandler.dom) {
    if (echartsHandler.handler) {
      echartsHandler.handler.dispose();
      echartsHandler.handler = null;
    }
    echartsHandler.dom.removeAttribute("_echarts_instance_");
    echartsHandler.handler = echarts.init(echartsHandler.dom);
  }
}

function updateEchartsOptions(optionsNew: any) {
  initEcharts();
  if (echartsHandler.handler) {
    echartsHandler.handler.setOption(optionsNew);
  }
}

// 统一绑定拖拽触手的 mousedown 事件
let isDragging = false;
let startPositionX = 0;
let startPositionY = 0;

let oldDomWidth = 0;
let oldDomHeight = 0;

let currentX = 0;
let currentY = 0;

const UL = "UL";
const UR = "UR";
const BL = "BL";
const BR = "BR";
let maxDomWidth = Math.floor(A4EditorWidthPixel * 0.965);
let maxDomHeight = Math.floor(A4EditorHeightPixel * 0.96);

const mousedownHandle = (e: MouseEvent) => {
  // 这里不能阻止，不然不能实现拖拽
  // e.preventDefault();
  // e.stopPropagation();
  console.log("mousedownHandle", e, echartBoxRef.value.clientHeight);
  isDragging = true;
  startPositionX = e.clientX;
  startPositionY = e.clientY;
  oldDomWidth = echartBoxRef.value.clientWidth;
  oldDomHeight = echartBoxRef.value.clientHeight;
  return true;
};

const mousemoveHandle = lodash.throttle((e: MouseEvent, whichDirection: string) => {
  // 感觉这里要尽快阻止默认事件，不然可能导致 echart 图表 destroy hook 会被触发而销毁了。
  e.preventDefault();
  e.stopPropagation();
  if (isDragging === true) {
    switch (whichDirection) {
      case UL: {
        // 计算拖拽距离
        currentX = startPositionX - e.clientX;
        currentY = startPositionY - e.clientY;
        break;
      }
      case UR: {
        // 计算拖拽距离
        currentX = e.clientX - startPositionX;
        currentY = -(e.clientY - startPositionY);
        // if (currentX < 0 && currentY < 0) {
        //   currentY = -currentY;
        // } else if (currentX > 0 && currentY < 0) {
        //   currentY = -currentY;
        // } else if (currentX < 0 && currentY > 0) {
        //   currentY = -currentY;
        // } else if (currentX > 0 && currentY > 0) {
        //   currentY = -currentY;
        // }
        break;
      }
      case BL: {
        // 计算拖拽距离
        currentX = -(e.clientX - startPositionX);
        currentY = e.clientY - startPositionY;
        // if (currentX < 0 && currentY < 0) {
        //   currentX = -currentX;
        // } else if (currentX > 0 && currentY < 0) {
        //   currentX = -currentX;
        // } else if (currentX < 0 && currentY > 0) {
        //   currentX = -currentX;
        // } else if (currentX > 0 && currentY > 0) {
        //   currentX = -currentX;
        // }
        break;
      }
      case BR: {
        // 计算拖拽距离
        currentX = e.clientX - startPositionX;
        currentY = e.clientY - startPositionY;
        break;
      }
      default: {
        break;
      }
    }
    // 更新拖拽元素的位置
    // resizeEcharts();
    console.log("mousemoveHandle", currentX, currentY);
  }
  return true;
}, 100);

const mouseupHandle = (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  console.log("mouseupHandle", e);
  isDragging = false;
  setTimeout(() => {
    if (props.editor) {
      console.log("propseditor", props, props.editor);
      // 进行尺寸变化
      let realWidth = Math.floor(oldDomWidth + currentX);
      let realHeight = Math.floor(oldDomHeight + currentY);
      if (realWidth > maxDomWidth) {
        realWidth = maxDomWidth;
      } else if (realWidth < 100) {
        realWidth = 100;
      }

      if (realHeight > maxDomHeight) {
        realHeight = maxDomHeight;
      } else if (realHeight < 100) {
        realHeight = 100;
      }

      const echartNode = DomEditor.getSelectedNodeByType(props.editor, props.editorEchartType);
      if (echartNode == null) return;

      // 下面这里肯定不是太好的，但又不好重新再写一个文件
      const { style = {} } = echartNode as EchartLineElement;
      const propsNew: Partial<EchartLineElement> = {
        style: {
          ...style,
          width: realWidth + "px", // 修改 width
          height: realHeight + "px", // 清空 height
        },
      };

      props.editor.restoreSelection();
      Transforms.setNodes(props.editor, propsNew, {
        match: (n: any) => DomEditor.checkNodeType(n, props.editorEchartType),
      });
    }
  }, 250);
  return true;
};
</script>

<style lang="scss" scoped>
.echart_wraper {
  position: relative;
  width: 100%;
  height: 100%;
}

.echart_wraper:hover {
  box-shadow: none;
}

.echart_box {
  width: 100%;
  height: 100%;
}

.echart_wraper_dragger {
  position: absolute;
  width: 7px;
  height: 7px;
  background-color: #4290f7;
}

.left-top {
  top: 0;
  left: 0;
  cursor: nwse-resize;
}

.right-top {
  top: 0;
  right: 0;
  cursor: nesw-resize;
}

.left-bottom {
  bottom: 0;
  left: 0;
  cursor: nesw-resize;
}

.right-bottom {
  right: 0;
  bottom: 0;
  cursor: nwse-resize;
}
</style>
