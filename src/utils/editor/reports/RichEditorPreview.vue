<template>
  <div class="col_nw_fs_fs rj_rpt_editor_preview_w">
    <div class="row_nw_fs_center rj_rpt_editor_preview_t">
      {{ configData.node.title }}
    </div>
    <div class="rj_rpt_editor_preview_c">
      <Editor :defaultConfig="editorConfig" :mode="mode" @onCreated="handleCreated" />
    </div>
  </div>
</template>

<script setup lang="ts">
import "@wangeditor/editor/dist/css/style.css"; // 引入 css
import { Editor } from "@wangeditor/editor-for-vue";
import { IEditorConfig } from "@wangeditor/editor";
import { onBeforeUnmount, shallowRef, defineProps, watch, nextTick } from "vue";
import { addTokenInImgTagByReg } from "../../common/imageTokenParse";

// import { getAuthToken } from "@/composables/useAuth";

// const authToken = getAuthToken().accessToken;
const authToken = "";

const props = defineProps({
  configData: {
    type: Object,
    default() {
      return {
        node: {
          html: "",
        },
      };
    },
  },
});

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();

// 内容 HTML
const mode = "default"; // 或 'simple'
const editorConfig: Partial<IEditorConfig> = {
  readOnly: true,
  autoFocus: false,
  scroll: false,
};

function initTitleHtml() {
  if (props.configData.node && props.configData.node.html) {
    if (editorRef.value) {
      // editorRef.value.setHtml("");
      editorRef.value.clear();
      nextTick(() => {
        const addTokenHtml = addTokenInImgTagByReg(`${props.configData.node.html}`, authToken);
        editorRef.value.setHtml(addTokenHtml);
      });
    }
  }
}

watch(
  () => props.configData,
  () => {
    initTitleHtml();
  },
  {
    deep: true,
    immediate: false,
  },
);

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  destroyEditor();
});

async function destroyEditor() {
  const editor = editorRef.value;
  if (editor == null) {
    return null;
  } else {
    editor.destroy();
    editorRef.value = null;
  }
}

const handleCreated = (editor: any) => {
  editorRef.value = editor; // 记录 editor 实例，重要！
  editorRef.value.disable();
  initTitleHtml();
  // console.log("handleCreated");
};
</script>

<style scoped>
.rj_rpt_editor_preview_w {
  width: 100%;
  height: auto;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.rj_rpt_editor_preview_t {
  width: 100%;
  height: 3rem;
  padding-left: 1rem;
  color: black;
  font-size: 1.5rem;
}

.rj_rpt_editor_preview_c {
  width: 100%;
  height: auto;
  padding: 0.75rem;
}
</style>
