<template>
  <div :id="id" class="col_nw_fs_center panel_container">
    <div class="row_nw_fs_center close_icon" @click="colseHandle">X</div>
    <div class="row_nw_fs_center title_box">请选择绘制操作</div>
    <div class="row_nw_center_center info_box" style="color: #fff">
      {{ vNodeData.data.id }}
    </div>
    <div class="row_nw_center_center info_box">
      <div class="row_nw_center_center info_del" @click="cancelHandle">删除图形</div>
      <div class="row_nw_center_center info_confirm" @click="confirmHandle">绘制完成</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "StaticImagePopup",
  props: {
    id: {
      type: String,
      default: "001",
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

    const confirmHandle = () => {
      props && props!.vNodeData.confirmCb();
    };

    return {
      colseHandle,
      cancelHandle,
      confirmHandle,
    };
  },
});
</script>

<style lang="scss">
.panel_container {
  position: absolute;
  z-index: 2;
  width: auto;
  min-width: 250px;
  height: auto;
  background: rgb(0 13 33 / 75%);
  border: 1px solid #f70;
  border-radius: 0.25rem;
}

.title_box {
  width: 100%;
  height: 3rem;
  color: rgba(255, 255, 255, 1);
  padding-left: 1rem;
  font-weight: bold;
}

.close_icon {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1rem;
  height: 1rem;
  color: rgba(255, 255, 255, 1);
  font-size: 1rem;
  cursor: pointer;
}

.info_box {
  width: 100%;
  height: 2rem;
  margin: 0.875rem 1.375rem;
}

.info_del {
  width: 120px;
  height: 100%;
  color: rgba(255, 41, 41, 0.85);
  font-weight: 400;
  font-size: 1rem;
  font-family: "Source Han Sans CN";
  margin-right: 1rem;
  border: 1px solid rgba(255, 41, 41, 0.85);
  border-radius: 0.25rem;
  cursor: pointer;
}

.info_del:hover {
  background-color: rgba(255, 41, 41, 0.85);
  color: rgba(255, 255, 255, 1);
}

.info_confirm {
  width: 120px;
  height: 100%;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 400;
  font-size: 1rem;
  font-family: "Source Han Sans CN";
  border: 1px solid rgb(14, 105, 241);
  border-radius: 0.25rem;
  cursor: pointer;
}

.info_confirm:hover {
  background-color: rgb(14, 105, 241);
}
</style>
