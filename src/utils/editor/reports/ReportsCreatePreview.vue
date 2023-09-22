<template>
  <div class="col_nw_fs_center wh_100p_100p">
    <div class="row_nw_center_center rj_rpt_preview_title"> {{ currentReportsName }} &nbsp; 预览区 </div>
    <div class="col_nw_fs_center rj_rpt_preview_work">
      <div class="col_nw_fs_center rj_rpt_preview_c">
        <!-- 顶装饰 -->
        <div class="row_nw_sb_center rj_rpt_preview_dcb">
          <div class="rj_rpt_preview_dcg"></div>
          <div class="rj_rpt_preview_dcg"></div>
        </div>
        <!-- 主要内容渲染 -->
        <div
          ref="previewDomRef"
          class="col_nw_fs_center rj_rpt_preview_rc"
          @dragenter.prevent="previewDragEnterHandle"
          @dragover.prevent="previewDragoverHandle"
          @drop.prevent="previewDropHandle"
          @dragleave.prevent="previewDragleaveHandle"
        >
          <div
            v-for="(order, index) in renderData.order"
            :key="renderData.vnodes[order].props.id"
            class="row_nw_fs_center rj_rpt_preview_m"
            @click="setCurrentModuleHandle(renderData.vnodes[order].props.id)"
            @mouseenter="setCurrentModuleActionHandle(renderData.vnodes[order].props.id, true)"
            @mouseleave="setCurrentModuleActionHandle(renderData.vnodes[order].props.id, false)"
          >
            <component
              :is="reportsCodePreview[renderData.vnodes[order].node.code]"
              :configData="renderData.vnodes[order]"
            />
            <div v-show="renderData.isShowAction[order]" class="row_nw_fe_center rj_rpt_preview_act">
              <a-button type="primary" size="small" ghost>
                <template #icon
                  ><component
                    :is="
                      renderData.vnodes[order].props.tool.icon
                        ? renderData.vnodes[order].props.tool.icon
                        : reportsCodeModule[renderData.vnodes[order].props.tool.code].icon
                    "
                /></template>
                {{ renderData.vnodes[order].props.tool.name }}
              </a-button>
              <div class="w_16r"></div>
              <a-button type="primary" size="small" ghost @click="moveNodeHandle('up', index)">
                <template #icon><ArrowUpOutlined /></template>
                上移
              </a-button>
              <div class="w_16r"></div>
              <a-button type="primary" size="small" ghost @click="moveNodeHandle('down', index)">
                <template #icon><ArrowDownOutlined /></template>
                下移
              </a-button>
              <div class="w_16r"></div>
              <a-popconfirm
                title="确定删除?"
                :getPopupContainer="getAntdvPopupContainer"
                @confirm="deleteNodeHandle(index)"
              >
                <a-button type="primary" size="small" danger ghost>
                  <template #icon><DeleteOutlined /></template>
                  删除
                </a-button>
              </a-popconfirm>
            </div>
          </div>
        </div>
        <!-- 底部装饰 -->
        <div class="row_nw_sb_center rj_rpt_preview_dcb">
          <div class="rj_rpt_preview_dcg"></div>
          <div class="rj_rpt_preview_dcg"></div>
        </div>

        <!-- 操作 -->
        <div class="row_nw_fe_center rj_rpt_preview_sub">
          <a-button type="ghost" @click="cancelCreateEditHandle">
            <template #icon><CloseOutlined /></template>
            {{ isEidtReport ? "返回" : "取消" }}
          </a-button>
          <div class="w_32r"></div>
          <a-button type="primary" @click="submitHandle">
            <template #icon><SaveOutlined /></template>
            保存
          </a-button>
          <div class="w_48r"></div>
        </div>

        <!-- 提示信息 -->
        <a-modal v-model:visible="tipsForSave.isShow" :closable="false" title="重要提醒" @ok="tipsForSaveOkHandle">
          <template #footer>
            <a-button v-show="tipsForSave.isShowAction" key="back" type="ghost" @click="tipsForSaveCancelHandle">
              <template #icon><CloseOutlined /></template>
              取消
            </a-button>
            <a-button v-show="tipsForSave.isShowAction" key="submit" type="primary" @click="tipsForSaveOkHandle">
              <template #icon><CheckOutlined /></template>
              保存
            </a-button>
          </template>
          <div class="row_nw_center_center rj_rpt_preview_tip">
            {{ tipsForSave.message }}
          </div>
        </a-modal>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, reactive, watch } from "vue";
import { nanoid } from "nanoid";
import lodash from "lodash";
import RichEditorPreviewVue from "./RichEditorPreview.vue";
// import EchartsLinePreview from "./EchartsLinePreview.vue";
// import EchartsBarPreview from "./EchartsBarPreview.vue";
// import EchartsPiePreview from "./EchartsPiePreview.vue";
// import EchartsScatterPreview from "./EchartsScatterPreview.vue";
// import ImageryComparatorPreview from "./ImageryComparatorPreview.vue";
// import ImageryInsertPreview from "./ImageryInsertPreview.vue";

import { reportsNameCode, reportsCodeModule, reportsCodePlaceholder, createReportMode } from "./reportsMeta";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  CheckOutlined,
} from "@ant-design/icons-vue";

import { message } from "ant-design-vue";

import {
  useReportModuleCodeStore,
  useReportModuleVnodeStore,
  useReportEchartsStore,
  useReportOLMapStore,
  useCreateReportStore,
} from "@/stores/reports";
import { computed } from "vue";
import { getAntdvPopupContainer } from "@/utils/common/antdvPositionFixed";
import { useRouter, useRoute } from "vue-router";
// import { notifyChildRouteChange } from "@/composables/useRouterChange";

// import { addNewReportData, editReportData, getUuidReportsData } from "@/api/reportsManagement";

const router = useRouter();

const reportsCodePreview = {
  [reportsNameCode.rich_editor]: RichEditorPreviewVue,
  // [reportsNameCode.image_comparison]: ImageryComparatorPreview,

  // [reportsNameCode.echarts_line]: EchartsLinePreview,
  // [reportsNameCode.echarts_bar]: EchartsBarPreview,
  // [reportsNameCode.echarts_pie]: EchartsPiePreview,
  // [reportsNameCode.echarts_scatter]: EchartsScatterPreview,

  // [reportsNameCode.image_insertion]: ImageryInsertPreview,
};

const currentReportModuleCode = useReportModuleCodeStore();
const currentModuleVnode = useReportModuleVnodeStore();
const reportsEcharts = useReportEchartsStore();
const reportsOLMapStore = useReportOLMapStore();
const createReportStore = useCreateReportStore();

const renderData = reactive({
  order: [],
  vnodes: {},
  isShowAction: {}, // 从 vnodes中独立出来是因为变动时 组件都又重新渲染了
  index: 0,
});

const previewDomRef = ref(null);

const tipsForSave = reactive({
  isShow: false,
  isShowAction: true,
  message: "即将跳转页面，请确认保存文档",
});

function previewDragEnterHandle() {
  return true;
}
function previewDragoverHandle() {
  return true;
}
function previewDropHandle() {
  defRenderDataVnodes();
  console.log("previewDropHandle", renderData);
}
function previewDragleaveHandle() {
  return true;
}

const currentReportsName = computed(() => {
  if (createReportStore.reports && createReportStore.reports.info && createReportStore.reports.info.reportName) {
    return createReportStore.reports.info.reportName;
  } else {
    return "";
  }
});

const isEidtReport = computed(() => {
  if (createReportStore.reports && createReportStore.reports.info && createReportStore.reports.info.isEdit) {
    return true;
  } else {
    return false;
  }
});

// 解决在编辑页面 用户刷新的bug
// 不过是将中间数据放在pinia 中 还是放在localstorage
//
const route = useRoute();
function fixRefreshBug() {
  console.log("route", route);
  if (route.name == "eidtReports" || route.path == "/edit/report") {
    if (!createReportStore.reports || !createReportStore.reports.info || !createReportStore.reports.info.isEdit) {
      router.push("/");
      // 通知菜单变更
      setTimeout(() => {
        // notifyChildRouteChange();
      }, 500);
    }
  }
}
fixRefreshBug();

watch(
  currentModuleVnode,
  () => {
    updateRenderDataVnodes(currentModuleVnode.reportModule.vnode);
  },
  {
    deep: true,
    immediate: false,
  },
);

watch(
  renderData.order,
  () => {
    // nofityReportsSave(false);
  },
  {
    deep: true,
    immediate: false,
  },
);

watch(
  createReportStore,
  () => {
    // initCreateEditData();
  },
  {
    deep: true,
    immediate: true,
  },
);

function resetRenderData() {
  renderData.vnodes = {};
  renderData.order = [];
  renderData.isShowAction = {};
  renderData.index = 0;
}

function getReportByUuidRequest(reportUuid: string) {
  if (reportUuid) {
    const reqData = {
      uuid: reportUuid,
    };
    getUuidReportsData(reqData)
      .then((res: any) => {
        console.log("getReportByUuidRequest ok", res);
        if (res.code == 0 && res.data && res.data.reportData) {
          const reportData = res.data.reportData;

          renderData.vnodes = reportData.vnodes;
          renderData.order = reportData.order;
          renderData.isShowAction = reportData.isShowAction || {};
          renderData.index = reportData.index || 0;
        } else {
          resetRenderData();
        }
      })
      .catch((err: any) => {
        console.log("getReportByUuidRequest err", err);
        resetRenderData();
      });
  } else {
    resetRenderData();
  }
}

function initCreateEditData() {
  if (createReportStore.reports && createReportStore.reports.info) {
    // 1 如果是编辑报告 加载要编辑的报告
    if (createReportStore.reports.info.isEdit) {
      console.log("编辑初始化");
      // 获取 并 加载数据
      if (createReportStore.reports.info.reportUuid) {
        const reportUuid = createReportStore.reports.info.reportUuid;
        getReportByUuidRequest(reportUuid);
        // nofityReportsSave(false);
      } else {
        resetRenderData();
        // nofityReportsSave(false);
      }
    } else if (createReportStore.reports.info.isCreate) {
      // 2 如果是创建报告
      if (createReportStore.reports.info.refReportUuid) {
        // 2.1 创建报告时 是基于旧有报告
        // 此时加载旧有报告 并 加载数据
        console.log("创建初始化： 基于报告");
        const reportUuid = createReportStore.reports.info.refReportUuid;
        getReportByUuidRequest(reportUuid);
        // nofityReportsSave(false);
      } else if (createReportStore.reports.info.templateUuid) {
        // 2.2 创建报告时 是基于报告模板
        // 此时加载报告模板 并 加载数据
        console.log("创建初始化： 基于模板");
        const templateUuid = createReportStore.reports.info.templateUuid;
        getReportByUuidRequest(templateUuid);
        // nofityReportsSave(false);
      } else {
        // 2.3 创建报告时 不基于任何 那么什么也不做
        console.log("创建初始化： 直接创建");
      }
    }
  }
}

// 监听全局变量
let isFromMenuChange = false;
const globalDataHandler = function (data: any) {
  if (data.type === "menuPathChange") {
    tipsForSave.isShow = true;
    tipsForSave.isShowAction = true;
    isFromMenuChange = true;
  }
};
function addGlobalDataListener() {
  if (window.__MICRO_APP_ENVIRONMENT__) {
    /**
     * 绑定监听函数
     * dataListener: 绑定函数
     * autoTrigger: 在初次绑定监听函数时如果有缓存数据，是否需要主动触发一次，默认为false
     */
    window.microApp.addGlobalDataListener(globalDataHandler, true);
  }
}

function removeGlobalDataListener() {
  if (window.__MICRO_APP_ENVIRONMENT__) {
    // 解绑监听函数
    window.microApp.removeGlobalDataListener(globalDataHandler);
  }
}

onMounted(() => {
  addGlobalDataListener();
});

onUnmounted(() => {
  cleanUseResouce();
});

// 这里设置预览区 和 配置区 默认数据
function defRenderDataVnodes() {
  // 其他功能模块处理逻辑
  // deep clone !!!
  const node = {
    ...reportsCodePlaceholder[currentReportModuleCode.code],
  };
  const codeId = nanoid(12);
  const placeVnode = {
    node: node,
    props: {
      id: codeId,
      position: renderData.index,
      tool: { ...reportsCodeModule[currentReportModuleCode.code] },
      // isShowAction: false,
    },
  };
  // 如果不是使用 影像标注 功能，才将要渲染的node 加入渲染列表
  if (currentReportModuleCode.code != reportsNameCode.image_annotation) {
    renderData.index++;
    renderData.order.push(codeId);
    renderData.vnodes[codeId] = placeVnode;
    renderData.isShowAction[codeId] = false;
  }
  // 设置当前正在操作节点
  currentModuleVnode.setModuleVnode(placeVnode);
  currentModuleVnode.setRefresh();

  // 在这个位置在刷新显示 配置项
  currentReportModuleCode.setRefresh();
}

function updateRenderDataVnodes(vnode: any) {
  const codeId = vnode.props.id;
  if (renderData.order.includes(codeId)) {
    renderData.vnodes[codeId] = vnode;
  }
}

// 点击后设置当前的正在编辑的 模块
function setCurrentModuleHandle(codeId: string) {
  const placeVnode = lodash.cloneDeep(renderData.vnodes[codeId]);
  currentModuleVnode.setModuleVnode(placeVnode);
  currentModuleVnode.setRefresh();
  currentReportModuleCode.setCode(placeVnode.props.tool.code);
  currentReportModuleCode.setRefresh();
}

// 显示各个模块的控件
function setCurrentModuleActionHandle(codeId: string, isShow: boolean) {
  renderData.isShowAction[codeId] = isShow;
}

function moveNodeHandle(direction: string, index: number) {
  if (direction === "up") {
    if (index === 0) {
      return;
    } else {
      const tempCode = renderData.order[index - 1];
      renderData.order[index - 1] = renderData.order[index];
      renderData.order[index] = tempCode;
    }
  } else if (direction === "down") {
    if (index === renderData.order.length - 1) {
      return;
    } else {
      const tempCode = renderData.order[index + 1];
      renderData.order[index + 1] = renderData.order[index];
      renderData.order[index] = tempCode;
    }
  }
}

function deleteNodeHandle(index: number) {
  let codeId = renderData.order[index];
  renderData.order.splice(index, 1);
  delete renderData.vnodes[codeId];
  renderData.index--;

  // 更新配置项
  let showIndex = index - 1;
  if (showIndex <= 0) {
    showIndex = 0;
  }
  if (renderData.order.length) {
    codeId = renderData.order[showIndex];
    setCurrentModuleHandle(codeId);
  }
}

function cancelCreateEditHandle() {
  if (createReportStore.reports && createReportStore.reports.info) {
    // 1 如果是编辑报告
    if (createReportStore.reports.info.isEdit) {
      tipsForSave.message = "即将退出编辑工作，请确认是否保存文档";
    } else if (createReportStore.reports.info.isCreate) {
      // 如果是创建报告
      tipsForSave.message = "即将退出创建工作，请确认是否保存文档";
    }
  } else {
    tipsForSave.message = "即将退出创建工作，请确认是否保存文档";
  }
  tipsForSave.isShow = true;
  tipsForSave.isShowAction = true;
}

let createedReportInfoUuid = "";
function submitHandle() {
  return new Promise((resolve: any, reject: any) => {
    // 处理 echarts 实例为图片
    const echartsInstance = reportsEcharts.echartsInstance.instance;
    const echartsInstanceKeys = Object.keys(echartsInstance);
    for (let i = 0; i < echartsInstanceKeys.length; i++) {
      const idKeys = echartsInstanceKeys[i];
      if (renderData.vnodes[idKeys]) {
        let imageBase64String = "";
        if (echartsInstance[idKeys].handler) {
          imageBase64String = echartsInstance[idKeys].handler.getDataURL({
            // 注意：png, jpg 只有在 canvas 渲染器的时候可使用，svg 只有在使用 svg 渲染器的时候可用
            type: "png", // 导出的格式，可选 png, jpg, svg
            pixelRatio: 1,
          });
        }
        renderData.vnodes[idKeys].node.echartsImage = imageBase64String;
      }
    }
    // 处理ol map 为图片：
    const olMapInstance = reportsOLMapStore.olMapInstance.instance;
    const olMapInstanceKeys = Object.keys(olMapInstance);
    for (let i = 0; i < olMapInstanceKeys.length; i++) {
      const idKeys = olMapInstanceKeys[i];
      if (renderData.vnodes[idKeys]) {
        let imageBase64String = "";
        if (olMapInstance[idKeys]) {
          const canvas = olMapInstance[idKeys].getMapCanvas();
          console.log("olMapInstance[idKeys]", canvas);
          imageBase64String = canvas.toDataURL();
        }
        renderData.vnodes[idKeys].node.olImage = imageBase64String;
      }
    }
    const createReportsInfo = createReportStore.reports.info;
    // console.log(
    //   "submitHandle",
    //   renderData,
    //   createReportsInfo,
    //   previewDomRef.value.outerHTML,
    //   typeof previewDomRef.value.outerHTML
    // );
    if (createReportStore.reports && createReportStore.reports.info) {
      const reqData: any = {
        reportData: renderData,
        platformUuid: createReportsInfo.platformUuid,
        platformName: createReportsInfo.platformName || "",
        projectUuid: createReportsInfo.projectUuid,
        projectName: createReportsInfo.projectName || "",
        refReportUuid: createReportsInfo.refReportUuid || "",
        refReportName: createReportsInfo.refReportName || "",
        templateUuid: createReportsInfo.templateUuid || "",
        templateName: createReportsInfo.templateName || "",
        name: createReportsInfo!.reportName,
        uuid: createReportsInfo!.reportUuid || createedReportInfoUuid,
        type: createReportMode.report,
        html: `'${previewDomRef.value.outerHTML}'`,
      };

      // 1 如果是编辑报告 加载要编辑的报告
      if (createReportStore.reports.info.isEdit) {
        console.log("编辑报告 开始保存");
        editReportRequest(reqData)
          .then(() => {
            return resolve(true);
          })
          .catch(() => {
            return reject(false);
          });
      } else if (createReportStore.reports.info.isCreate) {
        console.log("创建报告 开始保存");
        //  第一次是真正的创建,调用创建接口
        // 第二次是相当于更新了 直接调用更新接口
        if (createedReportInfoUuid) {
          editReportRequest(reqData)
            .then(() => {
              return resolve(true);
            })
            .catch(() => {
              return reject(false);
            });
        } else {
          createReportRequest(reqData)
            .then(() => {
              return resolve(true);
            })
            .catch(() => {
              return reject(false);
            });
        }
      }
    }
  });
}

const createReportRequest = (reqData: any) => {
  return new Promise((resolve: any, reject: any) => {
    addNewReportData(reqData)
      .then((res: any) => {
        if (res.code == 0) {
          console.log("创建报告 成功", res);
          // 创建成功了，还要保存报告的 UUID
          createedReportInfoUuid = res.data.uuid;
          // 通知保存成功
          // nofityReportsSave(true);
          message.success("保存成功！", 2);
          return resolve(true);
        } else {
          console.log("创建报告 失败", res);
          // nofityReportsSave(false);
          message.success("保存失败，请重试", 2);
          return reject(false);
        }
      })
      .catch((err: any) => {
        console.log("创建报告请求 失败", err);
        // nofityReportsSave(false);
        message.success("保存失败，请重试", 2);
        return reject(false);
      });
  });
};

const editReportRequest = (reqData: any) => {
  return new Promise((resolve: any, reject: any) => {
    editReportData(reqData)
      .then((res: any) => {
        if (res.code == 0) {
          console.log("编辑报告 成功", res);
          // 通知保存成功
          // nofityReportsSave(true);
          message.success("保存成功！", 2);
          return resolve(true);
        } else {
          console.log("编辑报告 失败", res);
          // nofityReportsSave(false);
          message.success("保存失败，请重试", 2);
          return reject(false);
        }
      })
      .catch((err: any) => {
        console.log("编辑报告请求 失败", err);
        // nofityReportsSave(false);
        message.success("保存失败，请重试", 2);
        return reject(false);
      });
  });
};

function tipsForSaveCancelHandle() {
  if (isFromMenuChange) {
    tipsForSave.isShow = false;
    isFromMenuChange = false;
    // 再这里也清空一下使用资源
    cleanUseResouce();

    // 这里要想办法通知继续跳转。
    // nofityReportsSave(true);
  } else if (createReportStore.reports && createReportStore.reports.info) {
    tipsForSave.isShowAction = false;
    tipsForSave.message = "即将跳转页面！";
    setTimeout(() => {
      tipsForSave.isShow = false;
      // nofityReportsSave(true);
      // 再这里也清空一下使用资源
      // cleanUseResouce();

      // 1 如果是编辑报告 不保存 直接返回
      if (createReportStore.reports.info.isEdit) {
        router.go(-1);
      } else if (createReportStore.reports.info.isCreate) {
        router.push("/");
      }

      // 通知菜单变更
      setTimeout(() => {
        // notifyChildRouteChange();
      }, 500);
    }, 2000);
  }
}

async function tipsForSaveOkHandle() {
  // 提交数据 在创建时，第一次保存提交要返回 一个报告UUID 第二次保存提交时就要带上这个UUID 相当于编辑了。
  const isSubmit = await submitHandle();
  console.log("isSubmit", isSubmit);
  if (isSubmit) {
    tipsForSave.isShow = false;
    tipsForSave.message = "即将跳转页面，请确认保存文档。";
    tipsForSaveCancelHandle();
  } else {
    tipsForSave.isShow = true;
    tipsForSave.isShowAction = true;
    tipsForSave.message = "保存失败，请重试！";
  }
}

let autoSaveReportTimer: any = null;
function clearAutoSaveReportTimer() {
  if (autoSaveReportTimer) {
    clearInterval(autoSaveReportTimer);
    autoSaveReportTimer = null;
  }
}

function startAutoSaveReport(timeDelay: 50000) {
  clearAutoSaveReportTimer();
  autoSaveReportTimer = setInterval(() => {
    // 开始自动保存
  }, timeDelay);
}

function stopAutoSaveReport() {
  clearAutoSaveReportTimer();
}

function cleanUseResouce() {
  stopAutoSaveReport();
  removeGlobalDataListener();
  // 清空 编辑 创建报告 初始数据
  createReportStore.resetCreateReportInfo();
}
</script>

<style scoped>
.rj_rpt_preview_title {
  width: 100%;
  height: 60px;
  margin-top: 16px;
  font-size: 24px;
}

.rj_rpt_preview_work {
  width: 100%;
  height: calc(100% - 76px);
}

.rj_rpt_preview_c {
  width: 23cm;
  height: 98%;
  background-color: rgb(255 255 255 / 80%);
}

.rj_rpt_preview_dcb {
  width: 100%;
  height: 1cm;
}

.rj_rpt_preview_dcg {
  width: 1cm;
  height: 1cm;
  background-color: rgb(0 0 0 / 10%);
}

.rj_rpt_preview_rc {
  width: 21cm;
  height: calc(100% - 4cm);
  overflow-x: overlay;
  overflow-y: scroll;
  background-color: rgb(255 255 255 / 80%);
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
}

.rj_rpt_preview_rc::-webkit-scrollbar {
  display: none;
}

.rj_rpt_preview_m {
  position: relative;
  width: 100%;
  height: auto;
}

.rj_rpt_preview_m:hover {
  outline: 1px solid rgb(0 0 0 / 50%);
}

.rj_rpt_preview_act {
  position: absolute;
  top: 0;
  right: 1rem;
  width: auto;
  height: 40px;
  background-color: rgb(255 255 255 / 70%);
}

.rj_rpt_preview_sub {
  width: 100%;
  height: 2cm;
}
</style>
