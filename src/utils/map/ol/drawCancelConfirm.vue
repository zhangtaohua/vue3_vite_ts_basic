<template>
  <div :id="id" class="row_nw_fs_center panel_container">
    <div class="row_nw_fs_center tag_icon"></div>
    <div class="row_nw_fs_center close_icon" @click="colseHandle">
      <img class="close_icon_show" src="" />
    </div>
    <div class="col_nw_sb_fs info_box">
      <div class="row_nw_fs_center info_label"> {{ customT("测试") }}{{ `：数据更新成功` }} </div>
      <div class="row_nw_fs_center info_label" @click="cancelHandle">取消</div>
      <div class="row_nw_fs_center info_label" @click="confirmHandle">确定</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onUnmounted, onMounted } from "vue";

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
  min-width: 350px;
  height: auto;
  background: rgb(0 13 33 / 75%);
  border: 1px solid #f70;
  border-radius: 0.25rem;
}

.tag_icon {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  width: 0.375rem;
  height: 0.375rem;
  background: #fff;
  border: 1px solid #f70;
  border-radius: 50%;
  cursor: pointer;
}

.close_icon {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1rem;
  height: 1rem;
  color: rgb(255 255 255 / 30%);
  font-size: 0.375rem;
  cursor: pointer;
}

.close_icon_show {
  width: 0.5rem;
  height: 0.5rem;
}

.info_box {
  width: max-content;
  height: auto;
  margin: 0.875rem 1.375rem;
}

.info_label {
  width: max-content;
  height: 1.25rem;
  color: rgb(255 255 255 / 100%);
  font-weight: 300;
  font-size: 0.64rem;
  font-family: "Source Han Sans CN";
}
</style>
