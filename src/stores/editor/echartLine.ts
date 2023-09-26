import { ref, reactive } from "vue";
import { defineStore } from "pinia";
import lodash from "lodash";

export const useEditorEchartLineStore = defineStore("EditorEchartsLine", () => {
  const line = reactive({
    options: {},
    isRefresh: 1,
  });
  function setOptions(options: any) {
    // @ts-ignore
    line.options = options;
  }
  function resetOptions() {
    line.options = {};
    line.isRefresh = 1;
  }
  function setRefresh() {
    line.isRefresh++;
  }

  return {
    line,
    setOptions,
    resetOptions,
    setRefresh,
  };
});
