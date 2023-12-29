<template>
  <!-- 通用经度输入组件 -->
  <div id="pitchSlider" class="round_containner"> </div>
</template>

<script setup lang="ts">
import "./jquery-3.7.1";
import { ref, reactive, defineProps, defineEmits, computed, watch, onMounted } from "vue";
import "./roundslider.min.css";
import "./roundslider.min.js";

// npm i vue-three-round-slider

onMounted(() => {
  // $("#pitchSlider").roundSlider({
  //   radius: 90,
  //   width: 10,
  //   handleSize: "+10",
  //   sliderType: "range",
  //   value: "10,60",
  // });
  initPitchSlider();
});
const pitchSatelliteAngle = ref([-30, 30]);

// 右边的
const initPitchSlider = () => {
  $("#pitchSlider").roundSlider("destroy");
  $("#pitchSlider").roundSlider({
    value: pitchSatelliteAngle.value[0] + "," + pitchSatelliteAngle.value[1],
    min: "-30",
    max: "30",
    startAngle: 135,
    circleShape: "custom-quarter",
    radius: 50,
    width: 6,
    sliderType: "range",
    pathColor: "#e6e6e6",
    handleShape: "square",
    handleSize: "15,2",
    showTooltip: !1,
    update: (t) => {
      pitchSatelliteAngle.value = t.value.split(",");
    },
  });
};

// 左边的
const initSideSlider = () => {
  $("#sideSlider").roundSlider("destroy");
  $("#sideSlider").roundSlider({
    value: pitchSatelliteAngle.value[0] + "," + pitchSatelliteAngle.value[1],
    min: "-45",
    max: "45",
    startAngle: -45,
    circleShape: "custom-quarter",
    radius: 50,
    width: 6,
    sliderType: "range",
    handleShape: "square",
    handleSize: "12,2",
    showTooltip: !1,
    update: function (t) {
      pitchSatelliteAngle.value = t.value.split(",");
    },
  });
};
</script>

<style scoped>
.round_containner {
  width: 100px;
  height: 100px;
  margin-top: 32px;
  margin-left: 32px;
}
</style>
