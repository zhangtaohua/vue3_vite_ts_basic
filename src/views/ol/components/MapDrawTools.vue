<template>
  <div class="row_nw_center_center interaction_container">
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
    <!-- <div class="interaction_end_gap"></div> -->
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
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
  emits: ["onChange"],
  setup(_, { emit }) {
    const state = reactive({
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
          image: imageClear,
          name: "面积",
          action: MAP_MEASURE_AREA,
        },
        {
          id: "interaction_10",
          image: imageLayers,
          name: "清除",
          action: MAP_DRAW_CLEAR,
        },
      ],
    });

    function sendActionHandle(action: string) {
      emit("onChange", action);
    }

    return {
      state,
      sendActionHandle,
    };
  },
});
</script>

<style scoped lang="scss">
.interaction_container {
  position: absolute;
  right: 1rem;
  bottom: 1.5rem;
  z-index: 10;
  width: auto;
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
  width: 0;
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

.progress_container {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9;
  width: 100%;
  height: 100%;
  background: rgb(26 0 44 / 0%);
}

.progress_box {
  position: absolute;
  top: 3.5rem;
  right: 18rem;
  width: 15rem;
  height: 2rem;
}

.progress_range_label {
  width: auto;
  padding-left: 0.25rem;
  color: rgb(26 32 44 / 70%);
  font-weight: 400;
  font-size: 0.75rem;
  font-family: "Source Han Sans CN";
}

.progress_range_input {
  // -webkit-appearance: none;
  width: 10rem;
  height: 0.5rem;
  accent-color: rgb(26 32 44 / 70%);
  // border-radius: 10px; /*这个属性设置使填充进度条时的图形为圆角*/
}

// .progress_range_input::-webkit-slider-runnable-track {
//     height: 15px;
//     border-radius: 10px; /*将轨道设为圆角的*/
//     box-shadow: 0 1px 1px #def3f8, inset 0 .125em .125em #0d1112; /*轨道内置阴影效果*/
// }

// .progress_range_input::-webkit-slider-thumb {
//     -webkit-appearance: none;
//     height: 2rem;
//     width: 2rem;
//     margin-top: 0rem; /*使滑块超出轨道部分的偏移量相等*/
//     background: #ffffff;
//     border-radius: 50%; /*外观设置为圆形*/
//     border: solid 0.125em rgba(255, 0, 0, 0.5); /*设置边框*/
//     box-shadow: 0 .125em .125em #3b4547; /*添加底部阴影*/
// }

// .progress_range_input:focus {
//   outline: none;
// }
</style>
