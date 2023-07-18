<template>
  <div
    ref="dateContainerDom"
    class="row_nw_center_center date_container"
    @mouseup="mouseDownupHandle(false)"
    @mousemove="mouseMoveHandle"
  >
    <div v-if="isShowWindowMask" class="window_mask" @mouseup="mouseDownupHandle(false)"></div>
    <canvas ref="rangeCanvasDom" width="150" height="150"> Your browser does not support the canvas element. </canvas>
    <div
      class="point_mask"
      :style="pointMaskStyle"
      @mousedown="mouseDownupHandle(true)"
      @mouseup="mouseDownupHandle(false)"
    ></div>
    <div class="col_nw_center_center show_box">
      <div
        class="row_nw_center_center pass_box"
        :class="{ pass_box_act: dateOptions.isCanPast }"
        @click="toggleDateCanPast()"
        >PAST</div
      >
      <div class="row_nw_center_center action_box">
        <div class="row_nw_center_center add_box" @click="setDateByClick(true)">+</div>
        <div class="row_nw_center_center add_box" @click="resetDateNow()">•</div>
        <div class="row_nw_center_center minu_box" @click="setDateByClick(false)">-</div>
      </div>
      <div class="row_nw_center_center ymd_box">
        <div class="row_nw_center_center yy_box">{{ current.YY }}</div>
        <div class="row_nw_center_center split_box">-</div>
        <div class="row_nw_center_center mm_box">{{ current.MM }}</div>
        <div class="row_nw_center_center split_box">-</div>
        <div
          class="row_nw_center_center dd_box"
          :class="{ pass_box_act: dateOptions.pos == 'DD' }"
          @click="setDateStepPos('DD')"
          >{{ current.DD }}</div
        >
      </div>
      <div class="row_nw_center_center hms_box">
        <div
          class="row_nw_center_center hh_box"
          :class="{ pass_box_act: dateOptions.pos == 'hh' }"
          @click="setDateStepPos('hh')"
          >{{ current.hh }}</div
        >
        <div class="row_nw_center_center split_box">:</div>
        <div
          class="row_nw_center_center mi_box"
          :class="{ pass_box_act: dateOptions.pos == 'mm' }"
          @click="setDateStepPos('mm')"
          >{{ current.mm }}</div
        >
        <div class="row_nw_center_center split_box">:</div>
        <div
          class="row_nw_center_center ss_box"
          :class="{ pass_box_act: dateOptions.pos == 'ss' }"
          @click="setDateStepPos('ss')"
          >{{ current.ss }}</div
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch, ref, reactive, computed, onMounted } from "vue";

const emit = defineEmits(["onChange"]);

const isShowWindowMask = ref(false);
const dateOptions = reactive({
  isCanPast: false,
  pos: "hh",
  timestamp: 0,
  YY: 24 * 60 * 60 * 1000,
  MM: 24 * 60 * 60 * 1000,
  DD: 24 * 60 * 60 * 1000,
  hh: 60 * 60 * 1000,
  mm: 60 * 1000,
  ss: 10 * 1000,
});

const current = reactive({
  timestamp: 0,
  YY: "",
  MM: "",
  DD: "",
  hh: "",
  mm: "",
  ss: "",
});

const pointMaskStyle = reactive({
  top: 0 + "px",
  left: 0 + "px",
});

const pointOld = {
  x: 0,
  y: 0,
  ox: 0,
  oy: 0,
};

const canvasSize = 150; // 这个是画布容器大小 要和css设置值一致
const center = canvasSize / 2; // 这个是圆的位置
const radius = (canvasSize * 0.85) / 2; // 这个是圆的半径
const buttonSize = 10; // 这个是控制圆点半径大小
const dateContainerDom = ref(null);
const rangeCanvasDom = ref(null);
let canvas = null;
let canvasCtx = null;
let rect = null; // 画布的矩形框大小
let centerX = null;
let centerY = null;
let isMouseDown = false;
let currentAngle = 0;
let oldAngle = 0;
const perDegreeToRadian = (1 / 180) * Math.PI;
const perDegreeToY = (canvasSize * 0.85) / 180;

watch(
  () => current.timestamp,
  () => {
    emit("onChange", {
      timestamp: current.timestamp,
      YMDHMS: `${current.YY}-${current.MM}-${current.DD} ${current.hh}:${current.mm}:${current.ss}`,
    });
    return current.timestamp;
  },
  {
    immediate: false,
    deep: true,
  },
);

onMounted(() => {
  init();
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

function resetDateOptionsCurrent() {
  const { timestamp, year, month, date, hour, minutes, seconds, YY, MM, DD, hh, mm, ss } = getYMDHMS();
  dateOptions.isCanPast = false;
  dateOptions.pos = "hh";
  dateOptions.timestamp = timestamp;

  current.timestamp = timestamp;
  current.YY = YY;
  current.MM = MM;
  current.DD = DD;
  current.hh = hh;
  current.mm = mm;
  current.ss = ss;

  oldAngle = 0;
  currentAngle = 0;
}
resetDateOptionsCurrent();

function init() {
  canvas = rangeCanvasDom.value;
  canvasCtx = canvas.getContext("2d");
  rect = canvas.getBoundingClientRect();
  centerX = rect.right - canvasSize / 2;
  centerY = rect.top + canvasSize / 2;
  pointOld.ox = pointOld.x = centerX;
  pointOld.oy = pointOld.y = centerY - radius;
  canvasCtx.save();
  updateView(0, 0);
}

function setCurrent(time) {
  const { timestamp, year, month, date, hour, minutes, seconds, YY, MM, DD, hh, mm, ss } = getYMDHMS(time);

  current.timestamp = timestamp;
  current.YY = YY;
  current.MM = MM;
  current.DD = DD;
  current.hh = hh;
  current.mm = mm;
  current.ss = ss;
}

function countAngleBetweenPointAndStart(pointX, pointY, isUpdateCircleOnly = false) {
  // 得到弧度值
  const cursorAngleRadians = countRealAngel(pointX, pointY);
  pointOld.x = pointX;
  pointOld.y = pointY;
  let isCanUpdateView = true;
  if (!isUpdateCircleOnly) {
    isCanUpdateView = updateDate(cursorAngleRadians);
  }
  isCanUpdateView && updateView(cursorAngleRadians, pointY);
}

function updateView(cursorAngleRadians, pointY) {
  canvasCtx.clearRect(0, 0, 300, 300);
  drawCircleRange();
  drawGrabButton(cursorAngleRadians, pointY);
}

function updateDate(cursorAngleRadians) {
  const diffAngle = getDiffAngle(cursorAngleRadians);
  return getDateByAngle(diffAngle);
}

function getDiffAngle(cursorAngleRadians) {
  // 得到角度值
  const cursorAngle = (cursorAngleRadians * 180) / Math.PI;
  currentAngle = parseInt(cursorAngle);
  let diffAngle = currentAngle - oldAngle;
  if (diffAngle > 180) {
    diffAngle = diffAngle - 360;
  } else if (diffAngle < -180) {
    diffAngle = diffAngle + 360;
  }
  // console.log('old', oldAngle, cursorAngle)
  oldAngle = currentAngle;
  return diffAngle;
}

function getDateByAngle(angle) {
  const pos = dateOptions.pos; // 'ss'
  // console.log("angle", angle)
  current.timestamp = current.timestamp + angle * dateOptions[pos];
  let isNeedUpdateView = true;
  if (angle < 0) {
    if (!dateOptions.isCanPast) {
      if (current.timestamp <= dateOptions.timestamp) {
        current.timestamp = dateOptions.timestamp;
        pointOld.x = pointOld.ox;
        pointOld.y = pointOld.oy;
        oldAngle = 0;
        updateView(0, 0);
        isNeedUpdateView = false;
      }
    }
  }
  setCurrent(current.timestamp);
  return isNeedUpdateView;
}

// 计算 点的弧度
function countRealAngel(pointX, pointY) {
  const angleBetweenXAndCursor = Math.abs(Math.atan((pointY - centerY) / (pointX - centerX)));
  if (pointX > centerX && pointY <= centerY) return Math.PI / 2 - angleBetweenXAndCursor;
  else if (pointX > centerX && pointY > centerY) return Math.PI / 2 + angleBetweenXAndCursor;
  else if (pointX <= centerX && pointY > centerY) return (3 / 2) * Math.PI - angleBetweenXAndCursor;
  else return (3 / 2) * Math.PI + angleBetweenXAndCursor;
}

function drawCircleRange(angle = 2 * Math.PI) {
  canvasCtx.restore();
  canvasCtx.lineWidth = 8;
  canvasCtx.strokeStyle = "#1976D2";
  canvasCtx.beginPath();
  canvasCtx.arc(center, center, radius, 0, angle);
  canvasCtx.stroke();
}

function drawGrabButton(angle = 2 * Math.PI, pointY) {
  canvasCtx.restore();
  canvasCtx.strokeStyle = "#0D47A1";
  canvasCtx.lineWidth = 1;
  const point = countButtonPosition(angle, pointY);
  pointMaskStyle.top = point.y - 10 + "px";
  pointMaskStyle.left = point.x - 10 + "px";
  canvasCtx.beginPath();
  canvasCtx.arc(point.x, point.y, buttonSize, buttonSize, 0, 2 * Math.PI);
  canvasCtx.stroke();
  canvasCtx.fillStyle = "#0D47A1";
  canvasCtx.fill();
}

function countButtonPosition(angle, pointY) {
  const x = radius * Math.sin(angle) + center;
  const temp = Math.sqrt(Math.pow(radius, 2) - Math.pow(x - center, 2));
  const y = center + temp;
  const y2 = center - temp;
  // console.log(y, y2);
  return { x: x, y: pointY >= centerY ? y : y2 };
}

function mouseDownupHandle(isDown) {
  isMouseDown = isDown;
  isShowWindowMask.value = isDown;
}

function mouseMoveHandle(e) {
  if (isMouseDown) {
    countAngleBetweenPointAndStart(e.clientX, e.clientY);
  }
}

function setDateStepPos(posstr) {
  if (posstr) {
    dateOptions.pos = posstr;
  } else {
    dateOptions.pos = "ss";
  }
}

function getRadiansPosFromDegree(degree) {
  const stepTemp = Math.abs(degree) * perDegreeToY;
  if (degree > 0) {
    if (pointOld.x > centerX) {
      if (pointOld.y > centerY) {
        pointOld.x = pointOld.x - stepTemp;
      } else {
        pointOld.x = pointOld.x + stepTemp;
      }
      pointOld.y = pointOld.y + stepTemp;
    } else {
      if (pointOld.y > centerY) {
        pointOld.x = pointOld.x - stepTemp;
      } else {
        pointOld.x = pointOld.x + stepTemp;
      }
      pointOld.y = pointOld.y - stepTemp;
    }
  } else {
    if (pointOld.x > centerX) {
      if (pointOld.y > centerY) {
        pointOld.x = pointOld.x + stepTemp;
      } else {
        pointOld.x = pointOld.x - stepTemp;
      }
      pointOld.y = pointOld.y - stepTemp;
    } else {
      if (pointOld.y > centerY) {
        pointOld.x = pointOld.x + stepTemp;
      } else {
        pointOld.x = pointOld.x - stepTemp;
      }
      pointOld.y = pointOld.y + stepTemp;
    }
  }
}

function setDateByClick(isAdd) {
  if (isAdd) {
    getRadiansPosFromDegree(1);
  } else {
    getRadiansPosFromDegree(-1);
  }
  countAngleBetweenPointAndStart(pointOld.x, pointOld.y);
}

function resetDateNow() {
  resetDateOptionsCurrent();
  canvasCtx.save();
  updateView(0, 0);
  pointOld.x = pointOld.ox;
  pointOld.y = pointOld.oy;
}

function toggleDateCanPast() {
  dateOptions.isCanPast = !dateOptions.isCanPast;
}
</script>

<style lang="scss">
.date_container {
  position: fixed;
  width: 150px;
  height: 150px;
  bottom: 90px;
  right: 60px;
  margin: auto;
  font-family: "Share Tech", sans-serif;
  color: #444;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
}

.window_mask {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 98;
  background-color: rgba(255, 0, 0, 0);
}

.point_mask {
  position: absolute;
  width: 20px;
  height: 20px;
  top: 0px;
  left: 0px;
  background-color: rgba($color: #000000, $alpha: 0);
  z-index: 2;
  cursor: pointer;
}

.show_box {
  position: absolute;
  width: 80%;
  height: 100%;
  left: 10%;
  top: 0;
  z-index: 1;
}

.pass_box {
  width: max-content;
  height: 20px;
  font-size: 16px;
  color: #444;
  padding: 0 4px;
  cursor: pointer;
}

.pass_box:hover {
  color: #ffffff;
  background-color: rgba($color: #409eff, $alpha: 0.5);
  border-radius: 2px;
}

.pass_box_act {
  color: #ffffff;
  background-color: #409eff;
  border-radius: 2px;
}

.action_box {
  width: 100%;
  height: 20px;
}

.add_box {
  width: 20px;
  height: 100%;
  font-size: 16px;
  color: #444;
  margin-right: 8px;
  cursor: pointer;
}

.add_box:hover {
  color: #ffffff;
  background-color: rgba($color: #409eff, $alpha: 0.5);
  border-radius: 2px;
}

.minu_box {
  width: 20px;
  height: 100%;
  font-size: 16px;
  color: #444;
  cursor: pointer;
}

.minu_box:hover {
  color: #ffffff;
  background-color: rgba($color: #409eff, $alpha: 0.5);
  border-radius: 2px;
}

.ymd_box {
  width: 100%;
  height: 20px;
}

.yy_box {
  width: max-content;
  height: 100%;
  font-size: 16px;
  color: #444;
}

.mm_box {
  width: max-content;
  height: 100%;
  font-size: 16px;
  color: #444;
}

.dd_box {
  width: max-content;
  height: 100%;
  font-size: 16px;
  color: #444;
  cursor: pointer;
}

.dd_box:hover {
  color: #ffffff;
  background-color: rgba($color: #409eff, $alpha: 0.5);
  border-radius: 2px;
}

.hms_box {
  width: 100%;
  height: 20px;
}

.hh_box {
  width: max-content;
  height: 100%;
  font-size: 16px;
  color: #444;
  cursor: pointer;
}

.hh_box:hover {
  color: #ffffff;
  background-color: rgba($color: #409eff, $alpha: 0.5);
  border-radius: 2px;
}

.mi_box {
  width: max-content;
  height: 100%;
  font-size: 16px;
  color: #444;
  cursor: pointer;
}

.mi_box:hover {
  color: #ffffff;
  background-color: rgba($color: #409eff, $alpha: 0.5);
  border-radius: 2px;
}

.ss_box {
  width: max-content;
  height: 100%;
  font-size: 16px;
  color: #444;
  cursor: pointer;
}

.ss_box:hover {
  color: #ffffff;
  background-color: rgba($color: #409eff, $alpha: 0.5);
  border-radius: 2px;
}

.split_box {
  width: max-content;
  height: 100%;
  font-size: 16px;
  color: #444;
}
</style>
