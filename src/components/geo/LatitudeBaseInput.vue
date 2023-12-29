<template>
  <!-- 经度基本输入组件 -->
  <div class="row_nw_fs_center lat_container" @wheel="mouseWheelHandle">
    <input
      v-if="inputMode === 'DEFAULT'"
      v-model="latObj.latitudeText"
      class="row_nw_fs_center lat_number"
      type="text"
      @input="DefInputHandle"
      @blur="DefBlurHandle"
    />
    <div v-else-if="inputMode === 'HUMAN'" class="row_nw_fs_center wh_100p_100p">
      <input
        v-model="latObj.latitudeAbsText"
        class="row_nw_fs_center lat_human"
        type="text"
        @input="humanInputHandle"
        @blur="humanBlurHandle"
      />
      <span class="row_nw_fe_center lat_label" @click="snHumanHandle">{{ latObj.isSouth ? "S" : "N" }}</span>
    </div>
    <div v-else-if="inputMode === 'DMS'" class="row_nw_fs_center wh_100p_100p">
      <span class="row_nw_fs_center lat_label" @click="snDmsHandle">{{ latObj.isSouth ? "S:" : "N:" }}</span>
      <input
        v-model="latObj.degrees"
        class="row_nw_fe_center lat_dms"
        type="text"
        @input="degreeInputHandle"
        @blur="dmsBlurHandle"
      />
      <span class="row_nw_center_center lat_unit">°</span>
      <input
        v-model="latObj.minutes"
        class="row_nw_fe_center lat_dms"
        type="text"
        @input="minutesInputHandle"
        @blur="dmsBlurHandle"
      />
      <span class="row_nw_center_center lat_unit">′</span>
      <input
        v-model="latObj.seconds"
        class="row_nw_fe_center lat_dms"
        type="text"
        @input="secondsInputHandle"
        @blur="dmsBlurHandle"
      />
      <span class="row_nw_center_center lat_unit">″</span>
    </div>
    <div v-else-if="inputMode === 'SLIDER'" class="col_nw_center_center slider_wrapper" @click.stop>
      <input
        v-model="latObj.latitude"
        type="range"
        min="-90"
        max="90"
        class="lat_range_input"
        step="0.000001"
        @change="sliderHandle"
      />
      <label for="range" class="row_nw_center_center lat_range_label">{{ latObj.latitude }}</label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, computed, watch } from "vue";

const props = defineProps({
  latitude: {
    type: Number,
    default: 0,
  },
  mode: {
    type: String,
    default: "default",
  },
});

const modes = ["DEFAULT", "HUMAN", "DMS", "SLIDER"];
const emit = defineEmits(["update:latitude", "update:mode", "onChange"]);

const latObj = reactive({
  latitude: 0,
  latitudeText: "0",
  latitudeAbsText: "0",
  latitudeHuman: "0S",
  degrees: "0",
  minutes: "0",
  seconds: "0",
  isSouth: true,
});

function initlatObj(latitude: number) {
  if (latitude < -90 || latitude > 90) {
    latitude = 0;
  }
  latObj.latitude = latitude;
  latObj.latitudeText = "" + latObj.latitude;
  if (latObj.latitude <= 0) {
    latObj.isSouth = true;
  } else {
    latObj.isSouth = false;
  }

  latObj.latitudeAbsText = "" + Math.abs(latObj.latitude);
  latObj.latitudeHuman = latObj.latitudeAbsText + (latObj.isSouth ? "S" : "N");

  let dms = latitudeToDms(latObj.latitudeText);
  latObj.degrees = "" + dms.degrees;
  latObj.minutes = "" + dms.minutes;
  latObj.seconds = "" + dms.seconds;
}

/**
 * @description 用watch 来更新父传给子的数据
 */
watch(
  () => props.latitude,
  () => {
    initlatObj(props.latitude);
  },
  {
    immediate: true,
    deep: true,
  },
);

const inputMode = ref(props.mode.toUpperCase());
let currentmodeIndex = 0;

watch(
  () => props.mode,
  () => {
    currentmodeIndex = modes.indexOf(props.mode.toUpperCase());
    if (currentmodeIndex == -1) {
      inputMode.value = modes[0];
      currentmodeIndex = 0;
    } else {
      inputMode.value = props.mode.toUpperCase();
    }
  },
  {
    immediate: true,
  },
);

function mouseWheelHandle(event) {
  if (event.deltaY > 0) {
    currentmodeIndex++;
    if (currentmodeIndex > 3) {
      currentmodeIndex = 0;
    }
  } else {
    currentmodeIndex--;
    if (currentmodeIndex < 0) {
      currentmodeIndex = 3;
    }
  }
  inputMode.value = modes[currentmodeIndex];
  emit("update:mode", inputMode.value);
}

/**
 * @description 这个用来较验每次输入 带 +/- 号的 经度字符串。
 */
function validateLatitude(latitude: string) {
  // 129.35,30.56
  // const lonlatReg = /^-?((1?[0-7]?\d{1})(([.][0-9]{1,4})?)|180(([.][0]{1,4})?)),-?(([1-8]?\d{1})(([.][0-9]{1,4})?)|90(([.][0]{1,4})?))$/;
  // const latRegex = /^[\-\+]?((0|([1-8]\d?))(\.\d{1,10})?|90(\.0{1,10})?)$/;
  const latRegex = /^(\+|\-)?(([1-8]?[0-9]?)(\.?)(([0-9]{1,6})?)|90(\.?)(([0]{1,6})?))$/;

  if (latitude === "") {
    return "";
  } else {
    if (latRegex.test(latitude)) {
      let latitudeTemp = parseFloat(latitude);
      latitudeTemp = Math.abs(latitudeTemp);
      if (latitudeTemp > 90) {
        if (latitude[0] === "-") {
          return "-90";
        } else if (latitude[0] === "+") {
          return "+90";
        } else {
          return "90";
        }
      }
      return latitude;
    } else {
      let latitudeTemp = parseFloat(latitude);

      if (isNaN(latitudeTemp)) {
        return "";
      } else {
        latitudeTemp = Math.abs(latitudeTemp);
        if (latitudeTemp == 90 && latitude.includes("90.000000")) {
          const pointIndex = latitude.indexOf(".");
          return latitude.substring(0, pointIndex + 7);
        } else if (latitudeTemp > 90) {
          latitudeTemp = 90;
        }

        let latitudeStr = "" + latitudeTemp;
        const pointIndex = latitudeStr.indexOf(".");
        let decimalLength = 0;
        if (pointIndex !== -1) {
          decimalLength = latitudeStr.length - pointIndex - 1;
        }
        if (decimalLength > 6) {
          latitudeStr = latitudeStr.substring(0, pointIndex + 7);
        }

        if (latitude[0] === "-") {
          return "-" + latitudeStr;
        } else if (latitude[0] === "+") {
          return "+" + latitudeStr;
        } else {
          return latitudeStr;
        }
      }
    }
  }
}

function latitudeToDms(latitude: string | number) {
  if (latitude) {
    if (typeof latitude === "string") {
      latitude = parseFloat(latitude);
    }
    if (typeof latitude === "number") {
      let degrees = parseInt(latitude);
      let minutes = parseInt((latitude - degrees) * 60);
      let seconds = parseInt((latitude - degrees) * 3600 - minutes * 60);
      const isSouth = latitude < 0 ? true : false;
      return {
        degrees: Math.abs(degrees),
        minutes: Math.abs(minutes),
        seconds: Math.abs(seconds),
        isSouth,
      };
    }
  }
  return {
    degrees: 0,
    minutes: 0,
    seconds: 0,
  };
}

function dmsToLatitude(degrees: string | number, minutes: string | number, seconds: string | number, isSouth: boolean) {
  if (degrees != "") {
    if (typeof degrees === "string") {
      degrees = parseFloat(degrees);
      if (isNaN(degrees)) {
        degrees = 0;
      }
    }
  } else {
    degrees = 0;
  }

  if (minutes != "") {
    if (typeof minutes === "string") {
      minutes = parseFloat(minutes);
      if (isNaN(minutes)) {
        minutes = 0;
      }
    }
  } else {
    minutes = 0;
  }

  if (seconds != "") {
    if (typeof seconds === "string") {
      seconds = parseFloat(seconds);
      if (isNaN(seconds)) {
        seconds = 0;
      }
    }
  } else {
    seconds = 0;
  }

  let latitude = degrees + minutes / 60 + seconds / 3600;
  if (isSouth) {
    latitude = -latitude;
  }

  return latitude;
}

function DefInputHandle() {
  latObj.latitudeText = validateLatitude(latObj.latitudeText);
}

function DefBlurHandle() {
  latObj.latitudeText = validateLatitude(latObj.latitudeText);
  latObj.latitude = parseFloat(latObj.latitudeText);
  if (latObj.latitude < 0) {
    latObj.isSouth = true;
  } else {
    latObj.isSouth = false;
  }

  latObj.latitudeAbsText = "" + Math.abs(latObj.latitude);
  latObj.latitudeHuman = latObj.latitudeAbsText + (latObj.isSouth ? "S" : "N");

  let dms = latitudeToDms(latObj.latitudeText);
  latObj.degrees = "" + dms.degrees;
  latObj.minutes = "" + dms.minutes;
  latObj.seconds = "" + dms.seconds;
  // 发送信息
  emit("update:latitude", latObj.latitude);
  emit("onChange", latObj);
  console.log("DefBlurHandle", latObj);
}

function validateAbsLatitude(latitude: string) {
  const latRegex = /^(([1-8]?[0-9]?)(\.?)(([0-9]{1,6})?)|90(\.?)(([0]{1,6})?))$/;
  if (latitude === "") {
    return "";
  } else {
    if (latRegex.test(latitude)) {
      let latitudeTemp = parseFloat(latitude);
      if (latitudeTemp > 90) {
        return "90";
      }
      return latitude;
    } else {
      let latitudeTemp = parseFloat(latitude);

      if (isNaN(latitudeTemp)) {
        return "";
      } else {
        if (latitudeTemp == 90 && latitude.includes("90.000000")) {
          const pointIndex = latitude.indexOf(".");
          return latitude.substring(0, pointIndex + 7);
        } else if (latitudeTemp > 90) {
          latitudeTemp = 90;
        }

        let latitudeStr = "" + latitudeTemp;
        const pointIndex = latitudeStr.indexOf(".");
        let decimalLength = 0;
        if (pointIndex !== -1) {
          decimalLength = latitudeStr.length - pointIndex - 1;
        }
        if (decimalLength > 6) {
          latitudeStr = latitudeStr.substring(0, pointIndex + 7);
        }

        return latitudeStr;
      }
    }
  }
}

function humanInputHandle() {
  latObj.latitudeAbsText = validateAbsLatitude(latObj.latitudeAbsText);
}

function humanBlurHandle() {
  latObj.latitudeAbsText = validateAbsLatitude(latObj.latitudeAbsText);
  latObj.latitude = parseFloat(latObj.latitudeAbsText);
  if (latObj.isSouth) {
    latObj.latitude = -latObj.latitude;
    latObj.latitudeText = "-" + latObj.latitudeAbsText;
  }

  latObj.latitudeHuman = latObj.latitudeAbsText + (latObj.isSouth ? "S" : "N");

  let dms = latitudeToDms(latObj.latitudeAbsText);
  latObj.degrees = "" + dms.degrees;
  latObj.minutes = "" + dms.minutes;
  latObj.seconds = "" + dms.seconds;
  // 发送信息
  emit("update:latitude", latObj.latitude);
  emit("onChange", latObj);
  console.log("humanBlurHandle", latObj);
}

function snHumanHandle() {
  latObj.isSouth = !latObj.isSouth;
  humanBlurHandle();
}

function validateDegrees(degrees: string) {
  const degreesRegex = /^\d{2}$/;
  if (degrees === "") {
    return "";
  } else {
    let degreesTemp = parseFloat(degrees);
    if (degreesRegex.test(degrees)) {
      if (degreesTemp >= 90) {
        return "90";
      }
      return degrees;
    } else {
      if (isNaN(degreesTemp)) {
        return "";
      } else {
        if (degreesTemp >= 90) {
          degreesTemp = 90;
        }

        const degreeStr = "" + degreesTemp;
        return degreeStr;
      }
    }
  }
}

function validateMinutesSeconds(ms: string) {
  const msRegex = /^\d{2}$/;
  if (ms === "") {
    return "";
  } else {
    let msTemp = parseFloat(ms);
    if (msRegex.test(ms)) {
      if (msTemp >= 59) {
        return "59";
      }
      return ms;
    } else {
      if (isNaN(msTemp)) {
        return "";
      } else {
        if (msTemp >= 59) {
          msTemp = 59;
        }

        const msStr = "" + msTemp;
        return msStr;
      }
    }
  }
}

function degreeInputHandle() {
  latObj.degrees = validateDegrees(latObj.degrees);
}

function minutesInputHandle() {
  latObj.minutes = validateMinutesSeconds(latObj.minutes);
  if (latObj.degrees && latObj.degrees == "90") {
    latObj.minutes = "0";
  }
}

function secondsInputHandle() {
  latObj.seconds = validateMinutesSeconds(latObj.seconds);
  if (latObj.degrees && latObj.degrees == "90") {
    latObj.seconds = "0";
  }
}

function dmsBlurHandle() {
  let latitude = dmsToLatitude(latObj.degrees, latObj.minutes, latObj.seconds, latObj.isSouth);

  latObj.latitude = latitude;
  latObj.latitudeText = "" + latitude;
  let latitudeAbs = Math.abs(latitude);

  latObj.latitudeAbsText = "" + latitudeAbs;
  latObj.latitudeHuman = latObj.latitudeAbsText + (latObj.isSouth ? "S" : "N");

  // 发送信息
  emit("update:latitude", latObj.latitude);
  emit("onChange", latObj);
  console.log("dmsBlurHandle", latObj);
}

function snDmsHandle() {
  latObj.isSouth = !latObj.isSouth;
  dmsBlurHandle();
}

function sliderHandle() {
  initlatObj(latObj.latitude);
  // 发送信息
  emit("update:latitude", latObj.latitude);
  emit("onChange", latObj);
  console.log("sliderHandle", latObj);
}
</script>

<style scoped>
.lat_container {
  width: 100%;
  height: 100%;
}

.lat_number {
  width: 100%;
  height: 100%;
  padding: 0 8px;
  color: #333;
  font-size: 1rem;
  background-color: transparent;
  border: none;
  outline: none;
}

.lat_number::placeholder {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: flex-start;
  padding: 0;
  color: #444;
  font-size: 0.875rem;
}

.lat_human {
  width: calc(100% - 1.5rem);
  height: 100%;
  padding: 0 8px;
  color: #333;
  font-size: 1rem;
  background-color: transparent;
  border: none;
  outline: none;
}

.lat_human::placeholder {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: flex-start;
  padding: 0;
  color: #444;
  font-size: 0.875rem;
}

.lat_label {
  width: 1.5rem;
  height: 100%;
  color: #333;
  font-size: 1rem;
  cursor: pointer;
}

.lat_dms {
  width: calc(33.3333% - 1.5rem);
  height: 100%;
  color: #333;
  font-size: 1rem;
  text-align: right;
  border: none;
  outline: none;
}

.lat_unit {
  width: 1rem;
  height: 100%;
  color: #333;
  font-size: 1rem;
  cursor: pointer;
}

.slider_wrapper {
  width: 100%;
  height: 100%;
}

.lat_range_input {
  width: 100%;
  height: 1rem;
  margin-bottom: 0.25rem;
  border-radius: 0.25rem;
  appearance: auto;
  accent-color: rgb(26 32 44 / 70%);
}

/* .lat_range_input::-webkit-slider-runnable-track {
  height: 1rem;
  border-radius: 0.25rem;
  background: #bbbbbb;
  box-shadow: 0 1px 1px #def3f8, inset 0 0.125em 0.125em #0d1112;
}

.lat_range_input::-webkit-slider-container {
  height: 1rem;
  overflow: hidden;
}

.lat_range_input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  height: 1rem;
  width: 1rem;
  border-radius: 50%;
  margin-top: 0rem;
  background-color: #f44336;
  border: 1px solid transparent;
  box-shadow: 0 0.125em 0.125em #3b4547; 
  border-image: linear-gradient(#f44336, #f44336) 0 fill / 8 20 8 0 / 0px 0px 0 2000px;
}

.lat_range_input:focus {
  outline: none;
} */

.lat_range_label {
  width: 100%;
  height: 1rem;
  padding-left: 0.25rem;
  color: rgb(26 32 44 / 70%);
  font-weight: 400;
  font-size: 0.75rem;
  font-family: "Source Han Sans CN";
}
</style>
