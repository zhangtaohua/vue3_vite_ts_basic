<template>
  <div class="row_nw_fs_center tools_container">
    <div v-if="isShowMask" class="tools_mask" @click="maskClickHandle"></div>

    <!-- main menu -->
    <div
      class="row_nw_center_center first_wrapper"
      :class="{ first_wrapper_halfactive: menus.first.isShowChildren }"
      @click="mainELCHandle(true)"
    >
      <div class="row_nw_center_center first_dbox">
        <img class="first_dimage" :class="{ shape_svg_active: shapeCtl.isActive }" :src="menus.first.image" alt="pic" />
      </div>

      <div class="row_nw_center_center first_mbox">
        <img
          class="first_down_arrow"
          :class="{ shape_svg_active: shapeCtl.isActive }"
          :src="downArrowSvg"
          alt="expand"
        />
      </div>

      <div v-if="menus.first.isShowChildren" class="col_nw_fs_fs first_menus">
        <!-- 子菜单 第一级 -->
        <div
          v-for="(fmenu, index) in menus.first.children"
          :key="fmenu.id"
          class="col_nw_fs_fs first_big_menu"
          @click.stop="sendActionHandle(fmenu.action, fmenu.children)"
          @mouseenter="firstELCHandle($event, index)"
        >
          <div class="row_nw_sa_center first_menu">
            <div class="row_nw_fs_center first_menu_title">{{ fmenu.name }}</div>
            <div v-if="fmenu.hotKey" class="row_nw_fe_center first_menu_hotkey">{{ fmenu.hotKey }}</div>
            <div v-if="fmenu.children" class="row_nw_center_center first_menu_image">
              <img class="first_menu_show" :src="leftArrowSvg" alt="pic" />
            </div>
          </div>

          <div v-if="fmenu.isGroupGap" class="row_nw_center_center first_menu_bgap">
            <div class="first_menu_gap"></div>
          </div>

          <!-- 子菜单 第二级 -->
          <div v-if="fmenu.isShowChildren && fmenu.children" class="col_nw_fs_fs second_menus" :style="secondStyle">
            <div
              v-for="(smenu, sindex) in fmenu.children"
              :key="smenu.id"
              class="col_nw_fs_fs second_big_menu"
              @click.stop="sendActionHandle(smenu.action, smenu.children)"
              @mouseenter="secondELCHandle($event, sindex)"
            >
              <div class="row_nw_sa_center second_menu">
                <div class="row_nw_fs_center second_menu_title">{{ smenu.name }}</div>
                <div v-if="smenu.hotKey" class="row_nw_fe_center second_menu_hotkey">{{ smenu.hotKey }}</div>
                <div v-if="smenu.children" class="row_nw_center_center second_menu_image">
                  <img class="second_menu_show" :src="leftArrowSvg" alt="pic" />
                </div>
              </div>

              <div v-if="smenu.isGroupGap" class="row_nw_center_center second_menu_bgap">
                <div class="second_menu_gap"></div>
              </div>

              <!-- 子菜单  第三级 start -->
              <div v-if="smenu.isShowChildren && smenu.children" class="col_nw_fs_fs third_menus">
                <div
                  v-for="(tmenu, tindex) in smenu.children"
                  :key="tmenu.id"
                  class="row_nw_fs_center third_menu"
                  @click.stop="sendActionHandle(tmenu.action, tmenu.children)"
                >
                  <div class="row_nw_fs_center third_menu_title">{{ tmenu.name }}</div>
                  <div v-if="smenu.hotKey" class="row_nw_fe_center third_menu_hotkey">{{ tmenu.hotKey }}</div>
                </div>
              </div>
              <!-- 子菜单  第三级 end -->
            </div>
          </div>
          <!-- 子菜单  第二级 end -->
        </div>
      </div>
      <!-- 子菜单  第一级 end -->
    </div>

    <!-- end -->
  </div>
</template>

<script setup lang="ts">
import { defineComponent, ref, reactive, defineEmits } from "vue";

import pointSvg from "@/assets/images/maptools/point.svg";
import leftArrowSvg from "@/assets/images/maptools/leftArrow.svg";
import downArrowSvg from "@/assets/images/maptools/downArrow.svg";

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

const menus = reactive({
  first: {
    id: "first",
    image: pointSvg,
    name: "主菜单",
    action: "first",
    hotKey: "",
    isGroupGap: true,
    isEnable: true,
    isShowChildren: false,
    children: [
      {
        id: "Home",
        image: null,
        name: "主页",
        action: "home",
        hotKey: "",
        isGroupGap: true,
        isEnable: true,
        isShowChildren: false,
        children: null,
      },
      {
        id: "QuickActions",
        image: null,
        name: "快捷键",
        action: "quickActions",
        hotKey: "Ctrl+k",
        isGroupGap: true,
        isEnable: true,
        isShowChildren: false,
        children: null,
      },
      {
        id: "Files",
        image: null,
        name: "文件",
        action: "files",
        hotKey: "",
        isGroupGap: false,
        isEnable: true,
        isShowChildren: false,
        children: [
          {
            id: "NewMap",
            image: null,
            name: "新建地图",
            action: "newMap",
            hotKey: "",
            isGroupGap: false,
            isEnable: true,
            isShowChildren: false,
            children: null,
          },
          {
            id: "MoveMap",
            image: null,
            name: "移动地图",
            action: "moveMap",
            hotKey: "",
            isGroupGap: false,
            isEnable: true,
            isShowChildren: false,
            children: null,
          },
          {
            id: "DuplicateMap",
            image: null,
            name: "复制地图",
            action: "duplicateMap",
            hotKey: "",
            isEnable: true,
            isGroupGap: false,
            isShowChildren: false,
            children: null,
          },
          {
            id: "DeleteMap",
            image: null,
            name: "删除地图",
            action: "deleteMap",
            hotKey: "",
            isGroupGap: true,
            isEnable: true,
            isShowChildren: false,
            children: null,
          },
          {
            id: "UploadAnything",
            image: null,
            name: "上传",
            action: "uploadAnything",
            hotKey: "Gtrl+U",
            isGroupGap: false,
            isEnable: true,
            isShowChildren: false,
            children: null,
          },
          {
            id: "UploadFromURL",
            image: null,
            name: "上传URL",
            action: "uploadFromURL",
            hotKey: "Ctrl+Shift+U",
            isGroupGap: true,
            isEnable: true,
            isShowChildren: false,
            children: null,
          },
          {
            id: "ExportToImage",
            image: null,
            name: "导出图片",
            action: "exportToImage",
            hotKey: "",
            isGroupGap: false,
            isEnable: true,
            isShowChildren: false,
            children: null,
          },
          {
            id: "ExportToPDF",
            image: null,
            name: "导出PDF",
            action: "exportToPDF",
            hotKey: "",
            isGroupGap: false,
            isEnable: true,
            isShowChildren: false,
            children: null,
          },
          {
            id: "exportToGeojson",
            image: null,
            name: "导出Geojson",
            action: "exportToGeojson",
            hotKey: "",
            isGroupGap: false,
            isEnable: true,
            isShowChildren: false,
            children: null,
          },
          {
            id: "exportSelected",
            image: null,
            name: "导出选择",
            action: "exportToSelected",
            hotKey: "",
            isGroupGap: true,
            isEnable: true,
            isShowChildren: false,
            children: [
              {
                id: "exportSeledtedToGeojson",
                image: null,
                name: "导出选中为Geojson",
                action: "exportSeledtedToGeojson",
                hotKey: "",
                isGroupGap: false,
                isEnable: false,
                children: null,
              },
            ],
          },
          {
            id: "share",
            image: null,
            name: "共享",
            action: "share",
            hotKey: "",
            isGroupGap: false,
            isEnable: true,
            isShowChildren: false,
            children: null,
          },
          {
            id: "embed",
            image: null,
            name: "嵌入",
            action: "embed",
            hotKey: "",
            isGroupGap: false,
            isEnable: true,
            isShowChildren: false,
            children: null,
          },
        ],
      },
      {
        id: "edit",
        image: null,
        name: "编辑",
        action: "edit",
        hotKey: "",
        isGroupGap: false,
        isEnable: true,
        isShowChildren: false,
        children: [
          {
            id: "undo",
            image: null,
            name: "撤销",
            action: "undo",
            hotKey: "Ctrl+Z",
            isGroupGap: false,
            isEnable: true,
            isShowChildren: false,
            children: null,
          },
          {
            id: "redo",
            image: null,
            name: "重做",
            action: "redo",
            hotKey: "Ctrl+Shift+Z",
            isGroupGap: true,
            isEnable: true,
            isShowChildren: false,
            children: null,
          },
          {
            id: "cut",
            image: null,
            name: "剪切",
            action: "cut",
            hotKey: "Ctrl+X",
            isEnable: true,
            isGroupGap: false,
            isShowChildren: false,
            children: null,
          },
          {
            id: "copy",
            image: null,
            name: "复制",
            action: "copy",
            hotKey: "Ctrl+C",
            isGroupGap: true,
            isEnable: true,
            isShowChildren: false,
            children: null,
          },
          {
            id: "paste",
            image: null,
            name: "粘贴",
            action: "paste",
            hotKey: "Gtrl+V",
            isGroupGap: false,
            isEnable: true,
            isShowChildren: false,
            children: null,
          },
          {
            id: "duplicate",
            image: null,
            name: "备份",
            action: "duplicate",
            hotKey: "Ctrl+D",
            isGroupGap: false,
            isEnable: true,
            isShowChildren: false,
            children: null,
          },
          {
            id: "delete",
            image: null,
            name: "删除",
            action: "delete",
            hotKey: "Del",
            isGroupGap: true,
            isEnable: true,
            isShowChildren: false,
            children: null,
          },
          {
            id: "selectAll",
            image: null,
            name: "选择全部",
            action: "selectAll",
            hotKey: "Ctrl+A",
            isGroupGap: false,
            isEnable: true,
            isShowChildren: false,
            children: null,
          },
          {
            id: "unlock",
            image: null,
            name: "解锁",
            action: "unlock",
            hotKey: "Ctrl+Shift+L",
            isGroupGap: false,
            isEnable: false,
            isShowChildren: false,
            children: null,
          },
          {
            id: "group",
            image: null,
            name: "组",
            action: "group",
            hotKey: "",
            isGroupGap: false,
            isEnable: true,
            isShowChildren: false,
            children: [
              {
                id: "createGroup",
                image: null,
                name: "创建组",
                action: "createGroup",
                hotKey: "",
                isGroupGap: false,
                isEnable: false,
                isShowChildren: false,
                children: null,
              },
            ],
          },
          {
            id: "arrange",
            image: null,
            name: "组织",
            action: "arrange",
            hotKey: "",
            isGroupGap: false,
            isEnable: true,
            isShowChildren: false,
            children: [
              {
                id: "bringToFront",
                image: null,
                name: "移动到最前",
                action: "bringToFront",
                hotKey: "]",
                isGroupGap: false,
                isEnable: false,
                isShowChildren: false,
                children: null,
              },
              {
                id: "bringForward",
                image: null,
                name: "移动向上",
                action: "bringForward",
                hotKey: "Shift+]",
                isGroupGap: false,
                isEnable: false,
                isShowChildren: false,
                children: null,
              },
              {
                id: "bringBackward",
                image: null,
                name: "移动向下",
                action: "bringBackward",
                hotKey: "Shift+[",
                isGroupGap: false,
                isEnable: false,
                isShowChildren: false,
                children: null,
              },
              {
                id: "bringToBack",
                image: null,
                name: "移动到最后",
                action: "bringToBack",
                hotKey: "[",
                isGroupGap: false,
                isEnable: false,
                isShowChildren: false,
                children: null,
              },
            ],
          },
        ],
      },
    ],
  },
});

let oldFirstIndex = -1;

const secondStyle = reactive({
  top: "0px",
});

let oldSecondIndex = -1;

const thirdStyle = reactive({
  top: "0px",
});

function maskClickHandle() {
  menus.first.isShowChildren = false;
  isShowMask.value = false;

  // 清楚 hover 状态 避免 点击 mask 退出了主菜单
  if (oldFirstIndex != -1 && oldSecondIndex != -1) {
    menus.first.children[oldFirstIndex].children[oldSecondIndex].isShowChildren = false;
  }
  if (oldFirstIndex != -1) {
    menus.first.children[oldFirstIndex].isShowChildren = false;
  }
  oldSecondIndex = -1;
  oldFirstIndex = -1;
}

function mainELCHandle(isShow: boolean) {
  menus.first.isShowChildren = isShow;
  isShowMask.value = true;
}

function firstELCHandle(event, index: number) {
  if (oldFirstIndex != -1) {
    menus.first.children[oldFirstIndex].isShowChildren = false;
  }

  if (menus.first.children) {
    menus.first.children[index].isShowChildren = true;
    oldFirstIndex = index;

    secondStyle.top = event.target.offsetTop + "px";
  } else {
    oldFirstIndex = -1;
  }
}

function secondELCHandle(event, index: number) {
  if (oldFirstIndex != -1 && oldSecondIndex != -1 && menus.first.children[oldFirstIndex].children) {
    menus.first.children[oldFirstIndex].children[oldSecondIndex].isShowChildren = false;
  }

  if (oldFirstIndex != -1 && menus.first.children[oldFirstIndex].children) {
    menus.first.children[oldFirstIndex].children[index].isShowChildren = true;
    oldSecondIndex = index;

    thirdStyle.top = event.target.offsetTop + "px";
  } else {
    oldSecondIndex = -1;
  }
}

function sendActionHandle(action: string, children: any) {
  console.log("sendActionHandle", action, children);
  emit("onChange", action, children);

  // 用来隐藏菜单
  if (!children) {
    maskClickHandle();
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
  top: 0;
  left: 0;
  z-index: 1;
  width: 100vw;
  height: 100vh;
  background: rgb(255 0 0 / 25%);
}

.first_wrapper {
  position: relative;
  z-index: 2;
  width: auto;
  height: 2.5rem;
  border-radius: 0.25rem;
}

.first_wrapper:hover {
  background: rgb(229 229 229 / 100%);
}

.first_wrapper_halfactive {
  background: rgb(229 229 229 / 100%);
}

.first_wrapper_active {
  background: rgb(243 63 117 / 100%);
}

.first_wrapper_active:hover {
  background: rgb(243 63 117 / 100%);
}

.first_dbox {
  width: 2rem;
  height: 100%;
  cursor: pointer;
  user-select: none;
}

.first_dimage {
  width: 1.5rem;
  height: auto;
}

.shape_svg_active {
  transform: translate(-2000vw);
  filter: drop-shadow(2000vw 0 0 #fff);
}

.first_mbox {
  width: 1rem;
  height: 1rem;
  margin-left: 0.125rem;
  border: none;
  outline: none;
  cursor: pointer;
  user-select: none;
}

.first_down_arrow {
  width: 1rem;
  height: auto;
}

.first_down_arrow:hover {
  margin-top: 0.25rem;
}

.first_menus {
  position: absolute;
  top: 3.25rem;
  left: 0;
  z-index: 3;
  width: auto;
  height: auto;
  padding: 0.5rem 0;
  background: rgb(255 255 255 / 100%);
  border-radius: 0.5rem;
  box-shadow: 0 2px 10px 3px rgb(0 0 0 / 15%);
}

.first_big_menu {
  position: reactive;
  width: 11rem;
  height: auto;
}

.first_menu {
  width: 100%;
  height: 2rem;
  cursor: pointer;
}

.first_menu:hover {
  background: rgb(243 63 117 / 100%);

  .first_menu_show {
    transform: translate(-2000vw);
    filter: drop-shadow(2000vw 0 0 #fff);
  }

  .first_menu_title {
    color: #fff;
  }

  .first_menu_hotkey {
    color: rgb(255 255 255 / 50%);
  }
}

.first_menu_title {
  flex-grow: 1;
  width: max-content;
  height: 100%;
  margin-left: 0.5rem;
  font-size: 0.875rem;
}

.first_menu_hotkey {
  width: max-content;
  height: 100%;
  margin-right: 0.5rem;
  color: rgb(0 0 0 / 70%);
  font-size: 0.875rem;
}

.first_menu_image {
  width: max-content;
  height: 2rem;
  margin-right: 0.5rem;
}

.first_menu_show {
  width: auto;
  height: 0.875rem;
}

.first_menu_bgap {
  width: 100%;
  height: 1rem;
}

.first_menu_gap {
  width: calc(100% - 1rem);
  border-bottom: solid 1px rgb(0 0 0 / 10%);
}

.second_menus {
  position: absolute;
  top: 0;
  left: 11rem;
  z-index: 3;
  width: auto;
  height: auto;
  padding: 0.5rem 0;
  background: rgb(255 255 255 / 100%);
  border-radius: 0.5rem;
  box-shadow: 0 2px 10px 3px rgb(0 0 0 / 15%);
}

.second_big_menu {
  position: relative;
  width: 12rem;
  height: auto;
}

.second_menu {
  width: 100%;
  height: 2rem;
  cursor: pointer;
}

.second_menu:hover {
  background: rgb(243 63 117 / 100%);

  .second_menu_show {
    transform: translate(-2000vw);
    filter: drop-shadow(2000vw 0 0 #fff);
  }

  .second_menu_title {
    color: #fff;
  }

  .second_menu_hotkey {
    color: rgb(255 255 255 / 50%);
  }
}

.second_menu_title {
  flex-grow: 1;
  width: max-content;
  height: 100%;
  margin-left: 0.5rem;
  font-size: 0.875rem;
}

.second_menu_hotkey {
  width: max-content;
  height: 100%;
  margin-right: 0.5rem;
  color: rgb(0 0 0 / 70%);
  font-size: 0.875rem;
}

.second_menu_image {
  width: max-content;
  height: 2rem;
  margin-right: 0.5rem;
}

.second_menu_show {
  width: auto;
  height: 0.875rem;
}

.second_menu_bgap {
  width: 100%;
  height: 1rem;
}

.second_menu_gap {
  width: calc(100% - 1rem);
  border-bottom: solid 1px rgb(0 0 0 / 10%);
}

.third_menus {
  position: absolute;
  top: 0;
  left: 12rem;
  z-index: 3;
  width: auto;
  height: auto;
  padding: 0.5rem 0;
  background: rgb(255 255 255 / 100%);
  border-radius: 0.5rem;
  box-shadow: 0 2px 10px 3px rgb(0 0 0 / 15%);
}

.third_menu {
  width: 10rem;
  height: 2rem;
  cursor: pointer;
}

.third_menu:hover {
  background: rgb(243 63 117 / 100%);

  .third_menu_title {
    color: #fff;
  }

  .third_menu_hotkey {
    color: rgb(255 255 255 / 50%);
  }
}

.third_menu_title {
  flex-grow: 1;
  width: max-content;
  height: 100%;
  margin-left: 0.5rem;
  font-size: 0.875rem;
}

.third_menu_hotkey {
  width: max-content;
  height: 100%;
  margin-right: 0.5rem;
  color: rgb(0 0 0 / 70%);
  font-size: 0.875rem;
}
</style>
