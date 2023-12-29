<template>
  <!-- 经度基本输入组件 -->
  <div class="row_nw_fs_center lng_container" @wheel="mouseWheelHandle">
    <input
      v-if="inputMode === 'DEFAULT'"
      v-model="lngObj.longitudeText"
      class="row_nw_fs_center lng_number"
      type="text"
      @input="DefInputHandle"
      @blur="DefBlurHandle"
    />
    <div v-else-if="inputMode === 'HUMAN'" class="row_nw_fs_center wh_100p_100p">
      <input
        v-model="lngObj.longitudeAbsText"
        class="row_nw_fs_center lng_human"
        type="text"
        @input="humanInputHandle"
        @blur="humanBlurHandle"
      />
      <span class="row_nw_fe_center lng_label" @click="weHumanHandle">{{ lngObj.isWest ? "W" : "E" }}</span>
    </div>
    <div v-else-if="inputMode === 'DMS'" class="row_nw_fs_center wh_100p_100p">
      <span class="row_nw_fs_center lng_label" @click="weDmsHandle">{{ lngObj.isWest ? "W:" : "E:" }}</span>
      <input
        v-model="lngObj.degrees"
        class="row_nw_fe_center lng_dms"
        type="text"
        @input="degreeInputHandle"
        @blur="dmsBlurHandle"
      />
      <span class="row_nw_center_center lng_unit">°</span>
      <input
        v-model="lngObj.minutes"
        class="row_nw_fe_center lng_dms"
        type="text"
        @input="minutesInputHandle"
        @blur="dmsBlurHandle"
      />
      <span class="row_nw_center_center lng_unit">′</span>
      <input
        v-model="lngObj.seconds"
        class="row_nw_fe_center lng_dms"
        type="text"
        @input="secondsInputHandle"
        @blur="dmsBlurHandle"
      />
      <span class="row_nw_center_center lng_unit">″</span>
    </div>
    <div v-else-if="inputMode === 'SLIDER'" class="col_nw_center_center slider_wrapper" @click.stop>
      <input
        v-model="lngObj.longitude"
        type="range"
        min="-180"
        max="180"
        class="lng_range_input"
        step="0.000001"
        @change="sliderHandle"
      />
      <label for="range" class="row_nw_center_center lng_range_label">{{ lngObj.longitude }}</label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, computed, watch } from "vue";

const props = defineProps({
  longitude: {
    type: Number,
    default: 0,
  },
  mode: {
    type: String,
    default: "default",
  },
});

const modes = ["DEFAULT", "HUMAN", "DMS", "SLIDER"];
const emit = defineEmits(["update:longitude", "update:mode", "onChange"]);

const lngObj = reactive({
  longitude: 0,
  longitudeText: "0",
  longitudeAbsText: "0",
  longitudeHuman: "0W",
  degrees: "0",
  minutes: "0",
  seconds: "0",
  isWest: true,
});

// const labelObj = reactive({
//   ew: "W",
//   degrees: "°",
//   minutes: "′",
//   seconds: "″",
// });

function initLngObj(longitude: number) {
  if (longitude < -180 || longitude > 180) {
    longitude = 0;
  }
  lngObj.longitude = longitude;
  lngObj.longitudeText = "" + lngObj.longitude;
  if (lngObj.longitude <= 0) {
    lngObj.isWest = true;
  } else {
    lngObj.isWest = false;
  }

  lngObj.longitudeAbsText = "" + Math.abs(lngObj.longitude);
  lngObj.longitudeHuman = lngObj.longitudeAbsText + (lngObj.isWest ? "W" : "E");

  let dms = longitudeToDms(lngObj.longitudeText);
  lngObj.degrees = "" + dms.degrees;
  lngObj.minutes = "" + dms.minutes;
  lngObj.seconds = "" + dms.seconds;
}

/**
 * @description 用watch 来更新父传给子的数据
 */
watch(
  () => props.longitude,
  () => {
    initLngObj(props.longitude);
  },
  {
    immediate: true,
    deep: true,
  },
);

// const inputMode = computed({
//   get() {
//     return props.mode;
//   },
//   set(value) {
//     emit("update:mode", value);
//   },
// });
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
function validateLongitude(longitude: string) {
  // const lngRegex = /^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))$/;
  // const lngRegex = /^(\+|-)?((1?[0-7]?[0-9]?)(([.][0-9]{1,6})?)|180(([.][0]{1,6})?))$/;
  // const lngRegex = /^[+-]?(0?d{1,2}.d{1,6}|1[0-7]?d{1}.d{1,6}|180.0{1,6})$/;
  // const lngRegex = /^[\-\+]?(0(\.\d{1,10})?|([1-9](\d)?)(\.\d{1,10})?|1[0-7]\d{1}(\.\d{1,10})?|180\.0{1,10})$/

  const lngRegex = /^(\+|\-)?((1?[0-7]?[0-9]?)(\.?)(([0-9]{1,6})?)|180(\.?)(([0]{1,6})?))$/;
  if (longitude === "") {
    return "";
  } else {
    if (lngRegex.test(longitude)) {
      let longitudeTemp = parseFloat(longitude);
      longitudeTemp = Math.abs(longitudeTemp);
      if (longitudeTemp > 180) {
        if (longitude[0] === "-") {
          return "-180";
        } else if (longitude[0] === "+") {
          return "+180";
        } else {
          return "180";
        }
      }
      return longitude;
    } else {
      let longitudeTemp = parseFloat(longitude);

      if (isNaN(longitudeTemp)) {
        return "";
      } else {
        longitudeTemp = Math.abs(longitudeTemp);
        if (longitudeTemp == 180 && longitude.includes("180.000000")) {
          const pointIndex = longitude.indexOf(".");
          return longitude.substring(0, pointIndex + 7);
        } else if (longitudeTemp > 180) {
          longitudeTemp = 180;
        }

        let longitudeStr = "" + longitudeTemp;
        const pointIndex = longitudeStr.indexOf(".");
        let decimalLength = 0;
        if (pointIndex !== -1) {
          decimalLength = longitudeStr.length - pointIndex - 1;
        }
        if (decimalLength > 6) {
          longitudeStr = longitudeStr.substring(0, pointIndex + 7);
        }

        if (longitude[0] === "-") {
          return "-" + longitudeStr;
        } else if (longitude[0] === "+") {
          return "+" + longitudeStr;
        } else {
          return longitudeStr;
        }
      }
    }
  }
}

function longitudeToDms(longitude: string | number) {
  if (longitude) {
    if (typeof longitude === "string") {
      longitude = parseFloat(longitude);
    }
    if (typeof longitude === "number") {
      let degrees = parseInt(longitude);
      let minutes = parseInt((longitude - degrees) * 60);
      let seconds = parseInt((longitude - degrees) * 3600 - minutes * 60);
      const isWest = longitude < 0 ? true : false;
      return {
        degrees: Math.abs(degrees),
        minutes: Math.abs(minutes),
        seconds: Math.abs(seconds),
        isWest,
      };
    }
  }
  return {
    degrees: 0,
    minutes: 0,
    seconds: 0,
  };
}

function dmsToLongitude(degrees: string | number, minutes: string | number, seconds: string | number, isWest: boolean) {
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

  let longitude = degrees + minutes / 60 + seconds / 3600;
  if (isWest) {
    longitude = -longitude;
  }

  return longitude;
}

function DefInputHandle() {
  lngObj.longitudeText = validateLongitude(lngObj.longitudeText);
}

function DefBlurHandle() {
  lngObj.longitudeText = validateLongitude(lngObj.longitudeText);
  lngObj.longitude = parseFloat(lngObj.longitudeText);
  if (lngObj.longitude < 0) {
    lngObj.isWest = true;
  } else {
    lngObj.isWest = false;
  }

  lngObj.longitudeAbsText = "" + Math.abs(lngObj.longitude);
  lngObj.longitudeHuman = lngObj.longitudeAbsText + (lngObj.isWest ? "W" : "E");

  let dms = longitudeToDms(lngObj.longitudeText);
  lngObj.degrees = "" + dms.degrees;
  lngObj.minutes = "" + dms.minutes;
  lngObj.seconds = "" + dms.seconds;
  // 发送信息
  emit("update:longitude", lngObj.longitude);
  emit("onChange", lngObj);
  console.log("DefBlurHandle", lngObj);
}

function validateAbsLongitude(longitude: string) {
  const lngRegex = /^((1?[0-7]?[0-9]?)(\.?)(([0-9]{1,6})?)|180(\.?)(([0]{1,6})?))$/;
  if (longitude === "") {
    return "";
  } else {
    if (lngRegex.test(longitude)) {
      let longitudeTemp = parseFloat(longitude);
      if (longitudeTemp > 180) {
        return "180";
      }
      return longitude;
    } else {
      let longitudeTemp = parseFloat(longitude);

      if (isNaN(longitudeTemp)) {
        return "";
      } else {
        if (longitudeTemp == 180 && longitude.includes("180.000000")) {
          const pointIndex = longitude.indexOf(".");
          return longitude.substring(0, pointIndex + 7);
        } else if (longitudeTemp > 180) {
          longitudeTemp = 180;
        }

        let longitudeStr = "" + longitudeTemp;
        const pointIndex = longitudeStr.indexOf(".");
        let decimalLength = 0;
        if (pointIndex !== -1) {
          decimalLength = longitudeStr.length - pointIndex - 1;
        }
        if (decimalLength > 6) {
          longitudeStr = longitudeStr.substring(0, pointIndex + 7);
        }

        return longitudeStr;
      }
    }
  }
}

function humanInputHandle() {
  lngObj.longitudeAbsText = validateAbsLongitude(lngObj.longitudeAbsText);
}

function humanBlurHandle() {
  lngObj.longitudeAbsText = validateAbsLongitude(lngObj.longitudeAbsText);
  lngObj.longitude = parseFloat(lngObj.longitudeAbsText);
  if (lngObj.isWest) {
    lngObj.longitude = -lngObj.longitude;
    lngObj.longitudeText = "-" + lngObj.longitudeAbsText;
  }

  lngObj.longitudeHuman = lngObj.longitudeAbsText + (lngObj.isWest ? "W" : "E");

  let dms = longitudeToDms(lngObj.longitudeAbsText);
  lngObj.degrees = "" + dms.degrees;
  lngObj.minutes = "" + dms.minutes;
  lngObj.seconds = "" + dms.seconds;
  // 发送信息
  emit("update:longitude", lngObj.longitude);
  emit("onChange", lngObj);
  console.log("humanBlurHandle", lngObj);
}

function weHumanHandle() {
  lngObj.isWest = !lngObj.isWest;
  humanBlurHandle();
}

function validateDegrees(degrees: string) {
  const degreesRegex = /^\d{3}$/;
  if (degrees === "") {
    return "";
  } else {
    let degreesTemp = parseFloat(degrees);
    if (degreesRegex.test(degrees)) {
      if (degreesTemp >= 180) {
        return "180";
      }
      return degrees;
    } else {
      if (isNaN(degreesTemp)) {
        return "";
      } else {
        if (degreesTemp >= 180) {
          degreesTemp = 180;
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
  lngObj.degrees = validateDegrees(lngObj.degrees);
}

function minutesInputHandle() {
  lngObj.minutes = validateMinutesSeconds(lngObj.minutes);
  if (lngObj.degrees && lngObj.degrees == "180") {
    lngObj.minutes = "0";
  }
}

function secondsInputHandle() {
  lngObj.seconds = validateMinutesSeconds(lngObj.seconds);
  if (lngObj.degrees && lngObj.degrees == "180") {
    lngObj.seconds = "0";
  }
}

function dmsBlurHandle() {
  let longitude = dmsToLongitude(lngObj.degrees, lngObj.minutes, lngObj.seconds, lngObj.isWest);

  lngObj.longitude = longitude;
  lngObj.longitudeText = "" + longitude;
  let longitudeAbs = Math.abs(longitude);

  lngObj.longitudeAbsText = "" + longitudeAbs;
  lngObj.longitudeHuman = lngObj.longitudeAbsText + (lngObj.isWest ? "W" : "E");

  // 发送信息
  emit("update:longitude", lngObj.longitude);
  emit("onChange", lngObj);
  console.log("dmsBlurHandle", lngObj);
}

function weDmsHandle() {
  lngObj.isWest = !lngObj.isWest;
  dmsBlurHandle();
}

function sliderHandle() {
  initLngObj(lngObj.longitude);
  // 发送信息
  emit("update:longitude", lngObj.longitude);
  emit("onChange", lngObj);
  console.log("sliderHandle", lngObj);
}

function validateLatitude(latitude: string) {
  const latRegex = /^(\+|-)?(?:90(?:(?:\.0{1,15})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,15})?))$/;
}
</script>

<style scoped>
.lng_container {
  width: 100%;
  height: 100%;
}

.lng_number {
  width: 100%;
  height: 100%;
  padding: 0 8px;
  color: #333;
  font-size: 1rem;
  background-color: transparent;
  border: none;
  outline: none;
}

.lng_number::placeholder {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: flex-start;
  padding: 0;
  color: #444;
  font-size: 0.875rem;
}

.lng_human {
  width: calc(100% - 1.5rem);
  height: 100%;
  padding: 0 8px;
  color: #333;
  font-size: 1rem;
  background-color: transparent;
  border: none;
  outline: none;
}

.lng_human::placeholder {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: flex-start;
  padding: 0;
  color: #444;
  font-size: 0.875rem;
}

.lng_label {
  width: 1.5rem;
  height: 100%;
  color: #333;
  font-size: 1rem;
  cursor: pointer;
}

.lng_dms {
  width: calc(33.33333% - 1.5rem);
  height: 100%;
  color: #333;
  font-size: 1rem;
  text-align: right;
  border: none;
  outline: none;
}

.lng_unit {
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

.lng_range_input {
  width: 100%;
  height: 1rem;
  margin-bottom: 0.25rem;
  border-radius: 0.25rem;
  appearance: auto;
  accent-color: rgb(26 32 44 / 70%);
}

/* .lng_range_input::-webkit-slider-runnable-track {
  height: 1rem;
  border-radius: 0.25rem;
  background: #bbbbbb;
  box-shadow: 0 1px 1px #def3f8, inset 0 0.125em 0.125em #0d1112;
}

.lng_range_input::-webkit-slider-container {
  height: 1rem;
  overflow: hidden;
}

.lng_range_input::-webkit-slider-thumb {
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

.lng_range_input:focus {
  outline: none;
} */

.lng_range_label {
  width: 100%;
  height: 1rem;
  padding-left: 0.25rem;
  color: rgb(26 32 44 / 70%);
  font-weight: 400;
  font-size: 0.75rem;
  font-family: "Source Han Sans CN";
}
</style>
