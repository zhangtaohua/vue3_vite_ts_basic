<template>
  <div :id="id" class="col_nw_center_center panel_container" @click="cancelHandle">
    <img class="row_nw_center_center info_del" src="@/assets/images/map/trash.svg" />
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
    const colseHandle = () => {
      props && props!.destory();
    };

    const cancelHandle = () => {
      props && props!.vNodeData.cancelCb();
    };

    return {
      colseHandle,
      cancelHandle,
    };
  },
});
</script>

<style scoped lang="scss">
.panel_container {
  position: absolute;
  z-index: 2;
  width: 1.5rem;
  height: 1.5rem;
  background: var(--c-255-255-255-085);
  border: 1px solid var(--c-255-255-255-085);
  border-radius: 0.25rem;
  cursor: pointer;
}

.info_del {
  width: 1.125rem;
  height: 1.125rem;
  transform: translate(-2000vw);
  filter: drop-shadow(2000vw 0 0 var(--c-241-051-013-100));
}

.panel_container:hover .info_del {
  filter: drop-shadow(2000vw 0 0 var(--c-255-000-000-100));
}
</style>
