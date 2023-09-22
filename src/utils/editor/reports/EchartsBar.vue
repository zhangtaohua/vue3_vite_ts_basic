<template>
  <div class="col_nw_fs_center wh_100p_100p">
    <div class="row_nw_center_center rj_rpt_line_b">
      <a-button type="primary" size="large" @click="downDataModule('barModule.csv')">
        <template #icon><DownloadOutlined /></template>
        下载模块
      </a-button>
      <div class="w_32r"></div>

      <a-upload
        v-model:file-list="lineFileList"
        name="lineCsvFile"
        action=""
        :multiple="false"
        :show-upload-list="false"
        :before-upload="lineFileBeforeUploadHandle"
        @change="lineFileChangeHandle"
      >
        <a-button type="primary" size="large">
          <template #icon><UploadOutlined /></template>
          选择文件
        </a-button>
      </a-upload>
      <div class="w_32r"></div>

      <a-button type="primary" size="large">
        <template #icon><InfoCircleOutlined /></template>
        选择指标
      </a-button>
    </div>
    <div class="row_nw_fs_center rj_rpt_line_t">
      <span class="row_nw_fs_center rj_rpt_line_tl">标题:</span>
      <a-input v-model:value="echartsData.title" placeholder="请输入" />
    </div>
    <div class="row_nw_fs_center rj_rpt_line_t">
      <span class="row_nw_fs_center rj_rpt_line_tl">图注名称:</span>
      <a-input v-model:value="echartsData.name" placeholder="请输入" />
    </div>
    <div class="h_8r"></div>

    <div class="row_nw_fs_center rj_rpt_line_t">
      <span class="row_nw_fs_center rj_rpt_line_tl">是否堆叠:</span>
      <a-radio-group v-model:value="echartsData.chart.stack_type" :options="simpleLineTypeOptions" />
    </div>
    <div class="h_8r"></div>

    <div class="row_nw_fs_center rj_rpt_line_t">
      <span class="row_nw_fs_center rj_rpt_line_tl">X轴名称:</span>
      <a-input v-model:value="echartsData.chart.xaxis_name" placeholder="请输入" />
    </div>
    <div class="row_nw_fs_center rj_rpt_line_t">
      <span class="row_nw_fs_center rj_rpt_line_tl">X轴单位:</span>
      <a-input v-model:value="echartsData.chart.xaxis_unit" placeholder="请输入" />
    </div>
    <div class="row_nw_fs_center rj_rpt_line_t">
      <span class="row_nw_fs_center rj_rpt_line_tl">X轴数据 *:</span>
      <a-input v-model:value="echartsData.chart.xaxis_data" placeholder="请输入" />
    </div>

    <div class="h_8r"></div>
    <div v-for="(ydata, index) in echartsData.chart.yaxis" :key="'y_' + index" class="col_nw_fs_center rj_rpt_line_yt">
      <div class="row_nw_fs_center rj_rpt_line_t">
        <span class="row_nw_fs_center rj_rpt_line_tl">Y轴名称:</span>
        <a-input v-model:value="echartsData.chart.yaxis[index].name" placeholder="请输入" />
      </div>
      <div class="row_nw_fs_center rj_rpt_line_t">
        <span class="row_nw_fs_center rj_rpt_line_tl">Y轴单位:</span>
        <a-input v-model:value="echartsData.chart.yaxis[index].unit" placeholder="请输入" />
      </div>
      <div class="row_nw_fs_center rj_rpt_line_t">
        <span class="row_nw_fs_center rj_rpt_line_tl">Y轴数据 *:</span>
        <a-input v-model:value="echartsData.chart.yaxis[index].data" placeholder="请输入" />
      </div>
      <div class="h_8r"></div>
    </div>
    <div class="row_nw_fs_center rj_rpt_line_t">
      <a-button type="primary" size="small" @click="addYdataHandle">
        <template #icon><PlusOutlined /></template>
      </a-button>
      <div class="w_16r"></div>
      <a-button
        type="primary"
        ghost
        size="small"
        :disabled="echartsData.chart.yaxis.length === 1"
        @click="deleteYdataHandle"
      >
        <template #icon><MinusOutlined /></template>
      </a-button>
    </div>
    <div class="h_16r"></div>

    <div class="row_nw_fs_center rj_rpt_line_t">
      <span class="row_nw_fs_center rj_rpt_line_tl">说明/结论:</span>
    </div>
    <div class="rj_rpt_line_c">
      <Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />
      <Editor
        v-model="echartsData.conclusion"
        style="height: 300px; overflow-y: hidden"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import "@wangeditor/editor/dist/css/style.css"; // 引入 css
import { IToolbarConfig } from "@wangeditor/editor";

import { onBeforeUnmount, ref, shallowRef, watch, reactive, nextTick } from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";

import { useReportModuleVnodeStore } from "@/stores/reports";
import {
  UploadOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  MinusOutlined,
  DownloadOutlined,
} from "@ant-design/icons-vue";
import type { UploadProps, UploadChangeParam } from "ant-design-vue";
import lodash from "lodash";
import { EchartsBarType, simpleLineTypeOptions } from "@/common/echarts/barOptions";

import { parse } from "csv-parse/browser/esm";

import { downDataModule } from "@/utils/common/downloadFiles";

// 当前正在编辑的 富文本 节点
const currentModuleVnode = useReportModuleVnodeStore();

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();
// 标题 title
const echartsData = reactive({
  title: "",
  name: "",
  // 这里要再包一层，不然输入一次title, name, conclusion 就会画一次图
  chart: {
    stack_type: EchartsBarType.noStack,
    xaxis_name: "",
    xaxis_unit: "",
    xaxis_data: "",
    yaxis: [
      {
        name: "",
        unit: "",
        data: "",
      },
    ],
  },
  conclusion: "",
});

const lineFileList = ref([]);

const lineFileChangeHandle = (info: UploadChangeParam) => {
  if (info.file.status !== "uploading") {
    console.log(info.file, info.fileList);
  }
  if (info.file.status === "done") {
    console.log(`${info.file.name} file uploaded successfully`);
  } else if (info.file.status === "error") {
    console.log(`${info.file.name} file upload failed.`);
  }
};

// const lineFilePreviewHandle: UploadProps["previewFile"] = (file) => {
//   console.log("lineFilePreviewHandle", file);
//   // Your process logic. Here we just mock to the same file
//   return "";
// };

const lineFileBeforeUploadHandle: UploadProps["beforeUpload"] = (file) => {
  const lineRecords = [];
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    console.log("file name", file);
    reader.readAsText(file);
    reader.onload = () => {
      console.log("reader.result", reader);
      const csvParse = parse(reader.result, {
        delimiter: ",",
      });
      // Use the readable stream api to consume records
      csvParse.on("readable", () => {
        let record;
        while ((record = csvParse.read()) !== null) {
          lineRecords.push(record);
        }
      });
      // Catch any error
      csvParse.on("error", (err) => {
        console.error(err);
      });
      // Test that the parsed records matched the expected records
      csvParse.on("end", () => {
        console.log("parseEnd", lineRecords);
        setCsvDataToEchartsData(lineRecords);
      });
    };

    return reject(false);
  });
};

function setCsvDataToEchartsData(lineRecords: Array<any>) {
  if (lineRecords.length) {
    const chartsTemp = {
      stack_type: echartsData.chart.stack_type,
      xaxis_name: "",
      xaxis_data: "",
      xaxis_unit: "",
      yaxis: [],
    };
    for (let i = 0; i < lineRecords.length; i++) {
      if (lineRecords[i][0] == "") {
        break;
      } else if (lineRecords[i][0] == "title") {
        echartsData.title = lineRecords[i][1];
      } else if (lineRecords[i][0] == "name") {
        echartsData.name = lineRecords[i][1];
      } else if (lineRecords[i][0] == "xaxis_data") {
        lineRecords[i].shift();
        chartsTemp.xaxis_data = lineRecords[i].join(",");
      } else if (lineRecords[i][0] == "xaxis_unit") {
        chartsTemp.xaxis_unit = lineRecords[i][1];
      } else if (lineRecords[i][0] == "xaxis_name") {
        chartsTemp.xaxis_name = lineRecords[i][1];
      } else if (lineRecords[i][0].startsWith("yaxis_data")) {
        const index = parseInt(lineRecords[i][0].split("_")[2]) - 1;
        if (chartsTemp.yaxis[index]) {
          lineRecords[i].shift();
          chartsTemp.yaxis[index]["data"] = lineRecords[i].join(",");
        } else {
          lineRecords[i].shift();
          const ydataTemp = {
            name: "",
            data: lineRecords[i].join(","),
            unit: "",
          };
          chartsTemp.yaxis.push(ydataTemp);
        }
      } else if (lineRecords[i][0].startsWith("yaxis_name")) {
        const index = parseInt(lineRecords[i][0].split("_")[2]) - 1;
        if (chartsTemp.yaxis[index]) {
          chartsTemp.yaxis[index]["name"] = lineRecords[i][1];
        } else {
          const ydataTemp = {
            name: lineRecords[i][1],
            data: "",
            unit: "",
          };
          chartsTemp.yaxis.push(ydataTemp);
        }
      } else if (lineRecords[i][0].startsWith("yaxis_unit")) {
        const index = parseInt(lineRecords[i][0].split("_")[2]) - 1;
        if (chartsTemp.yaxis[index]) {
          chartsTemp.yaxis[index]["unit"] = lineRecords[i][1];
        } else {
          const ydataTemp = {
            name: "",
            data: "",
            unit: lineRecords[i][1],
          };
          chartsTemp.yaxis.push(ydataTemp);
        }
      }
    }
    echartsData.chart = chartsTemp;
  }
}

const mode = "default"; // 或 'simple' 'default'
const toolbarConfig: Partial<IToolbarConfig> = {
  toolbarKeys: [
    "headerSelect",
    "blockquote",
    "|",
    "bold",
    "underline",
    "italic",
    {
      key: "group-more-style",
      title: "更多",
      iconSvg:
        '<svg viewBox="0 0 1024 1024"><path d="M204.8 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path><path d="M505.6 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path><path d="M806.4 505.6m-76.8 0a76.8 76.8 0 1 0 153.6 0 76.8 76.8 0 1 0-153.6 0Z"></path></svg>',
      menuKeys: ["through", "code", "sup", "sub", "clearStyle"],
    },
    "color",
    "bgColor",
    "|",
    "fontSize",
    "fontFamily",
    "lineHeight",
    "|",
    "bulletedList",
    "numberedList",
    "todo",
    {
      key: "group-justify",
      title: "对齐",
      iconSvg:
        '<svg viewBox="0 0 1024 1024"><path d="M768 793.6v102.4H51.2v-102.4h716.8z m204.8-230.4v102.4H51.2v-102.4h921.6z m-204.8-230.4v102.4H51.2v-102.4h716.8zM972.8 102.4v102.4H51.2V102.4h921.6z"></path></svg>',
      menuKeys: ["justifyLeft", "justifyRight", "justifyCenter", "justifyJustify"],
    },
    {
      key: "group-indent",
      title: "缩进",
      iconSvg:
        '<svg viewBox="0 0 1024 1024"><path d="M0 64h1024v128H0z m384 192h640v128H384z m0 192h640v128H384z m0 192h640v128H384zM0 832h1024v128H0z m0-128V320l256 192z"></path></svg>',
      menuKeys: ["indent", "delIndent"],
    },
    "|",
    "emotion",
    "insertLink",
    // {
    //   key: "group-image",
    //   title: "图片",
    //   iconSvg:
    //     '<svg viewBox="0 0 1024 1024"><path d="M959.877 128l0.123 0.123v767.775l-0.123 0.122H64.102l-0.122-0.122V128.123l0.122-0.123h895.775zM960 64H64C28.795 64 0 92.795 0 128v768c0 35.205 28.795 64 64 64h896c35.205 0 64-28.795 64-64V128c0-35.205-28.795-64-64-64zM832 288.01c0 53.023-42.988 96.01-96.01 96.01s-96.01-42.987-96.01-96.01S682.967 192 735.99 192 832 234.988 832 288.01zM896 832H128V704l224.01-384 256 320h64l224.01-192z"></path></svg>',
    //   menuKeys: ["insertImage", "uploadImage"],
    // },
    // {
    //   key: "group-video",
    //   title: "视频",
    //   iconSvg:
    //     '<svg viewBox="0 0 1024 1024"><path d="M981.184 160.096C837.568 139.456 678.848 128 512 128S186.432 139.456 42.816 160.096C15.296 267.808 0 386.848 0 512s15.264 244.16 42.816 351.904C186.464 884.544 345.152 896 512 896s325.568-11.456 469.184-32.096C1008.704 756.192 1024 637.152 1024 512s-15.264-244.16-42.816-351.904zM384 704V320l320 192-320 192z"></path></svg>',
    //   menuKeys: ["insertVideo", "uploadVideo"],
    // },
    // "insertTable",
    "codeBlock",
    "divider",
    "|",
    "undo",
    "redo",
    "|",
    "fullScreen",
  ],
};
const editorConfig = { placeholder: "请输入内容..." };

function addYdataHandle() {
  const item_data = {
    name: "",
    unit: "",
    data: "",
  };
  echartsData.chart.yaxis.push(item_data);
}

function deleteYdataHandle() {
  // echartsData.chart.yaxis.splice(index, 1);
  if (echartsData.chart.yaxis.length > 1) {
    echartsData.chart.yaxis.pop();
  }
}

function initOptions() {
  const vnode = lodash.cloneDeep(currentModuleVnode.reportModule.vnode);
  console.log("isRefresh bar", vnode);
  const node = vnode.node;
  nextTick(() => {
    echartsData.title = node.title || "";
    echartsData.name = node.name || "";
    if (node.chart) {
      echartsData.chart.xaxis_name = node.chart.xaxis_name || "";
      echartsData.chart.xaxis_data = node.chart.xaxis_data || "";
      echartsData.chart.xaxis_unit = node.chart.xaxis_unit || "";
      echartsData.chart.yaxis = node.chart.yaxis || [{ name: "", unit: "", data: "" }];
    }
    echartsData.conclusion = node.conclusion || ``;
  });
}

watch(
  () => currentModuleVnode.reportModule.isRefresh,
  () => {
    initOptions();
  },
  {
    deep: true,
    immediate: true,
  },
);

watch(
  echartsData,
  () => {
    updateVnodeData();
  },
  {
    deep: true,
    immediate: false,
  },
);

function updateVnodeData() {
  const vNode = {
    ...currentModuleVnode.reportModule.vnode,
  };
  console.log("updateVnodeData", vNode);
  const code = vNode.node.code;
  vNode.node = lodash.cloneDeep(echartsData);
  vNode.node.code = code;
  currentModuleVnode.setModuleVnode(vNode);
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});

const handleCreated = (editor: any) => {
  editorRef.value = editor; // 记录 editor 实例，重要！
  // 当前菜单排序和分组
  // import { DomEditor } from "@wangeditor/editor";
  // setTimeout(() => {
  //   const toolbarIns = DomEditor.getToolbar(editorRef.value);
  //   const curToolbarConfig = toolbarIns.getConfig();
  //   console.log(
  //     "curToolbarConfig",
  //     toolbarIns,
  //     curToolbarConfig,
  //     curToolbarConfig.toolbarKeys
  //   );
  // }, 2000);
};
</script>

<style scoped lang="scss">
.rj_rpt_line_b {
  width: 96%;
  height: 3.75rem;
  margin-bottom: 1rem;
}

.rj_rpt_line_t {
  width: 96%;
  height: 2.5rem;
}

.rj_rpt_line_tl {
  width: 6rem;
  height: 100%;
  font-size: 1rem;
}

.rj_rpt_line_yt {
  width: 100%;
  height: auto;
  margin-top: 1rem;
}

.rj_rpt_line_c {
  width: 96%;
  border: 1px solid #ccc;
}
</style>
