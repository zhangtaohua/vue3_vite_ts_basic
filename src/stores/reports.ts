import { ref, reactive } from "vue";
import { defineStore } from "pinia";
import { reportsNameCode, reportsCodePlaceholder } from "@/utils/editor/reports/reportsMeta";
import lodash from "lodash";

export const useReportModuleCodeStore = defineStore("reportModuleCode", () => {
  const code = ref("");
  const isRefresh = ref(1);
  function setCode(codeIn: string) {
    code.value = codeIn;
  }
  function setRefresh() {
    isRefresh.value++;
  }

  return { code, isRefresh, setCode, setRefresh };
});

export const useReportModuleVnodeStore = defineStore("reportModuleVnode", () => {
  const reportModule = reactive({
    vnode: {
      node: { ...reportsCodePlaceholder[reportsNameCode.rich_editor] },
      props: {
        tool: { name: "" },
      },
    },
    isRefresh: 1,
  });
  function setModuleVnode(vnode: any) {
    reportModule.vnode = vnode;
  }
  function setRefresh() {
    reportModule.isRefresh++;
  }

  return { reportModule, setModuleVnode, setRefresh };
});

export const useReportEchartsStore = defineStore("reportsEcharts", () => {
  const echartsInstance = reactive({
    instance: {},
    isRefresh: 1,
  });
  function setEchartsInstance(id: string, instance: any) {
    // @ts-ignore
    echartsInstance.instance[id] = instance;
  }
  function resetEchartsInstance() {
    echartsInstance.instance = {};
    echartsInstance.isRefresh = 1;
  }
  function setRefresh() {
    echartsInstance.isRefresh++;
  }

  return {
    echartsInstance,
    setEchartsInstance,
    resetEchartsInstance,
    setRefresh,
  };
});

export const useReportOLMapStore = defineStore("reportsOLMap", () => {
  const olMapInstance = reactive({
    instance: {},
    isRefresh: 1,
  });
  function setOLMapInstance(id: string, instance: any) {
    // @ts-ignore
    olMapInstance.instance[id] = instance;
  }
  function resetOLMapInsInstance() {
    olMapInstance.instance = {};
    olMapInstance.isRefresh = 1;
  }
  function setRefresh() {
    olMapInstance.isRefresh++;
  }

  return {
    olMapInstance,
    setOLMapInstance,
    resetOLMapInsInstance,
    setRefresh,
  };
});

export const useCreateReportStore = defineStore("createReport", () => {
  const reports = reactive({
    info: {},
    isRefresh: 1,
  });
  function setCreateReportInfo(info: any) {
    reports.info = info;
    reports.isRefresh++;
  }
  function resetCreateReportInfo() {
    reports.info = {};
    reports.isRefresh = 1;
  }
  function setRefresh() {
    reports.isRefresh++;
  }

  return {
    reports,
    setCreateReportInfo,
    resetCreateReportInfo,
    setRefresh,
  };
});

export const useCreateReportTemplateStore = defineStore("createTemplate", () => {
  const reportsTemplate = reactive({
    info: {},
    isRefresh: 1,
  });
  function setCreateReportTemplateInfo(info: any) {
    reportsTemplate.info = info;
    reportsTemplate.isRefresh++;
  }
  function resetCreateReportTemplateInfo() {
    reportsTemplate.info = {};
    reportsTemplate.isRefresh = 1;
  }
  function setReportTemplateRefresh() {
    reportsTemplate.isRefresh++;
  }

  return {
    reportsTemplate,
    setCreateReportTemplateInfo,
    resetCreateReportTemplateInfo,
    setReportTemplateRefresh,
  };
});
