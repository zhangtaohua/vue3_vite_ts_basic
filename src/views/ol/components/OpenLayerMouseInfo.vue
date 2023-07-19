<template>
  <div class="row_nw_fe_center ol_mouse_position_container">
    <div class="row_nw_fs_center ol_mouse_position_info">
      <div class="row_nw_center_center ol_mouse_position_info_title">Longitude: </div>
      <div class="row_nw_center_center ol_mouse_position_info_info">{{ mouseInfo.longitude }}</div>
    </div>
    <div class="row_nw_fs_center ol_mouse_position_info">
      <div class="row_nw_center_center ol_mouse_position_info_title">Latitude: </div>
      <div class="row_nw_center_center ol_mouse_position_info_info">{{ mouseInfo.latitude }}</div>
    </div>
    <div class="row_nw_fs_center ol_mouse_position_info">
      <div class="row_nw_center_center ol_mouse_position_info_title">Level: </div>
      <div class="row_nw_center_center ol_mouse_position_info_info">{{ mouseInfo.zoom }}</div>
    </div>
    <div class="row_nw_fs_center ol_mouse_position_info">
      <div class="row_nw_center_center ol_mouse_position_info_title">Scale: </div>
      <div class="row_nw_center_center ol_mouse_position_info_info">{{ mouseInfo.scale }}</div>
    </div>
    <div class="row_nw_fs_center ol_mouse_position_info">
      <div class="row_nw_center_center ol_mouse_position_info_title">Resolution: </div>
      <div class="row_nw_center_center ol_mouse_position_info_info">{{ mouseInfo.resolution }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "OpenLayerMouseInfo",
  props: {
    mouseInfo: {
      type: Object,
      default() {
        return {
          longitude: -180.0,
          latitude: -90.0,
          scale: "1:120",
          zoom: 18.9999,
          resolution: 1,
        };
      },
    },
  },
});
</script>

<style scoped lang="scss">
.ol_mouse_position_container {
  position: absolute;
  width: auto;
  min-width: 720px;
  height: auto;
  bottom: 0px;
  right: 0px;
  z-index: 3;
  padding: 5px;
  background: rgba(26, 32, 44, 0.9);
  border-radius: 4px;
}

.ol_mouse_position_container_unshow {
  display: none;
}

.ol_mouse_position_info {
  width: auto;
  height: 32px;
  padding: 0px 8px;
}

.ol_mouse_position_info_title {
  font-size: 14px;
  font-family: Source Han Sans CN;
  font-weight: 400;
  color: #eee;
}

.ol_mouse_position_info_info {
  font-size: 14px;
  font-family: Source Han Sans CN;
  font-weight: 400;
  color: #ffffff;
}
</style>
