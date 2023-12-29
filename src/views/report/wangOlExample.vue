<template>
  <div style="border-bottom: 1px solid #e8e8e8">
    <div id="editor-toolbar">
      <Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />
    </div>
  </div>
  <div id="content">
    <div id="editor-container">
      <div class="col_nw_fs_fs rj_page_container">
        <div v-for="index in 120" :key="'page_index_' + index" class="col_nw_fs_fs rj_page_a4">
          <div class="row_nw_sb_fe rj_page_top">
            <div class="row_nw_sb_fe rj_page_uldcg"></div>
            <div class="row_nw_sb_fe rj_page_urdcg"></div>
          </div>
          <div class="row_nw_sb_fe rj_page_center">
            <div class="row_nw_sb_fe rj_page_left_gap"></div>
            <div class="row_nw_sb_fe rj_page_editor_box"></div>
            <div class="row_nw_sb_fe rj_page_right_gap"></div>
          </div>
          <div class="row_nw_sb_fs rj_page_bottom">
            <div class="row_nw_sb_fe rj_page_bldcg"></div>
            <div class="row_nw_sb_fe rj_page_brdcg"></div>
          </div>
        </div>
      </div>
      <div id="editor-text-area">
        <Editor
          v-model="htmlValue"
          style="height: auto; min-height: 29.7cm; outline-width: 1px; outline-color: red;"
          :defaultConfig="editorConfig"
          :mode="mode"
          @onCreated="handleCreated"
          @onChange="handleChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import "@wangeditor/editor/dist/css/style.css"; // 引入 css
import { onBeforeUnmount, reactive, ref, shallowRef, watch } from "vue";

import {
  EchartLineMenuKey,
  DeleteEchartMenuKey,
  EditEchartMenuKey,
  Width30EchartMenuKey,
  Width50EchartMenuKey,
  Width70EchartMenuKey,
  Width100EchartMenuKey,
  HeightMinusEchartMenuKey,
  HeightPlusEchartMenuKey,
  WidthMinusEchartMenuKey,
  WidthPlusEchartMenuKey,
} from "@/utils/editor/plugin/echart/line/menu/index";
import EchartLineModule from "@/utils/editor/plugin/echart/line/index";

import { wangEditorEchartLineType } from "@/utils/editor/plugin/echart/line/custom-types";

import {
  EchartBarMenuKey,
  DeleteEchartBarMenuKey,
  EditEchartBarMenuKey,
  Width30EchartBarMenuKey,
  Width50EchartBarMenuKey,
  Width70EchartBarMenuKey,
  Width100EchartBarMenuKey,
  HeightMinusEchartBarMenuKey,
  HeightPlusEchartBarMenuKey,
  WidthPlusEchartBarMenuKey,
  WidthMinusEchartBarMenuKey,
} from "@/utils/editor/plugin/echart/bar/menu/index";
import EchartBarModule from "@/utils/editor/plugin/echart/bar/index";

import { wangEditorEchartBarType } from "@/utils/editor/plugin/echart/bar/custom-types";

import { OlMapModalMenuKey } from "@/utils/editor/plugin/ol/menu/olModalMenu";
import OlMapModule from "@/utils/editor/plugin/ol/index";

import PaginationModule from "@/utils/editor/plugin/pagination";

import { wangEditorPaginationType, PaginationElement } from "@/utils/editor/plugin/pagination/custom-types";
import { insertPageHeader, adjustPagePagination } from "@/utils/editor/plugin/pagination/tools";

import { Boot } from "@wangeditor/editor";

Boot.registerModule(EchartLineModule);
Boot.registerModule(EchartBarModule);
Boot.registerModule(OlMapModule);
Boot.registerModule(PaginationModule);

import { Editor, Toolbar } from "@wangeditor/editor-for-vue";

// 解决 图片 视频 功能不能focus bug
let isAllowEditorFocus = false;
let isModalOrPanelShow = false;

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();

// ！！！！！！！！！！！
// 标题 title
const titleValue = ref("");
// 内容 HTML
const htmlValue = ref("<p>hehehe</p>");

const mode = "default"; // 或 'simple' "default"
const toolbarConfig: Partial<IToolbarConfig> = {
  excludeKeys: ["uploadImage", "group-video"],
  insertKeys: {
    index: 30, // 插入的位置，基于当前的 toolbarKeys
    keys: ["|", EchartLineMenuKey, EchartBarMenuKey, OlMapModalMenuKey, "|"], // show menu in toolbar
  },
};
const editorConfig = {
  placeholder: "请输入内容...",
  autoFocus: true,
  hoverbarKeys: {
    [wangEditorEchartLineType]: {
      menuKeys: [
        Width30EchartMenuKey,
        Width50EchartMenuKey,
        Width70EchartMenuKey,
        Width100EchartMenuKey,
        WidthMinusEchartMenuKey,
        WidthPlusEchartMenuKey,
        HeightMinusEchartMenuKey,
        HeightPlusEchartMenuKey,
        EditEchartMenuKey,
        DeleteEchartMenuKey,
      ],
    },
    [wangEditorEchartBarType]: {
      menuKeys: [
        Width30EchartBarMenuKey,
        Width50EchartBarMenuKey,
        Width70EchartBarMenuKey,
        Width100EchartBarMenuKey,
        WidthMinusEchartBarMenuKey,
        WidthPlusEchartBarMenuKey,
        HeightMinusEchartBarMenuKey,
        HeightPlusEchartBarMenuKey,
        EditEchartBarMenuKey,
        DeleteEchartBarMenuKey,
      ],
    },
  },
};

let oldPageHeight = 0;
let isInited = false;
const handleCreated = (editor: any) => {
  editorRef.value = editor; // 记录 editor 实例，重要！
  // console.log("handleCreated config");
  window.rjEditor = editor;
  editor.on("modalOrPanelShow", () => {
    isModalOrPanelShow = true;
  });
  editor.on("modalOrPanelHide", () => {
    isModalOrPanelShow = false;
  });

  setTimeout(() => {
    insertPageHeader(editor);
    oldPageHeight = editor.getEditableContainer().clientHeight;
    isInited = true;
  }, 10);
};

const handleChange = (editor: any) => {
  console.log("handleChange", isModalOrPanelShow, isAllowEditorFocus, editor);
  if (editorRef.value && isInited) {
    if (!isModalOrPanelShow && isAllowEditorFocus) {
      editorRef.value.focus();
    }

    // 调整分页
    setTimeout(() => {
      let newPageHeight = editor.getEditableContainer().clientHeight;
      console.log("调整页面", newPageHeight, oldPageHeight);
      if (Math.abs(newPageHeight - oldPageHeight) >= 10) {
        adjustPagePagination(editor);
        setTimeout(() => {
          newPageHeight = editor.getEditableContainer().clientHeight;
          oldPageHeight = newPageHeight;
        }, 100);
      }
    }, 100);
  }
};
</script>

<style scoped>
#editor-toolbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 0 auto;
  background-color: #fcfcfc;
}

#content {
  position: relative;
  height: calc(100% - 40px);
  overflow-y: auto;
  background-color: rgb(245 245 245);
}

#editor-container {
  position: relative;
  width: 21cm;
  height: calc(100% - 100px);
  margin: 30px auto 60px;
  overflow-y: scroll;
  background-color: #f00;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 10px rgb(0 0 0 / 12%);
}

#editor-container::-webkit-scrollbar {
  display: none;
}

.rj_page_container {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  width: 100%;
  height: auto;
  margin: 0;
  padding: 0;
  background-color: rgb(255 255 255 / 100%);
}

.rj_page_a4 {
  width: 100%;
  height: 29.7cm;
  margin: 0;
  padding: 0;
  background-color: rgb(255 255 255 / 100%);
  box-shadow: 0 2px 10px rgb(0 0 0 / 12%);
}

.rj_page_top {
  width: 100%;
  height: 2cm;
  margin: 0;
  padding: 0;
  background-color: rgb(255 255 255 / 80%);
}

.rj_page_bottom {
  width: 100%;
  height: 2cm;
  background-color: rgb(255 255 255 / 80%);
}

.rj_page_center {
  width: 100%;
  height: 25.7cm;
  background-color: rgb(255 255 255 / 60%);
}

.rj_page_uldcg {
  width: 1cm;
  height: 1cm;
  margin-left: 1cm !important;
  background-color: rgb(0 0 0 / 10%);
}

.rj_page_urdcg {
  width: 1cm;
  height: 1cm;
  margin-right: 1cm !important;
  background-color: rgb(0 0 0 / 10%);
}

.rj_page_bldcg {
  width: 1cm;
  height: 1cm;
  margin-left: 1cm !important;
  background-color: rgb(0 0 0 / 10%);
}

.rj_page_brdcg {
  width: 1cm;
  height: 1cm;
  margin-right: 1cm !important;
  background-color: rgb(0 0 0 / 10%);
}

.rj_page_left_gap {
  width: 2cm;
  height: 25.7cm;
  background-color: rgb(0 0 0 / 50%);
}

.rj_page_right_gap {
  width: 2cm;
  height: 25.7cm;
  background-color: rgb(0 0 0 / 50%);
}

.rj_page_editor_box {
  width: 17cm;
  height: 25.7cm;
  background-color: rgb(255 255 255 / 0%);
}

#editor-text-area {
  z-index: 1;
  width: 17cm;
  height: auto;
  min-height: 29.7cm;
  margin: 0 auto;
  background-color: transparent;
}
</style>
