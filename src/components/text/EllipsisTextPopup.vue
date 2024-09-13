<template>
  <div class="row_nw_fs_center text_comp_container" @mouseenter="getIsEllipsis">
    <div ref="testBox" class="text_box text_ellipsis" :style="textStyle">
      {{ text }}
    </div>
    <div v-if="isEllipsis" class="text_toast_box" :style="[toastStyle, posStyle]">
      {{ text }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from "vue";

export default defineComponent({
  name: "EllipsisTextPopup",
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
    const posStyle = reactive({
      top: "0px",
      left: "0px",
    });

    onMounted(() => {
      getIsEllipsis();
    });

    function getIsEllipsis() {
      const node = testBox.value; // 判断的dom节点，使用ref
      const pos = node.getBoundingClientRect();
      const clientWidth = node.clientWidth;
      const scrollWidth = node.scrollWidth;
      posStyle.top = pos.top + 30 + "px";
      posStyle.left = pos.left + "px";

      if (clientWidth < scrollWidth) {
        isEllipsis.value = true;
      } else {
        isEllipsis.value = false;
      }
    }

    return {
      testBox,
      isEllipsis,
      posStyle,
      getIsEllipsis,
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

.text_box:hover + .text_toast_box {
  display: block;
  position: fixed;
}

.text_toast_box {
  position: fixed;
  display: none;
  width: auto;
  height: auto;
  line-height: 20px;
  font-size: 0.75rem;
  background-color: rgba(0, 0, 0, 0.8);
  color: rgba(255, 255, 255, 1);
  padding: 8px;
  border-radius: 4px;
  z-index: -1;
  text-align: left;
}
</style>
