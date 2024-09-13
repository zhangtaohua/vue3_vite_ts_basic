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
import { defineComponent, onUnmounted, reactive, ref } from "vue";

export default defineComponent({
  name: "EllipsisTextScrollCut",
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
        // window.cancelAnimationFrame(scollTimer)
        clearInterval(scollTimer);
        scollTimer = null;
      }
    }

    let currentPos = 0;
    let wordCount = 0;
    let textScrolled = "";
    function getIsEllipsis() {
      const node = testBox.value; // 判断的dom节点，使用ref
      const clientWidth = node.clientWidth;
      const scrollWidth = node.scrollWidth;

      if (clientWidth < scrollWidth) {
        isEllipsis.value = true;
        currentPos = 0;
        wordCount = Math.floor(clientWidth / fontSize);
        textScrolled = props!.text;
        // scollTimer = window.requestAnimationFrame(loop)
        scollTimer = setInterval(() => {
          loop(wordCount);
        }, 350);
      } else {
        isEllipsis.value = false;
      }
    }

    const loop = (wordCount) => {
      if (currentPos > textScrolled.length - 1.5 * wordCount) {
        textScrolled = textScrolled + " " + props!.text;
      }
      textScroll.value = textScrolled.substr(currentPos, wordCount);
      currentPos++;
    };

    const resetLoop = () => {
      textScroll.value = props!.text;
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
  white-space: nowrap;
  font-size: 16px;
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
}

.text_show::-webkit-scrollbar {
  width: 0;
}
</style>
