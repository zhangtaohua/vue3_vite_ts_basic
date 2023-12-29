<template>
  <div ref="dateSliderDom" class="row_nw_center_center date_slider_container">
    <input
      v-model="current.timestamp"
      class="input_range"
      type="range"
      name="rangeTime"
      :min="current.min"
      :max="current.max"
      :step="dayStep"
      @input="showTimeHandle"
      @change="sendTimesHandle"
    />
    <div class="row_nw_sb_center bgtime_box">
      <div v-for="(md, index) in bgDates.MD" :key="'md_' + index" class="row_nw_center_center bgtime_show">{{
        md
      }}</div>
    </div>

    <div v-if="current.isShowYMD" class="row_nw_center_center it_time_box" :style="showTimeStyle">
      <div class="row_nw_center_center it_time_show">{{ current.YMD }}</div>
      <div class="it_time_arrow"></div>
    </div>
  </div>
</template>

<script setup>
import { watch, ref, reactive, computed, onMounted } from "vue";

const dateSliderDom = ref(null);
const daySeconds = 24 * 60 * 60 * 1000;
const dayStep = 10 * 60 * 1000;
const featureDays = 7;
const dayGaps = featureDays * daySeconds;
const current = reactive({
  timestamp: 0,
  YMD: "",
  isShowYMD: true,
  min: 0,
  max: 0,
});
const bgDates = reactive({
  MD: [],
});

function datePad(date) {
  return ("" + date).padStart(2, "0");
}

function getYMDHMS(time = null, ymdSplit = "-", hmsSplit = ":") {
  let now = null;
  if (time) {
    now = new Date(time);
  } else {
    now = new Date();
  }
  const timestamp = now.getTime();

  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = now.getDate();

  const hour = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const YY = "" + now.getFullYear();
  const MM = datePad(month);
  const DD = datePad(date);

  const hh = datePad(hour);
  const mm = datePad(minutes);
  const ss = datePad(seconds);

  const YM = `${YY}${ymdSplit}${MM}`;
  const YMD = `${YY}${ymdSplit}${MM}${ymdSplit}${DD}`;
  const HM = `${hh}${hmsSplit}${mm}`;
  const HMS = `${hh}${hmsSplit}${mm}${hmsSplit}${ss}`;
  const YMDHMS = `${YMD} ${HMS}`;

  return {
    timestamp,
    year,
    month,
    date,

    hour,
    minutes,
    seconds,

    YM,
    YMD,
    HM,
    HMS,
    YMDHMS,

    YY,
    MM,
    DD,
    hh,
    mm,
    ss,
  };
}

function init() {
  const { timestamp, YY, MM, DD, hh, mm, ss } = getYMDHMS();
  const bgArray = [`${MM}-${DD}`];
  for (let i = 1; i <= featureDays; i++) {
    let timestampNew = timestamp + i * daySeconds;
    const { YY, MM, DD, hh, mm, ss } = getYMDHMS(timestampNew);
    bgArray.push(`${MM}-${DD}`);
  }
  bgDates.MD = bgArray;
  const max = timestamp + featureDays * daySeconds;
  current.timestamp = timestamp;
  current.min = timestamp;
  current.max = max;
  current.YMD = `${MM}-${DD} ${hh}-${mm}`;
  current.isShowYMD = false;
}
init();

// 这里就获取到时间 可以发送时间啦
function sendTimesHandle() {
  const { YY, MM, DD, hh, mm, ss } = getYMDHMS(parseInt(current.timestamp));
}

let showTimeTipTimer = null;
const showTimeStyle = reactive({
  left: "0px",
});
const dayHalfGap = dayGaps / 2;
const dayHalfTimeStamp = current.min + dayHalfGap;
function showTimeHandle() {
  current.isShowYMD = true;
  const { YY, MM, DD, hh, mm, ss } = getYMDHMS(parseInt(current.timestamp));
  current.YMD = `${MM}-${DD} ${hh}:${mm}`;

  const clientWidth = dateSliderDom.value.clientWidth;
  let leftoffset =
    ((current.timestamp - current.min) / dayGaps) * clientWidth -
    55 +
    ((dayHalfTimeStamp - current.timestamp) / dayHalfGap) * 15;
  showTimeStyle.left = leftoffset + "px";

  if (showTimeTipTimer) {
    clearTimeout(showTimeTipTimer);
  }
  showTimeTipTimer = setTimeout(() => {
    current.isShowYMD = false;
  }, 1000);
}
</script>

<style lang="scss">
.date_slider_container {
  position: fixed;
  bottom: 0;
  left: 20px;
  z-index: 100;
  width: calc(100% - 220px);
  height: 30px;
  margin: auto;
  color: #444;
  font-family: "Share Tech", sans-serif;
}

.input_range {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 101;
  // -moz-appearance: none;
  // appearance: none;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: rgb(255 255 255 / 20%);
  border: 0;
  border-radius: 2px;
  appearance: none;
}

.input_range:active {
  background-color: rgb(255 255 255 / 30%);
  border: 0;
  border-radius: 2px;
}

.input_range:focus {
  outline: none;
}

.input_range::-webkit-slider-runnable-track {
  background-color: rgb(255 255 255 / 20%);
  border: 0;
  border-radius: 2px;
}

.input_range::-webkit-slider-thumb {
  box-sizing: border-box;
  box-sizing: border-box;
  box-sizing: border-box;
  width: 30px;
  height: 30px;
  background-color: #fff;
  border: 0;
  border-radius: 15px;
  box-shadow: 0 2px 2px rgb(51 51 51 / 70%);
  box-shadow: 0 2px 2px rgb(51 51 51 / 70%);
  cursor: pointer;
  appearance: none;
  appearance: none;
  appearance: none;
}

.input_range::-webkit-slider-thumb:hover {
  background-color: #409eff;
}

.input_range::-moz-range-thumb {
  box-sizing: border-box;
  box-sizing: border-box;
  box-sizing: border-box;
  width: 30px;
  height: 30px;
  background-color: #fff;
  border: 0;
  border-radius: 15px;
  box-shadow: 0 2px 2px rgb(51 51 51 / 70%);
  box-shadow: 0 2px 2px rgb(51 51 51 / 70%);
  cursor: pointer;
}

.input_range::-moz-range-thumb:hover {
  background-color: #409eff;
}

.input_range:active::-webkit-slider-thumb,
.input_range:active::-moz-range-thumb {
  background-color: #409eff;
  box-shadow: 0 3px 3px rgb(51 51 51 / 40%);
  box-shadow: 0 3px 3px rgb(51 51 51 / 40%);
}

.input_range::-moz-focus-inner,
.input_range::-moz-focus-outer,
.input_range::-moz-range-track {
  background-color: rgb(255 255 255 / 20%);
  border: 0;
  border-radius: 2px;
}

.bgtime_box {
  position: absolute;
  z-index: 1;
  width: 100%;
  height: 100%;
}

.bgtime_show {
  color: #333;
  font-size: 16px;
}

.it_time_box {
  position: absolute;
  top: -40px;
  left: -55px;
  width: 110px;
  height: 30px;
}

.it_time_show {
  width: 100%;
  height: 100%;
  color: #333;
  font-size: 16px;
  background: rgb(255 255 255 / 50%);
  border-radius: 12px;
}

.it_time_arrow {
  position: absolute;
  top: 30px;
  left: 45px;
  width: 0;
  height: 0;
  border-top: 10px solid rgb(255 255 255 / 50%);
  border-right: 10px solid transparent;
  border-left: 10px solid transparent;
}
</style>
