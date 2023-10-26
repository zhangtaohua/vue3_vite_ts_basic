<template>
  <div class="col_nw_fs_center wh_100p_100p">
    <div class="row_nw_center_center rj_rpt_line_b">
      <a-button type="primary" size="large" @click="downDataModule('scatterModule.csv')">
        <template #icon><DownloadOutlined /></template>
        下载模块
      </a-button>
      <div class="w_32r"></div>

      <a-upload
        v-model:file-list="lineFileList"
        name="scatterCsvFile"
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
      <span class="row_nw_fs_center rj_rpt_line_tl">数据拟合:</span>
      <a-radio-group v-model:value="echartsData.chart.regression_type" :options="simpleRegressionTypeOptions" />
    </div>
    <div class="h_8r"></div>

    <div
      v-for="(ydata, index) in echartsData.chart.dataset"
      :key="'py_' + index"
      class="col_nw_fs_center rj_rpt_line_yt"
    >
      <div class="row_nw_fs_center rj_rpt_line_t">
        <span class="row_nw_fs_center rj_rpt_line_tl">{{ `第${index + 1}X数据:` }}</span>
        <a-input v-model:value="echartsData.chart.dataset[index][0]" placeholder="请输入" />
      </div>
      <div class="row_nw_fs_center rj_rpt_line_t">
        <span class="row_nw_fs_center rj_rpt_line_tl">{{ `第${index + 1}Y数据:` }}</span>
        <a-input v-model:value="echartsData.chart.dataset[index][1]" placeholder="请输入" />
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
        :disabled="echartsData.chart.dataset.length === 1"
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
        style="height: 300px; overflow-y: hidden;"
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
import { EchartsRegressionType, simpleRegressionTypeOptions } from "@/common/echarts/scatterOptions";

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
    regression_type: EchartsRegressionType.nonen,
    dataset: [[]],
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
  const pieRecords = [];
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      const csvParse = parse(reader.result, {
        delimiter: ",",
      });
      // Use the readable stream api to consume records
      csvParse.on("readable", () => {
        let record;
        while ((record = csvParse.read()) !== null) {
          pieRecords.push(record);
        }
      });
      // Catch any error
      csvParse.on("error", (err) => {
        console.error(err);
      });
      // Test that the parsed records matched the expected records
      csvParse.on("end", () => {
        console.log("parseEnd", pieRecords);
        setCsvDataToEchartsData(pieRecords);
      });
    };

    return reject(false);
  });
};

function setCsvDataToEchartsData(pieRecords: Array<any>) {
  if (pieRecords.length) {
    const chartsTemp = {
      regression_type: echartsData.chart.regression_type,
      dataset: [],
    };
    for (let i = 0; i < pieRecords.length; i++) {
      if (pieRecords[i][0] == "") {
        break;
      } else if (pieRecords[i][0] == "title") {
        echartsData.title = pieRecords[i][1];
      } else if (pieRecords[i][0] == "name") {
        echartsData.name = pieRecords[i][1];
      } else if (pieRecords[i][0] !== "" && pieRecords[i][1] !== "") {
        // 从第四行开始处理
        if (i >= 3) {
          const xValueemp = pieRecords[i][0];
          const yValueTemp = pieRecords[i][1];
          const ydataTemp = [xValueemp, yValueTemp];
          chartsTemp.dataset.push(ydataTemp);
        }
      }
    }
    echartsData.chart = chartsTemp;
  }
}

const mode = "default"; // 或 'simple' 'default'
const toolbarConfig: Partial<IToolbarConfig> = {
  excludeKeys: ["group-image", "group-video", "insertTable"],
};
const editorConfig = { placeholder: "请输入内容..." };

function addYdataHandle() {
  const item_data = [];
  echartsData.chart.dataset.push(item_data);
}

function deleteYdataHandle() {
  // echartsData.chart.yaxis.splice(index, 1);
  if (echartsData.chart.dataset.length > 1) {
    echartsData.chart.dataset.pop();
  }
}

function initOptions() {
  const vnode = lodash.cloneDeep(currentModuleVnode.reportModule.vnode);
  console.log("isRefresh scatter", vnode);
  const node = vnode.node;
  nextTick(() => {
    echartsData.title = node.title || "";
    echartsData.name = node.name || "";
    if (node.chart) {
      echartsData.chart.dataset = node.chart.dataset || [[]];
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
