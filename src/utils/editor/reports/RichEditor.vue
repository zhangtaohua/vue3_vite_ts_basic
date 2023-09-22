<template>
  <div class="col_nw_fs_center rj_rpt_edit_wrapper">
    <div class="row_nw_fs_center rj_rpt_edit_t" @click="setAllowEditorFocus(false)">
      <span class="row_nw_fs_center rj_rpt_edit_tl">标题:</span>
      <a-input ref="titleInputRef" v-model:value="titleValue" placeholder="请输入" />
    </div>
    <div class="rj_rpt_edit_c" @click="setAllowEditorFocus(true)">
      <Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />
      <Editor
        v-model="htmlValue"
        style="height: 800px; overflow-y: hidden"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
        @onChange="handleChange"
      />
    </div>

    <div class="h_32r flex_no_shrink"></div>

    <div class="row_nw_fs_center rj_rpt_tips_t">请输入信息查询图片：</div>
    <div class="row_nw_fs_center rj_rpt_im_t" @click="setAllowEditorFocus(false)">
      <span class="row_nw_fs_center rj_rpt_im_tl">名称:</span>
      <a-input v-model:value="search.name" placeholder="请输入" />
    </div>
    <div class="row_nw_fs_center rj_rpt_im_t" @click="setAllowEditorFocus(false)">
      <span class="row_nw_fs_center rj_rpt_im_tl">经度:</span>
      <a-input v-model:value="search.longitude" placeholder="请输入" />
    </div>
    <div class="row_nw_fs_center rj_rpt_im_t" @click="setAllowEditorFocus(false)">
      <span class="row_nw_fs_center rj_rpt_im_tl">纬度:</span>
      <a-input v-model:value="search.latitude" placeholder="请输入" />
    </div>
    <div class="row_nw_fs_center rj_rpt_im_t" @click="setAllowEditorFocus(false)">
      <span class="row_nw_fs_center rj_rpt_im_tl">时间:</span>
      <a-range-picker
        v-model:value="search.timeRange"
        :format="dateFormat"
        :getPopupContainer="getAntdvPopupContainer"
      />
    </div>

    <div class="row_nw_fe_center rj_rpt_im_t" @click="setAllowEditorFocus(false)">
      <a-button type="primary" size="medium" @click="searchImageHandle">
        <template #icon><SearchOutlined /></template>
        查询
      </a-button>
      <div class="w_16r"></div>
      <a-button type="primary" size="medium" ghost @click="resetSearchImageHandle">
        <template #icon><UndoOutlined /></template>
        重置
      </a-button>
    </div>
    <div class="h_32r flex_no_shrink"></div>

    <div v-if="search.result.length" class="col_nw_fs_fs rj_rpt_im_r">
      <div class="row_nw_fs_center rj_rpt_im_rt">查询结果：</div>
      <div class="h_8r"></div>
      <div class="row_nw_fs_center rj_rpt_im_rlist">
        <div v-for="(imgsrc, index) in search.result" :key="'imr_' + index" class="col_nw_fs_center rj_rpt_im_rit">
          <img class="rj_rpt_im_ritimg" :src="`${imgsrc?.url}?token=${authToken}`" @click="copyImgScrToClipboard" />
          <div v-if="imgsrc.issue" class="row_nw_fs_center rj_rpt_im_ritlabel">
            {{ imgsrc.issue }}
          </div>
          <div v-if="imgsrc.bus && imgsrc.bus[0]" class="row_nw_fs_center rj_rpt_im_ritlabel">
            {{ imgsrc.bus[0].platformName }}
          </div>
          <div v-if="imgsrc.name" class="row_nw_fs_center rj_rpt_im_ritlabel">
            {{ imgsrc.name }}
          </div>
          <div v-if="imgsrc.filename" class="row_nw_fs_center rj_rpt_im_ritlabel">
            {{ imgsrc.filename }}
          </div>
        </div>
      </div>
    </div>
    <div class="h_32r flex_no_shrink"></div>
  </div>
</template>

<script setup lang="ts">
import "@wangeditor/editor/dist/css/style.css"; // 引入 css

import { onBeforeUnmount, reactive, ref, shallowRef, watch } from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";

import { SearchOutlined, UndoOutlined } from "@ant-design/icons-vue";

import dayjs from "dayjs";
// import type { Dayjs } from "dayjs";

import { useReportModuleVnodeStore } from "@/stores/reports";
// import lodash from "lodash";

import { getAntdvPopupContainer } from "../../common/antdvPositionFixed";

// import { getPicturesRequest } from "@/api/platform";

import { trimTokenInImgTagByReg, addTokenInImgTagByReg } from "../../common/imageTokenParse";

import Clipboard from "clipboard";

// import { getAuthToken } from "@/composables/useAuth";

// const authToken = getAuthToken().accessToken;
const authToken = "";

const dateFormat = "YYYY-MM-DD";

// 当前正在编辑的 富文本 节点
const currentModuleVnode = useReportModuleVnodeStore();

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();

// ！！！！！！！！！！！
// 标题 title
const titleValue = ref("");
// 内容 HTML
const htmlValue = ref("<p>hello</p>");

const mode = "default"; // 或 'simple' "default"
const toolbarConfig: Partial<IToolbarConfig> = {
  excludeKeys: ["uploadImage", "group-video"],
};
const editorConfig = {
  placeholder: "请输入内容...",
  autoFocus: true,
};

// 测试字段
// "<p>一、请编辑示例标题</p><p>一、请编辑示例标题</p><p>一、请编辑示例标题<img src=\"https://img.gogo51.com:8988/uploads/allimg/210608/1-21060R22404-50.jpg\" alt=\"\" data-href=\"\" style=\"\"/></p>"
function initTitleHtml() {
  const vnode = currentModuleVnode.reportModule.vnode;
  console.log("isRefresh editor", vnode);
  if (vnode.node.title) {
    titleValue.value = vnode.node.title;
  }
  if (vnode.node.html) {
    // 这里有坑!! 直接在两个富文本间切换时，测试复杂的html字符串不能成功反显，直接空白了。
    // 目前判断是vue的问题，必须重新创建！！！

    const addTokenHtml = addTokenInImgTagByReg(`${vnode.node.html}`, authToken);
    htmlValue.value = addTokenHtml;
  }
}

watch(
  () => currentModuleVnode.reportModule.isRefresh,
  () => {
    initTitleHtml();
  },
  {
    deep: true,
    immediate: true,
  },
);

watch(
  [titleValue, htmlValue],
  () => {
    updateVnodeData();
  },
  {
    deep: true,
    immediate: false,
  },
);

// 解决 图片 视频 功能不能focus bug
let isAllowEditorFocus = false;
let isModalOrPanelShow = false;

const titleInputRef = ref(null);
function updateVnodeData() {
  const vNode = {
    ...currentModuleVnode.reportModule.vnode,
  };
  vNode.node.title = titleValue.value;
  // editorRef.value && editorRef.value.getHtml()
  const trimHtml = trimTokenInImgTagByReg(htmlValue.value);
  vNode.node.html = trimHtml;
  currentModuleVnode.setModuleVnode(vNode);

  // 下面代码用于解决 title 会丢失光标的问题
  setTimeout(() => {
    // 如果不是编辑器 要focus 光标 就让标题获取光标
    if (!isAllowEditorFocus) {
      titleInputRef.value.focus();
    }
  }, 100);
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) {
    return;
  } else {
    editorRef.value.blur();
    setTimeout(() => {
      editorRef.value.destroy();
      editorRef.value = null;
    }, 1000);
  }
});

const handleCreated = (editor: any) => {
  editorRef.value = editor; // 记录 editor 实例，重要！
  // console.log("handleCreated config");

  editor.on("modalOrPanelShow", () => {
    isModalOrPanelShow = true;
  });
  editor.on("modalOrPanelHide", () => {
    isModalOrPanelShow = false;
  });
};

const handleChange = () => {
  console.log("handleChange", isModalOrPanelShow, isAllowEditorFocus);
  if (editorRef.value) {
    if (!isModalOrPanelShow && isAllowEditorFocus) {
      editorRef.value.focus();
    }
  }
};
// 这个函数不得已而有,为了防止 wangeditor 一直 focus
const setAllowEditorFocus = (isAllow: boolean) => {
  isAllowEditorFocus = isAllow;
};

// const handleBlur = (abc: any) => {
//   console.log("handleBlur", abc);
// };

const search = reactive({
  name: "",
  longitude: "",
  latitude: "",
  timeRange: [],
  isRefresh: 1,
  result: [],
});

function searchImageHandle() {
  // for test
  // search.result = fakeResultList;
  getPicturesReqHandle();
}

// function getPicturesReqHandle() {
//   const reqData = {
//     // sort: "",
//     // order: "",
//     page: 0,
//     pagesize: 100,
//     // issue: "",
//     // extent: "",
//     // platformUuid: search.platformUuid,
//     // platformName: "",
//     // projectUuid: "",
//     // projectName: "",
//     // marked: search.isAnnotation,
//     // name: search.name,
//     // any: "",
//     status: "stored",
//   };
//   getPicturesRequest(reqData)
//     .then((res: any) => {
//       console.log("getPicturesReqHandle OK", res);
//       if (res.code === 0 && res.data && res.data.list && res.data.list.length) {
//         search.result = res.data.list;
//       } else {
//         search.result = [];
//       }
//     })
//     .catch((err: any) => {
//       console.log("getPicturesReqHandle error", err);
//       search.result = [];
//     });
// }

function resetSearchImageHandle() {
  search.name = "";
  search.longitude = "";
  search.latitude = "";
  search.timeRange = [];
  search.result = [];
}

function copyImgScrToClipboard($event: MouseEvent) {
  const clipboardIns = new Clipboard($event.target, {
    text: (trigger: any) => {
      // 这里可能会有bug 就是可能会带上http 等 所以最好也还是处理一下
      let originSrc = trigger.getAttribute("src");
      const urlReg = /(\w+):\/\/([^/:]+)(:\d*)?/;
      if (originSrc && urlReg.test(originSrc)) {
        originSrc = originSrc.replace(urlReg, "");
      }
      // console.log("trigger src", originSrc);
      return originSrc;
    },
  });

  clipboardIns.on("success", () => {
    clipboardIns.destroy();
  });
  clipboardIns.on("error", () => {
    console.log("editor clipboard error!");
    clipboardIns.destroy();
  });

  clipboardIns.onClick($event);
}
</script>

<style scoped lang="scss">
.rj_rpt_edit_wrapper {
  width: 100%;
  height: 100%;
  scrollbar-width: none;
  -ms-overflow-style: none;
  overflow-x: overlay;
  overflow-y: scroll;
  scroll-behavior: smooth;
}

.rj_rpt_edit_wrapper::-webkit-scrollbar {
  display: none;
}

.rj_rpt_edit_t {
  width: 96%;
  height: 3.75rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.rj_rpt_edit_tl {
  width: 4rem;
  height: 100%;
  font-size: 1rem;
}

.rj_rpt_edit_c {
  flex-shrink: 0;
  width: 96%;
  border: 1px solid #ccc;
}

.rj_rpt_tips_t {
  flex-shrink: 0;
  width: 96%;
  height: 2rem;
  margin-bottom: 1rem;
  color: #333;
  font-weight: bolder;
  font-size: 1rem;
}

.rj_rpt_im_t {
  flex-shrink: 0;
  width: 96%;
  height: 2.5rem;
}

.rj_rpt_im_tl {
  flex-shrink: 0;
  width: 5rem;
  height: 100%;
  font-size: 1rem;
}

.rj_rpt_im_r {
  width: 96%;
  height: auto;
}

.rj_rpt_im_rt {
  width: 100%;
  height: 2rem;
  margin-bottom: 1rem;
  color: #333;
  font-size: 0.875rem;
}

.rj_rpt_im_rlist {
  width: 100%;
  height: 30rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
  overflow-x: scroll;
  overflow-y: overlay;
  scroll-behavior: smooth;
}

.rj_rpt_im_rit {
  width: auto;
  height: 100%;
  margin-right: 1rem;
}

.rj_rpt_im_rit:focus {
  outline: 1px solid #40a9ff;
}

.rj_rpt_im_ritimg {
  width: auto;
  height: calc(100% - 9rem);
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.rj_rpt_im_ritlabel {
  width: max-content;
  height: 2rem;
  color: #333;
  font-size: 0.875rem;
}
</style>
