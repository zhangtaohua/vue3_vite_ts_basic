<template>
  <div class="row_nw_fs_center text_comp_container" @mouseenter="getIsEllipsis" @mouseleave="setEllipsis(false)">
    <div
      ref="testBox"
      class="text_box"
      :style="textStyle"
      :class="{ text_show: isEllipsis, text_ellipsis: !isEllipsis }"
    >
      {{ textScroll }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "EllipsisTextScroll",
  props: {
    text: {
      type: String,
      default: "我是很长很长我是BA",
    },
    textStyle: {
      type: Object,
      default() {
        return {
          // color: 'red'
        };
      },
    },
  },
  setup(props, _) {
    const testBox = ref(null);
    const isEllipsis = ref(false);
    const textScroll = ref(props!.text || "");
    const fontSize = 16;

    let scollTimer = null;
    function clearTimer() {
      if (scollTimer) {
        clearInterval(scollTimer);
        scollTimer = null;
      }
    }

    let currentPos = 0;
    function getIsEllipsis() {
      const node = testBox.value; // 判断的dom节点，使用ref
      const clientWidth = node.clientWidth;
      const scrollWidth = node.scrollWidth;

      if (clientWidth < scrollWidth) {
        isEllipsis.value = true;
        currentPos = 0;
        scollTimer = setInterval(() => {
          loop();
        }, 30);
      } else {
        isEllipsis.value = false;
      }
    }

    const loop = () => {
      if (testBox.value.scrollLeft > testBox.value.scrollWidth - testBox.value.clientWidth - fontSize) {
        textScroll.value = textScroll.value + " " + props!.text;
      }
      testBox.value.scrollLeft = currentPos;
      currentPos++;
    };

    const resetLoop = () => {
      textScroll.value = props!.text;
      testBox.value.scrollLeft = 0;
    };

    function setEllipsis(isAnimate = false) {
      isEllipsis.value = isAnimate;
      clearTimer();
      resetLoop();
    }

    return {
      textScroll,
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
  font-size: 16px;
  white-space: nowrap;
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

.text_show {
  overflow: hidden;
  overflow-x: scroll;
}

.text_show::-webkit-scrollbar {
  display: none;
}
</style>
