<template>
  <div v-if="isShow" class="col_nw_fs_center rj_rpt_echart_container" @click="onclose">
    <div class="rj_rpt_echart_wraper" @click.prevent.stop="() => {}">
      <div class="row_nw_center_center rj_rpt_line_b">
        <a-button type="primary" size="large" @click="downDataModule('lineModule.csv')">
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
        <span class="row_nw_fs_center rj_rpt_line_tl">线条类型:</span>
        <a-radio-group v-model:value="echartsData.chart.line_type" :options="simpleLineTypeOptions" />
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
      <div
        v-for="(ydata, index) in echartsData.chart.yaxis"
        :key="'y_' + index"
        class="col_nw_fs_center rj_rpt_line_yt"
      >
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

      <div class="row_nw_fe_center rj_rpt_line_t">
        <a-button type="primary" size="medium" @click="setEchartHandle">
          <template #icon><SearchOutlined /></template>
          查询
        </a-button>
        <div class="w_16r"></div>
        <a-button type="primary" size="medium" ghost @click="resetEchartHandle">
          <template #icon><UndoOutlined /></template>
          重置
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch, reactive, nextTick } from "vue";

import {
  UploadOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  MinusOutlined,
  DownloadOutlined,
  SearchOutlined,
  UndoOutlined,
} from "@ant-design/icons-vue";
import type { UploadProps, UploadChangeParam } from "ant-design-vue";

import lodash from "lodash";

import { parse } from "csv-parse/browser/esm";

import { wangEditorEchartLineType, EchartLineElement } from "../custom-types";

import { useEditorEchartLineStore } from "../../../../../../stores/editor/echartLine";

import { EchartsLineType, simpleLineTypeOptions } from "../../../../../../common/echarts/lineOptions";

import { downDataModule } from "../../../../../../utils/common/downloadFiles";

const editorEchartLine = useEditorEchartLineStore();

let editor: any = null;
const isShow = ref(false);

// 标题 title
const echartsData = reactive({
  title: "",
  name: "",
  // 这里要再包一层，不然输入一次title, name, conclusion 就会画一次图
  chart: {
    line_type: EchartsLineType.smooth,
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
});

const lineFileList = ref([]);

const onShow = (editorIns: any) => {
  console.log("onShow", isShow.value, editorIns);
  const children = editorIns.children;
  const length = children.length;
  const lastChild = editorIns.children[length - 1];
  console.log("onShow", editorIns.getNodePosition(lastChild));
  editor = editorIns;
  isShow.value = true;
};

function onclose() {
  isShow.value = false;
}

defineExpose({
  showModal: onShow,
  hideModal: onclose,
});

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

const lineFileBeforeUploadHandle: UploadProps["beforeUpload"] = (file) => {
  const lineRecords: any = [];
  return new Promise((_: any, reject: any) => {
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
      line_type: echartsData.chart.line_type,
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
  // const vnode = lodash.cloneDeep(editorEchartLine.line.options);
  console.log("isRefresh line");
  // const node = vnode.node;
  // nextTick(() => {
  //   echartsData.title = node.title || "";
  //   echartsData.name = node.name || "";
  //   if (node.chart) {
  //     echartsData.chart.xaxis_name = node.chart.xaxis_name || "";
  //     echartsData.chart.xaxis_data = node.chart.xaxis_data || "";
  //     echartsData.chart.xaxis_unit = node.chart.xaxis_unit || "";
  //     echartsData.chart.yaxis = node.chart.yaxis || [{ name: "", unit: "", data: "" }];
  //   }
  // });
}

watch(
  () => editorEchartLine.line.isRefresh,
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
  console.log("updateVnodeData", echartsData);
  const echartsDataTemp = lodash.cloneDeep(echartsData);
  editorEchartLine.setOptions(echartsDataTemp);
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {});

function setEchartHandle() {
  console.log("setEchartHandle");
  onclose();
  const echartLineTag: EchartLineElement = {
    type: wangEditorEchartLineType,
    title: echartsData.title,
    name: echartsData.name,
    chart: lodash.cloneDeep(echartsData.chart),
    children: [{ text: "" }],
  };
  editor.insertNode(echartLineTag);
}

function resetEchartHandle() {
  echartsData.title = "";
  echartsData.name = "";
  echartsData.chart.line_type = EchartsLineType.smooth;
  echartsData.chart.xaxis_name = "";
  echartsData.chart.xaxis_unit = "";
  echartsData.chart.xaxis_data = "";
  echartsData.chart.yaxis = [
    {
      name: "",
      unit: "",
      data: "",
    },
  ];
}
</script>

<style scoped lang="scss">
.rj_rpt_echart_container {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99999;
  width: 100vw;
  height: 100vh;
  background: rgb(0 0 0 / 50%);
}

.rj_rpt_echart_wraper {
  width: 96%;
  height: 96%;
  overflow-x: overlay;
  overflow-y: scroll;
  background: #fff;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
}

.rj_rpt_echart_wraper::-webkit-scrollbar {
  display: none;
}

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
