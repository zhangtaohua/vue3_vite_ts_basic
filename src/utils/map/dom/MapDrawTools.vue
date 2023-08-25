<template>
  <div class="row_nw_center_center interaction_container" :style="style">
    <div class="interaction_begin_gap"></div>
    <div
      v-for="(item, index) in state.interactions"
      :key="item.id ? item.id : index"
      class="row_nw_fs_center interaction_box"
    >
      <div class="row_nw_center_center interaction_image_box" @click="sendActionHandle(item.action)">
        <img class="interaction_image_show" :src="item.image" alt="pic" />
      </div>
      <div class="row_nw_fs_center interaction_name" @click="sendActionHandle(item.action)">{{ item.name }}</div>
      <div class="interaction_inner_gap"></div>
    </div>
    <div class="interaction_end_gap"></div>
    <div v-if="state.isShowMode" class="col_nw_center_center" :class="drawModeClass">
      <div v-for="(item, index) in drawModeOptions" :key="item.id ? item.id : index" class="col_nw_fs_center mode_box">
        <div class="row_nw_fs_center">
          <div class="row_nw_center_center mode_image_box" @click="setDrawActionHandle(item.action)">
            <img class="mode_image_show" :src="item.image" alt="pic" />
          </div>
          <div class="row_nw_fs_center mode_name" @click="setDrawActionHandle(item.action)">{{ item.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, watch, computed } from "vue";
import {
  MAP_DRAW_POINT,
  MAP_DRAW_SQUARE,
  MAP_DRAW_RECTANGLE,
  MAP_DRAW_POLYGON,
  MAP_DRAW_LINE,
  MAP_DRAW_CIRCLE,
  MAP_DRAW_GEOMETRY_CIRCLE,
  MAP_DRAW_GEODESIC_CIRCLE,
  MAP_MEASURE_DISTANCE,
  MAP_MEASURE_AREA,
  MAP_DRAW_CLEAR,
  MAP_SELECT_DRAW_MODE,
  MAP_SHOW_PROPS,
  MAP_HIDDEN_PROPS,
  drawModeType,
} from "@/utils/map/geoConstant";

import imageDual from "@/assets/images/thematic/shuangping.svg";
import imageRoll from "@/assets/images/thematic/jianlian.svg";
import imageTransparency from "@/assets/images/thematic/toumingdu.svg";
import imageDistance from "@/assets/images/thematic/juli.svg";
import imageArea from "@/assets/images/thematic/mianji.svg";
import imageLegend from "@/assets/images/thematic/tuli.svg";
import imageClear from "@/assets/images/thematic/qingchu.svg";
import imageLayers from "@/assets/images/thematic/layers.svg";

export default defineComponent({
  name: "MapDrawTools",
  props: {
    style: {
      type: Object,
      default() {
        return {
          bottom: "1rem",
          left: "1.5rem",
        };
      },
    },
    drawMode: {
      type: String,
      default: drawModeType.idle,
    },
    isShowProps: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["onChange"],
  setup(props, { emit }) {
    const drawModeName = {
      idle: "等待操作",
      draw: "绘制模式",
      modify: "修改模式",
      edit: "编辑模式",
      delete: "删除模式",
    };
    const drawModeImage = {
      idle: imageDual,
      draw: imageRoll,
      modify: imageTransparency,
      edit: imageDistance,
      delete: imageClear,
    };
    const drawModeOptions = [
      {
        id: "draw_mode_1",
        image: imageDual,
        name: drawModeName.idle,
        action: drawModeType.idle,
      },
      {
        id: "draw_mode_2",
        image: imageDual,
        name: drawModeName.draw,
        action: drawModeType.draw,
      },
      {
        id: "draw_mode_3",
        image: imageDual,
        name: drawModeName.modify,
        action: drawModeType.modify,
      },
      {
        id: "draw_mode_4",
        image: imageDual,
        name: drawModeName.edit,
        action: drawModeType.edit,
      },
      {
        id: "draw_mode_5",
        image: imageDual,
        name: drawModeName.delete,
        action: drawModeType.delete,
      },
    ];
    const isShowPropsName = {
      false: "隐藏属性",
      true: "显示属性",
    };
    const isShowPropsImage = {
      false: imageClear,
      true: imageDistance,
    };

    const drawModeClass = computed(() => {
      if (props.style.bottom) {
        return "mode_bottom_container";
      } else if (props.style.bottom) {
        return "mode_top_container";
      } else {
        return "mode_bottom_container";
      }
    });
    const state = reactive({
      isShowMode: false,
      interactions: [
        {
          id: "interaction_1",
          image: imageDual,
          name: "点",
          action: MAP_DRAW_POINT,
        },
        {
          id: "interaction_2",
          image: imageDual,
          name: "正方形",
          action: MAP_DRAW_SQUARE,
        },
        {
          id: "interaction_3",
          image: imageRoll,
          name: "矩形",
          action: MAP_DRAW_RECTANGLE,
        },
        {
          id: "interaction_4",
          image: imageTransparency,
          name: "多边形",
          action: MAP_DRAW_POLYGON,
        },
        {
          id: "interaction_5",
          image: imageDistance,
          name: "线",
          action: MAP_DRAW_LINE,
        },
        {
          id: "interaction_6",
          image: imageArea,
          name: "普通圆",
          action: MAP_DRAW_GEOMETRY_CIRCLE,
        },
        {
          id: "interaction_7",
          image: imageArea,
          name: "测地圆",
          action: MAP_DRAW_GEODESIC_CIRCLE,
        },
        {
          id: "interaction_8",
          image: imageLegend,
          name: "长度",
          action: MAP_MEASURE_DISTANCE,
        },
        {
          id: "interaction_9",
          image: imageLayers,
          name: "面积",
          action: MAP_MEASURE_AREA,
        },
        {
          id: "interaction_10",
          image: imageClear,
          name: "清除",
          action: MAP_DRAW_CLEAR,
        },
        {
          id: "interaction_11",
          image: isShowPropsImage[props.isShowProps.toString()],
          name: isShowPropsName[props.isShowProps.toString()],
          action: MAP_HIDDEN_PROPS,
        },
        {
          id: "interaction_12",
          image: drawModeImage[props.drawMode],
          name: drawModeName[props.drawMode],
          action: MAP_SELECT_DRAW_MODE,
        },
      ],
    });

    watch(
      () => props.isShowProps,
      () => {
        togglePropsPanel(props.isShowProps);
      },
    );

    watch(
      () => props.drawMode,
      () => {
        state.interactions[11].image = drawModeImage[props.drawMode];
        state.interactions[11].name = drawModeName[props.drawMode];
      },
    );

    function togglePropsPanel(isShow: boolean) {
      state.interactions[10].image = isShowPropsImage[isShow.toString()];
      state.interactions[10].name = isShowPropsName[isShow.toString()];
      state.interactions[10].action = isShow ? MAP_SHOW_PROPS : MAP_HIDDEN_PROPS;
    }

    function sendActionHandle(action: string) {
      if (action == MAP_SELECT_DRAW_MODE) {
        state.isShowMode = true;
      } else if (action == MAP_SHOW_PROPS) {
        togglePropsPanel(false);
        state.isShowMode = false;
        emit("onChange", MAP_HIDDEN_PROPS, null);
      } else if (action == MAP_HIDDEN_PROPS) {
        togglePropsPanel(true);
        state.isShowMode = false;
        emit("onChange", MAP_SHOW_PROPS, null);
      } else {
        state.isShowMode = false;
        emit("onChange", action, null);
      }
    }

    function setDrawActionHandle(action: string) {
      state.isShowMode = false;
      emit("onChange", MAP_SELECT_DRAW_MODE, action);
    }

    return {
      state,
      drawModeOptions,
      drawModeClass,
      sendActionHandle,
      setDrawActionHandle,
    };
  },
});
</script>

<style scoped lang="scss">
.interaction_container {
  position: absolute;
  right: 1rem;
  bottom: 1.5rem;
  z-index: 999999;
  width: fit-content;
  height: 2rem;
  background: rgb(26 32 44 / 70%);
  border-bottom-left-radius: 0.25rem;
}

.interaction_begin_gap {
  width: 1rem;
  height: 2rem;
}

.interaction_inner_gap {
  width: 1rem;
  height: 2rem;
}

.interaction_end_gap {
  width: 0.5rem;
  height: 2rem;
}

.interaction_box {
  width: auto;
  height: 2rem;
}

.interaction_image_box {
  width: 2rem;
  height: 2rem;
  cursor: pointer;
}

.interaction_image_show {
  position: relative;
  width: 1rem;
  height: 1rem;
  transform: translate(-1000vw);
  // filter: drop-shadow(#fff 1000px 0);
  // left: -80px;
  filter: drop-shadow(1000vw 0 0 #fff);
}

.interaction_name {
  width: fit-content;
  height: 2rem;
  padding-left: 0;
  color: rgb(255 255 255 / 100%);
  font-weight: 400;
  font-size: 0.75rem;
  font-family: "Source Han Sans CN";
  cursor: pointer;
}

.mode_bottom_container {
  position: absolute;
  right: 0rem;
  bottom: 2.5rem;
  width: auto;
  height: auto;
  background: rgb(26 32 44 / 70%);
  border-radius: 0.25rem;
}

.mode_top_container {
  position: absolute;
  right: 0rem;
  top: 2.5rem;
  width: auto;
  height: auto;
  background: rgb(26 32 44 / 70%);
  border-radius: 0.25rem;
}

.mode_box {
  width: auto;
  height: 2rem;
  padding-right: 1.5rem;
}

.mode_image_box {
  width: 2rem;
  height: 2rem;
  cursor: pointer;
}

.mode_image_show {
  position: relative;
  width: 1rem;
  height: 1rem;
  transform: translate(-1000vw);
  // filter: drop-shadow(#fff 1000px 0);
  // left: -80px;
  filter: drop-shadow(1000vw 0 0 #fff);
}

.mode_name {
  width: fit-content;
  height: 2rem;
  padding-left: 0;
  color: rgb(255 255 255 / 100%);
  font-weight: 400;
  font-size: 0.75rem;
  font-family: "Source Han Sans CN";
  cursor: pointer;
}
</style>
