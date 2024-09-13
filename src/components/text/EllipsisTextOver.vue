<template>
  <div class="row_nw_fs_center text_comp_container" @mouseenter="getIsEllipsis" @mouseleave="setEllipsis(false)">
    <div
      v-show="isEllipsis"
      class="row_nw_fs_center text_toast_box"
      :class="{ text_toast_box_show: isEllipsis }"
      :style="toastStyle"
    >
      {{ text }}
    </div>
    <div ref="testBox" class="text_box text_ellipsis" :style="textStyle">
      {{ text }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";

export default defineComponent({
  name: "EllipsisTextOver",
  props: {
    text: {
      type: String,
      default: "我是很长很长我是很长很长我是很长很长我是很长很长我是很长很长",
    },
    textStyle: {
      type: Object,
      default() {
        return {
          // color: 'red'
        };
      },
    },
    toastStyle: {
      type: Object,
      default() {
        return {
          // color: 'red'
        };
      },
    },
  },
  setup() {
    const testBox = ref(null);
    const isEllipsis = ref(false);

    function getIsEllipsis() {
      const node = testBox.value; // 判断的dom节点，使用ref
      const clientWidth = node.clientWidth;
      const scrollWidth = node.scrollWidth;
      if (clientWidth < scrollWidth) {
        isEllipsis.value = true;
      } else {
        isEllipsis.value = false;
      }
    }

    function setEllipsis(isAnimate = false) {
      isEllipsis.value = isAnimate;
    }

    return {
      testBox,
      isEllipsis,
      getIsEllipsis,
      setEllipsis,
    };
  },
});
</script>

<style scoped lang="scss">
.text_comp_container {
  position: relative;
  width: 100%;
  height: 100%;
}

.text_box {
  width: 100%;
  height: auto;
}

.text_ellipsis {
  white-space: nowrap;
  word-wrap: break-word;
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  // text-overflow: -o-ellipsis-lastline;
  // -webkit-line-clamp: 1;
  // line-clamp: 1;
}

.text_toast_box {
  position: absolute;
  display: none;
  width: max-content;
  height: 100%;
  font-size: 0.75rem;
  background-color: rgba(250, 250, 250, 1);
  padding: 0;
  z-index: 2;
}

.text_toast_box_show {
  display: flex;
}
</style>
