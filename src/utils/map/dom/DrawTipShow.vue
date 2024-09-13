<template>
  <div :id="id" class="col_nw_center_center panel_container">
    <div class="row_nw_fs_center tip_title" @click="colseHandle">{{ customT("common.draw.cs") }}</div>
    <div class="row_nw_fs_center tip_title" @click="colseHandle">{{ customT("common.draw.cdc") }}</div>
    <div class="row_nw_fs_center tip_title" @click="colseHandle">{{ customT("common.draw.escq") }}</div>
    <div class="row_nw_fs_center tip_title" @click="colseHandle">{{ customT("common.draw.qb") }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "DrawCancelConfirm",
  props: {
    id: {
      type: String,
      default: "dc001",
    },
    customT: {
      type: Function,
      default: (name: string) => name,
    },
    destory: {
      type: Function,
      default: () => {},
    },
    vNodeData: {
      type: Object,
      default() {
        return {
          name: "我是VueNode标题",
          longitude: "149.757575E",
          latitude: "30.435657N",
          satellite: "888",
          time: "2023-07-16 12:00:00",
          x: 180,
          y: 1620,
        };
      },
    },
  },
  setup(props, _) {
    return {};
  },
});
</script>

<style scoped lang="scss">
.panel_container {
  position: absolute;
  z-index: 2;
  width: max-content;
  height: auto;
  padding: 0.875rem;
  background: var(--c-054-060-069-100);
  border-radius: 0.125rem;
}

.tip_title {
  width: 100%;
  height: 1.5rem;
  color: var(--c-232-234-237-100);
  font-size: var(--fsr-14px);
  font-family: "Source Han Sans SC VF", "Source Han Sans SC VF";
  cursor: pointer;
}
</style>
