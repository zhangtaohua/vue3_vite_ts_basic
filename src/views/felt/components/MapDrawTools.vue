<template>
  <div class="row_nw_fs_center tools_container">
    <div v-if="isShowMask" class="tools_mask" @click="maskClickHandle"></div>

    <!-- menu shape -->
    <div
      class="row_nw_center_center shape_wrapper"
      :class="{ shape_wrapper_halfactive: shapeCtl.isShowMenu, shape_wrapper_active: shapeCtl.isActive }"
      style="z-index: 4"
    >
      <div
        class="row_nw_center_center shape_dbox"
        @click="sendActionHandle(firstMenu.shape, shapes.children[shapeCtl.current].action, -1)"
        @mouseenter="shapeMouseELCHandle('isShowActTip', true)"
        @mouseleave="shapeMouseELCHandle('isShowActTip', false)"
      >
        <img
          class="shape_dimage"
          :class="{ shape_svg_active: shapeCtl.isActive }"
          :src="shapes.children[shapeCtl.current].image"
          alt="pic"
        />
      </div>
      <div v-if="shapeCtl.isShowActTip" class="row_nw_center_center shape_dtip">
        <span class="row_nw_center_center shape_dtip_title">{{ shapes.children[shapeCtl.current].name }}</span>
        <span class="row_nw_center_center shape_dtip_hotkey">{{ shapes.children[shapeCtl.current].hotKey }}</span>
      </div>

      <div
        class="row_nw_center_center shape_mbox"
        @click="shapeMouseELCHandle('isShowMenu', true)"
        @mouseenter="shapeMouseELCHandle('isShowTip', true)"
        @mouseleave="shapeMouseELCHandle('isShowTip', false)"
      >
        <img
          class="shape_down_arrow"
          :class="{ shape_svg_active: shapeCtl.isActive }"
          :src="downArrowSvg"
          alt="expand"
        />
      </div>
      <div v-if="shapeCtl.isShowTip" class="row_nw_center_center shape_mtip">
        <span class="row_nw_center_center shape_mtip_title">形状</span>
      </div>

      <div v-if="shapeCtl.isShowMenu" class="col_nw_fs_fs shape_menus">
        <div
          v-for="(item, index) in shapes.children"
          :key="item.id"
          class="row_nw_fs_center shapes_menu"
          @click="sendActionHandle(firstMenu.shape, item.action, index)"
        >
          <div class="row_nw_center_center shapes_menu_image">
            <img class="shapes_menu_show" :src="item.image" alt="pic" />
          </div>
          <div class="row_nw_fs_center shapes_menu_title">{{ item.name }}</div>
          <div class="row_nw_fe_center shapes_menu_hotkey">{{ item.hotKey }}</div>
        </div>
      </div>
    </div>

    <!-- menu annotations -->
    <div
      class="row_nw_center_center shape_wrapper"
      :class="{ shape_wrapper_halfactive: annotationsCtl.isShowMenu, shape_wrapper_active: annotationsCtl.isActive }"
      style="z-index: 3"
    >
      <div
        class="row_nw_center_center shape_dbox"
        @click="sendActionHandle(firstMenu.annotations, annotations.children[annotationsCtl.current].action, -1)"
        @mouseenter="annotationsMouseELCHandle('isShowActTip', true)"
        @mouseleave="annotationsMouseELCHandle('isShowActTip', false)"
      >
        <img
          class="shape_dimage"
          :class="{ shape_svg_active: annotationsCtl.isActive }"
          :src="annotations.children[annotationsCtl.current].image"
          alt="pic"
        />
      </div>
      <div v-if="annotationsCtl.isShowActTip" class="row_nw_center_center shape_dtip">
        <span class="row_nw_center_center shape_dtip_title">{{
          annotations.children[annotationsCtl.current].name
        }}</span>
        <span class="row_nw_center_center shape_dtip_hotkey">{{
          annotations.children[annotationsCtl.current].hotKey
        }}</span>
      </div>

      <div
        class="row_nw_center_center shape_mbox"
        @click="annotationsMouseELCHandle('isShowMenu', true)"
        @mouseenter="annotationsMouseELCHandle('isShowTip', true)"
        @mouseleave="annotationsMouseELCHandle('isShowTip', false)"
      >
        <img
          class="shape_down_arrow"
          :class="{ shape_svg_active: annotationsCtl.isActive }"
          :src="downArrowSvg"
          alt="expand"
        />
      </div>
      <div v-if="annotationsCtl.isShowTip" class="row_nw_center_center shape_mtip">
        <span class="row_nw_center_center shape_mtip_title">标注</span>
      </div>

      <div v-if="annotationsCtl.isShowMenu" class="col_nw_fs_fs shape_menus">
        <div
          v-for="(item, index) in shapes.children"
          :key="item.id"
          class="row_nw_fs_center shapes_menu"
          @click="sendActionHandle(firstMenu.annotations, item.action, index)"
        >
          <div class="row_nw_center_center shapes_menu_image">
            <img class="shapes_menu_show" :src="item.image" alt="pic" />
          </div>
          <div class="row_nw_fs_center shapes_menu_title">{{ item.name }}</div>
          <div class="row_nw_fe_center shapes_menu_hotkey">{{ item.hotKey }}</div>
        </div>
      </div>
    </div>

    <!-- menu search -->
    <div class="row_nw_center_center shape_wrapper" :class="{ shape_wrapper_active: searchCtl.isActive }">
      <div
        class="row_nw_center_center search_dbox"
        @click="sendActionHandle(firstMenu.search, search.action, -1)"
        @mouseenter="searchMouseELCHandle('isShowTip', true)"
        @mouseleave="searchMouseELCHandle('isShowTip', false)"
      >
        <img class="search_dimage" :class="{ shape_svg_active: searchCtl.isActive }" :src="search.image" alt="pic" />
      </div>
      <div v-if="searchCtl.isShowTip" class="row_nw_center_center shape_dtip">
        <span class="row_nw_center_center shape_dtip_title">{{ search.name }}</span>
        <span class="row_nw_center_center shape_dtip_hotkey">{{ search.hotKey }}</span>
      </div>
    </div>
    <!-- end -->
  </div>
</template>

<script setup lang="ts">
import { defineComponent, ref, reactive, defineEmits } from "vue";
import {
  MAP_DRAW_TEXT,
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

import downArrowSvg from "@/assets/images/maptools/downArrow.svg";
import pointSvg from "@/assets/images/maptools/point.svg";
import lineSvg from "@/assets/images/maptools/line.svg";

import searchSvg from "@/assets/images/maptools/search.svg";

const emit = defineEmits(["onChange"]);

const firstMenu = {
  shape: "shape",
  annotations: "annotations",
  search: "search",
};

const isShowMask = ref(false);

const shapeCtl = reactive({
  isShowActTip: false,
  isShowTip: false,
  isShowMenu: false,
  isActive: false,
  current: 0,
});

const annotationsCtl = reactive({
  isShowActTip: false,
  isShowTip: false,
  isShowMenu: false,
  isActive: false,
  current: 0,
});

const searchCtl = reactive({
  isShowTip: false,
  isActive: false,
});

const shapes = {
  id: "shapes",
  image: pointSvg,
  name: "图形",
  children: [
    {
      id: "shapes_0",
      image: pointSvg,
      name: "文本",
      action: MAP_DRAW_TEXT,
      hotKey: "A",
    },
    {
      id: "shapes_1",
      image: pointSvg,
      name: "点",
      action: MAP_DRAW_POINT,
      hotKey: "B",
    },
    {
      id: "shapes_2",
      image: pointSvg,
      name: "正方形",
      action: MAP_DRAW_SQUARE,
      hotKey: "C",
    },
    {
      id: "shapes_3",
      image: pointSvg,
      name: "矩形",
      action: MAP_DRAW_RECTANGLE,
      hotKey: "D",
    },
    {
      id: "shapes_4",
      image: pointSvg,
      name: "多边形",
      action: MAP_DRAW_POLYGON,
      hotKey: "E",
    },
    {
      id: "shapes_5",
      image: pointSvg,
      name: "线",
      action: MAP_DRAW_LINE,
      hotKey: "F",
    },
    {
      id: "shapes_6",
      image: pointSvg,
      name: "普通圆",
      action: MAP_DRAW_GEOMETRY_CIRCLE,
      hotKey: "G",
    },
    {
      id: "shapes_7",
      image: pointSvg,
      name: "测地圆",
      action: MAP_DRAW_GEODESIC_CIRCLE,
      hotKey: "H",
    },
    {
      id: "shapes_8",
      image: pointSvg,
      name: "长度",
      action: MAP_MEASURE_DISTANCE,
      hotKey: "I",
    },
    {
      id: "shapes_9",
      image: pointSvg,
      name: "面积",
      action: MAP_MEASURE_AREA,
      hotKey: "J",
    },
    {
      id: "shapes_10",
      image: pointSvg,
      name: "清除",
      action: MAP_DRAW_CLEAR,
      hotKey: "K",
    },
  ],
};

const annotations = {
  id: "annotations",
  image: pointSvg,
  name: "标注",
  children: [
    {
      id: "annotations_0",
      image: pointSvg,
      name: "文本",
      action: MAP_DRAW_TEXT,
      hotKey: "A",
    },
    {
      id: "annotations_1",
      image: pointSvg,
      name: "点",
      action: MAP_DRAW_POINT,
      hotKey: "B",
    },
    {
      id: "annotations_2",
      image: pointSvg,
      name: "正方形",
      action: MAP_DRAW_SQUARE,
      hotKey: "C",
    },
    {
      id: "annotations_3",
      image: pointSvg,
      name: "矩形",
      action: MAP_DRAW_RECTANGLE,
      hotKey: "D",
    },
    {
      id: "annotations_4",
      image: pointSvg,
      name: "多边形",
      action: MAP_DRAW_POLYGON,
      hotKey: "E",
    },
    {
      id: "annotations_5",
      image: pointSvg,
      name: "线",
      action: MAP_DRAW_LINE,
      hotKey: "F",
    },
    {
      id: "annotations_6",
      image: pointSvg,
      name: "普通圆",
      action: MAP_DRAW_GEOMETRY_CIRCLE,
      hotKey: "G",
    },
    {
      id: "annotations_7",
      image: pointSvg,
      name: "测地圆",
      action: MAP_DRAW_GEODESIC_CIRCLE,
      hotKey: "H",
    },
    {
      id: "annotations_8",
      image: pointSvg,
      name: "长度",
      action: MAP_MEASURE_DISTANCE,
      hotKey: "I",
    },
    {
      id: "annotations_9",
      image: pointSvg,
      name: "面积",
      action: MAP_MEASURE_AREA,
      hotKey: "J",
    },
    {
      id: "annotations_10",
      image: pointSvg,
      name: "清除",
      action: MAP_DRAW_CLEAR,
      hotKey: "K",
    },
  ],
};

const search = {
  id: "search",
  image: searchSvg,
  name: "搜索",
  action: "search",
  hotKey: "/",
};

function maskClickHandle() {
  shapeCtl.isShowMenu = false;
  annotationsCtl.isShowMenu = false;
  isShowMask.value = false;
}

function shapeMouseELCHandle(key: string, isShow: boolean) {
  shapeCtl[key] = isShow;
  if (key == "isShowMenu") {
    isShowMask.value = true;
    annotationsCtl.isShowMenu = false;

    shapeCtl.isShowActTip = false;
    shapeCtl.isShowTip = false;
  }
}

function annotationsMouseELCHandle(key: string, isShow: boolean) {
  annotationsCtl[key] = isShow;
  if (key == "isShowMenu") {
    isShowMask.value = true;
    shapeCtl.isShowMenu = false;

    annotationsCtl.isShowActTip = false;
    annotationsCtl.isShowTip = false;
  }
}

function searchMouseELCHandle(key: string, isShow: boolean) {
  searchCtl[key] = isShow;
}

function sendActionHandle(whichTools: string, action: string, index = -1) {
  console.log("sendActionHandle", whichTools, action);
  emit("onChange", whichTools, action);

  searchCtl.isActive = false;
  isShowMask.value = false;

  if (whichTools === "shape") {
    shapeCtl.isActive = true;
    shapeCtl.isShowMenu = false;

    annotationsCtl.isActive = false;
    annotationsCtl.isShowMenu = false;

    if (index !== -1) {
      shapeCtl.current = index;
    }
  } else if (whichTools === "annotations") {
    shapeCtl.isActive = false;
    shapeCtl.isShowMenu = false;

    annotationsCtl.isActive = true;
    annotationsCtl.isShowMenu = false;

    if (index !== -1) {
      annotationsCtl.current = index;
    }
  } else {
    if (whichTools === "search") {
      searchCtl.isActive = true;
    }
    shapeCtl.isActive = false;
    shapeCtl.isShowMenu = false;

    annotationsCtl.isActive = false;
    annotationsCtl.isShowMenu = false;
  }
}
</script>

<style scoped lang="scss">
.tools_container {
  position: relative;
  width: auto;
  height: 100%;
  caret-color: transparent;
}

.tools_mask {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 1;
  background: rgba(255, 0, 0, 0.25);
}

.shape_wrapper {
  position: relative;
  width: auto;
  height: 2.5rem;
  z-index: 2;
  border-radius: 0.25rem;
}

.shape_wrapper:hover {
  background: rgba(229, 229, 229, 1);
}

.shape_wrapper_halfactive {
  background: rgba(229, 229, 229, 1);
}

.shape_wrapper_active {
  background: rgba(243, 63, 117, 1);
}

.shape_wrapper_active:hover {
  background: rgba(243, 63, 117, 1);
}

.shape_dbox {
  width: 2rem;
  height: 100%;
  cursor: pointer;
  user-select: none;
}

.shape_dimage {
  width: 1.5rem;
  height: auto;
}

.shape_svg_active {
  filter: drop-shadow(2000vw 0 0 #ffffff);
  transform: translate(-2000vw);
}

.shape_dtip {
  position: absolute;
  width: auto;
  height: 2rem;
  background: rgba(0, 0, 0, 255);
  top: 3.25rem;
  left: 0rem;
  border-radius: 0.25rem;
  padding: 0.5rem;
  z-index: 4;
}

.shape_dtip_title {
  width: max-content;
  height: 100%;
  font-size: 0.875rem;
  color: #ffffff;
  margin-right: 0.75rem;
}

.shape_dtip_hotkey {
  width: max-content;
  height: 100%;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
}

.shape_mbox {
  width: 1rem;
  height: 1rem;
  margin-left: 0.125rem;
  cursor: pointer;
  outline: none;
  border: none;
  user-select: none;
}

.shape_down_arrow {
  width: 1rem;
  height: auto;
}

.shape_down_arrow:hover {
  margin-top: 0.25rem;
}

// .shape_down_arrow {
//   display: inline-block;
//   position: relative;
//   width: 16px;
//   height: 16px;
// }

// .shape_down_arrow::after {
//   display: inline-block;
//   content: "";
//   height: 8px;
//   width: 8px;
//   border-width: 0 1px 1px 0;
//   border-color: #94a7c0;
//   border-style: solid;
//   transform: matrix(0.71, 0.71, -0.71, 0.71, 0, 0);
//   transform-origin: center;
//   transition: transform 0.3s;
//   position: absolute;
//   top: 50%;
//   right: 4px;
//   margin-top: -6px;
// }

// .shape_down_arrow:hover::after {
//   top: 70%;
// }

.shape_mtip {
  position: absolute;
  width: auto;
  height: 2rem;
  background: rgba(0, 0, 0, 1);
  top: 3.25rem;
  left: 2rem;
  border-radius: 0.25rem;
  padding: 0.5rem;
  z-index: 4;
}

.shape_mtip_title {
  width: max-content;
  height: 100%;
  font-size: 0.875rem;
  color: #ffffff;
}

.shape_menus {
  position: absolute;
  width: auto;
  height: auto;
  background: rgba(255, 255, 255, 1);
  top: 3.25rem;
  left: 0rem;
  border-radius: 0.5rem;
  padding: 0.5rem 0px;
  z-index: 3;
  box-shadow: 0px 2px 10px 3px rgba(0, 0, 0, 0.15);
}

.shapes_menu {
  width: 10rem;
  height: 2rem;
  cursor: pointer;
}

.shapes_menu:hover {
  background: rgba(243, 63, 117, 1);

  .shapes_menu_show {
    filter: drop-shadow(2000vw 0 0 #ffffff);
    transform: translate(-2000vw);
  }

  .shapes_menu_title {
    color: #ffffff;
  }

  .shapes_menu_hotkey {
    color: rgba(255, 255, 255, 0.5);
  }
}

.shapes_menu_image {
  width: 1.5rem;
  height: 2rem;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}

.shapes_menu_show {
  width: 1.5rem;
  height: auto;
}

.shapes_menu_title {
  width: auto;
  height: 100%;
  flex-grow: 1;
  font-size: 0.875rem;
}

.shapes_menu_hotkey {
  width: 1rem;
  height: 100%;
  font-size: 0.875rem;
  margin-right: 0.75rem;
  color: rgba(0, 0, 0, 0.5);
}

.search_dbox {
  width: 3.125rem;
  height: 100%;
  cursor: pointer;
  user-select: none;
}

.search_dimage {
  width: 1.5rem;
  height: auto;
}

// .progress_container {
//   position: absolute;
//   top: 0;
//   left: 0;
//   z-index: 9;
//   width: 100%;
//   height: 100%;
//   background: rgb(26 0 44 / 0%);
// }

// .progress_box {
//   position: absolute;
//   top: 3.5rem;
//   right: 18rem;
//   width: 15rem;
//   height: 2rem;
// }

// .progress_range_label {
//   width: auto;
//   padding-left: 0.25rem;
//   color: rgb(26 32 44 / 70%);
//   font-weight: 400;
//   font-size: 0.875rem;
//   font-family: "Source Han Sans CN";
// }

// .progress_range_input {
// -webkit-appearance: none;
// width: 10rem;
// height: 0.5rem;
// accent-color: rgb(26 32 44 / 70%);
// border-radius: 10px; /*这个属性设置使填充进度条时的图形为圆角*/
// }

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
