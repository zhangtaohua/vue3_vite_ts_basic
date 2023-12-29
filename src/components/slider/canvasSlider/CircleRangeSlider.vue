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
      <div class="row_nw_center_center action_box">
        <div class="row_nw_center_center add_box" @click="setDateByClick(true)">+</div>
        <div class="row_nw_center_center add_box" @click="resetDateNow()">•</div>
        <div class="row_nw_center_center minu_box" @click="setDateByClick(false)">-</div>
      </div>
      <div class="row_nw_center_center ymd_box">
        <div class="row_nw_center_center yy_box">{{ current }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, reactive, computed, onMounted } from "vue";

const props = defineProps({
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 100,
  },
  step: {
    type: Number,
    default: 0.000001,
  },
  modelValue: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["update:modelValue", "onChange"]);

const current = ref(props.modelValue);

const isShowWindowMask = ref(false);

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
const stepValue = props.step ? props.step : 1;
const perStepToDegree = (360 * stepValue) / (props.max - props.min);

let decimalLength = 0;

onMounted(() => {
  init();
});

function mouseDownupHandle(isDown) {
  isMouseDown = isDown;
  isShowWindowMask.value = isDown;
}

function mouseMoveHandle(e) {
  if (isMouseDown) {
    countAngleBetweenPointAndStart(e.clientX, e.clientY);
  }
}

function init() {
  let stepValueArray = stepValue.toString().split(".");
  if (stepValueArray.length >= 2) {
    decimalLength = stepValueArray[1].length;
  }

  oldAngle = 0;
  currentAngle = 0;
  canvas = rangeCanvasDom.value;
  canvasCtx = canvas.getContext("2d");
  rect = canvas.getBoundingClientRect();
  centerX = rect.right - canvasSize / 2;
  centerY = rect.top + canvasSize / 2;
  pointOld.ox = pointOld.x = centerX;
  pointOld.oy = pointOld.y = centerY - radius;
  canvasCtx.save();
  updateView(Math.PI / 6, 0);
}

/**
 * @description 通过点的位置 来调整 数据 和 视图。
 */
function countAngleBetweenPointAndStart(pointX, pointY, isUpdateCircleOnly = false) {
  // 得到弧度值
  console.log("countAngle", pointX, pointY);
  const cursorAngleRadians = countRealAngel(pointX, pointY);
  pointOld.x = pointX;
  pointOld.y = pointY;
  if (!isUpdateCircleOnly) {
    updateData(cursorAngleRadians);
  }
  updateView(cursorAngleRadians, pointY);
}

function updateView(cursorAngleRadians, pointY) {
  canvasCtx.clearRect(0, 0, 300, 300);
  drawCircleRange(-Math.PI / 3, Math.PI / 3);
  drawGrabButton(cursorAngleRadians, pointY);
}

function updateData(cursorAngleRadians) {
  const cursorAngle = (cursorAngleRadians * 180) / Math.PI;
  console.log("cursorAngleRadians", cursorAngleRadians, cursorAngle);
  const steps = Math.floor(cursorAngle / perStepToDegree);
  let valueTemp = (steps * stepValue).toFixed(decimalLength);
  current.value = +valueTemp;
}

/**
 * @description 通过点的位置，计算当前点的弧度。
 */
function countRealAngel(pointX, pointY) {
  const angleBetweenXAndCursor = Math.abs(Math.atan((pointY - centerY) / (pointX - centerX)));
  if (pointX > centerX && pointY <= centerY) return Math.PI / 2 - angleBetweenXAndCursor;
  else if (pointX > centerX && pointY > centerY) return Math.PI / 2 + angleBetweenXAndCursor;
  else if (pointX <= centerX && pointY > centerY) return (3 / 2) * Math.PI - angleBetweenXAndCursor;
  else return (3 / 2) * Math.PI + angleBetweenXAndCursor;
}

function drawCircleRange(start, end = 2 * Math.PI) {
  canvasCtx.restore();
  canvasCtx.lineWidth = 8;
  canvasCtx.strokeStyle = "#1976D2";
  canvasCtx.beginPath();
  canvasCtx.arc(center, center, radius, start, end);
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
  console.log("count", x, y, y2);
  return { x: x, y: pointY >= centerY ? y : y2 };
}

/**
 * @description: 从度数获取得到相应的弧度值 和 坐标 x, y
 */
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
    getRadiansPosFromDegree(perStepToDegree);
  } else {
    getRadiansPosFromDegree(-perStepToDegree);
  }
  countAngleBetweenPointAndStart(pointOld.x, pointOld.y);
}

function resetDateNow() {
  oldAngle = 0;
  currentAngle = 0;
  current.value = 0;
  canvasCtx.save();
  updateView(0, 0);
  pointOld.x = pointOld.ox;
  pointOld.y = pointOld.oy;
}
</script>

<style lang="scss">
.date_container {
  position: fixed;
  right: 60px;
  bottom: 90px;
  z-index: 100;
  width: 150px;
  height: 150px;
  margin: auto;
  color: #444;
  font-family: "Share Tech", sans-serif;
  background-color: rgb(255 255 255 / 90%);
  border-radius: 12px;
}

.window_mask {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 98;
  width: 100vw;
  height: 100vh;
  background-color: rgb(255 0 0 / 20%);
}

.point_mask {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  width: 20px;
  height: 20px;
  background-color: rgba($color: #000, $alpha: 20%);
  cursor: pointer;
}

.show_box {
  position: absolute;
  top: 0;
  left: 10%;
  z-index: 1;
  width: 80%;
  height: 100%;
}

.pass_box {
  width: max-content;
  height: 20px;
  padding: 0 4px;
  color: #444;
  font-size: 16px;
  cursor: pointer;
}

.pass_box:hover {
  color: #fff;
  background-color: rgba($color: #409eff, $alpha: 50%);
  border-radius: 2px;
}

.pass_box_act {
  color: #fff;
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
  margin-right: 8px;
  color: #444;
  font-size: 16px;
  cursor: pointer;
}

.add_box:hover {
  color: #fff;
  background-color: rgba($color: #409eff, $alpha: 50%);
  border-radius: 2px;
}

.minu_box {
  width: 20px;
  height: 100%;
  color: #444;
  font-size: 16px;
  cursor: pointer;
}

.minu_box:hover {
  color: #fff;
  background-color: rgba($color: #409eff, $alpha: 50%);
  border-radius: 2px;
}

.ymd_box {
  width: 100%;
  height: 20px;
}

.yy_box {
  width: max-content;
  height: 100%;
  color: #444;
  font-size: 16px;
}

.mm_box {
  width: max-content;
  height: 100%;
  color: #444;
  font-size: 16px;
}

.dd_box {
  width: max-content;
  height: 100%;
  color: #444;
  font-size: 16px;
  cursor: pointer;
}

.dd_box:hover {
  color: #fff;
  background-color: rgba($color: #409eff, $alpha: 50%);
  border-radius: 2px;
}

.hms_box {
  width: 100%;
  height: 20px;
}

.hh_box {
  width: max-content;
  height: 100%;
  color: #444;
  font-size: 16px;
  cursor: pointer;
}

.hh_box:hover {
  color: #fff;
  background-color: rgba($color: #409eff, $alpha: 50%);
  border-radius: 2px;
}

.mi_box {
  width: max-content;
  height: 100%;
  color: #444;
  font-size: 16px;
  cursor: pointer;
}

.mi_box:hover {
  color: #fff;
  background-color: rgba($color: #409eff, $alpha: 50%);
  border-radius: 2px;
}

.ss_box {
  width: max-content;
  height: 100%;
  color: #444;
  font-size: 16px;
  cursor: pointer;
}

.ss_box:hover {
  color: #fff;
  background-color: rgba($color: #409eff, $alpha: 50%);
  border-radius: 2px;
}

.split_box {
  width: max-content;
  height: 100%;
  color: #444;
  font-size: 16px;
}
</style>
