<template>
  <div :id="id" class="col_nw_fs_fs panel_container">
    <div class="panel_mask" @click="colseHandle"></div>
    <div class="panel_dbox">
      <div class="row_nw_fs_center close_icon" @click="colseHandle">X</div>
      <div class="row_nw_fs_center title_box">请编辑属性</div>

      <div class="col_nw_fs_fs panel_wraper">
        <div class="row_nw_fs_center info_box">
          <div class="row_nw_fs_center info_box_label">图形ID</div>
          <div class="row_nw_fs_center info_box_value">{{ vNodeData.data.id }}</div>
        </div>

        <div class="line_gap"></div>

        <div class="row_nw_fs_center name_box">
          <div class="row_nw_fs_center name_box_label">文本</div>
          <input
            v-model="state.style.text.text"
            class="row_nw_fs_center name_box_input"
            type="text"
            placeholder="文本"
            @input="updateHandle"
          />
        </div>
        <!-- 字体大小 -->
        <div class="row_nw_fs_center name_box">
          <div class="row_nw_fs_center name_box_label">字体大小</div>
          <input
            v-model="state.style.text.fontSize"
            class="row_nw_fs_center fs_input"
            type="number"
            placeholder="字体大小"
            @input="updateHandle"
          />
          <div class="row_nw_center_center fs_label">PX</div>
        </div>
        <div class="row_nw_fs_center name_box">
          <div class="row_nw_fs_center name_box_label">旋转</div>
          <input
            v-model="state.style.text.rotation"
            class="row_nw_fs_center fs_input"
            type="number"
            placeholder="旋转度数"
            @input="updateHandle"
          />
          <div class="row_nw_center_center fs_label">&nbsp;度</div>
        </div>
        <div class="row_nw_fs_center name_box">
          <div class="row_nw_fs_center name_box_label">偏移量</div>
          <input
            v-model="state.style.text.offsetX"
            class="row_nw_fs_center dash_input"
            type="number"
            placeholder="X轴"
            @input="updateHandle"
          />
          <input
            v-model="state.style.text.offsetY"
            class="row_nw_fs_center dash_input"
            type="number"
            placeholder="Y轴"
            @input="updateHandle"
          />
          <div class="row_nw_center_center fs_label">PX</div>
        </div>
        <div class="row_nw_fs_center name_box">
          <div class="row_nw_fs_center name_box_label">填充大小</div>
          <input
            v-model="state.style.text.padding[0]"
            class="row_nw_fs_center pad_input"
            type="number"
            placeholder="上"
            @input="updateHandle"
          />
          <input
            v-model="state.style.text.padding[1]"
            class="row_nw_fs_center pad_input"
            type="number"
            placeholder="右"
            @input="updateHandle"
          />
          <input
            v-model="state.style.text.padding[2]"
            class="row_nw_fs_center pad_input"
            type="number"
            placeholder="下"
            @input="updateHandle"
          />
          <input
            v-model="state.style.text.padding[3]"
            class="row_nw_fs_center pad_input"
            type="number"
            placeholder="左"
            @input="updateHandle"
          />
          <div class="row_nw_center_center fs_label">PX</div>
        </div>

        <div class="row_nw_fs_center baseline_box">
          <RadioSingleInput
            :titleLabel="'基准'"
            :radioOptions="testBaselineOptions"
            :initValue="state.style.text.textBaseline"
            :isRefresh="geoRefresh"
            @onInput="onTextBaselineChange"
          />
        </div>

        <div class="row_nw_fs_center name_box">
          <div class="row_nw_fs_center name_box_label">图形线色</div>
          <ColorPicker v-model:pureColor="state.style.text.color" format="rgb" @pureColorChange="updateHandle" />
        </div>
        <div class="row_nw_fs_center name_box">
          <div class="row_nw_fs_center name_box_label">图形填充</div>
          <ColorPicker v-model:pureColor="state.style.text.fillColor" format="rgb" @pureColorChange="updateHandle" />
        </div>

        <div class="line_gap"></div>
      </div>
      <div class="row_nw_center_center action_box">
        <div class="row_nw_center_center info_del" @click="cancelHandle">取消</div>
        <div class="row_nw_center_center info_confirm" @click="confirmHandle">完成</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
//@ts-nocheck
import { nanoid } from "nanoid";
import { reactive, onMounted, ref } from "vue";
import { ColorPicker } from "vue3-colorpicker";
import "vue3-colorpicker/style.css";

import RadioSingleInput from "./components/RadioSingleInput.vue";

import lodash from "lodash";

import {
  drawNormalStyleOptions,
  drawTextStyleOptions,
  segmentStyleOptions,
  labelStyleOptions,
  lnglatStyleOptions,
} from "../ol/style";

// pattern icons
const testBaselineOptions = {
  name: "testBaselineOptions",
  options: [
    { id: "bottom", value: "bottom", title: "bottom" },
    { id: "top", value: "top", title: "top" },
    { id: "middle", value: "middle", title: "middle" },
    { id: "alphabetic", value: "alphabetic", title: "alphabetic" },
    { id: "hanging", value: "hanging", title: "hanging" },
    { id: "ideographic", value: "ideographic", title: "ideographic" },
  ],
};

const props = defineProps({
  id: {
    type: String,
    default: "dc001",
  },
  customT: {
    type: Function,
    default: (name: string) => name,
  },
  destory: {
    type: Function,
    default: () => {},
  },
  vNodeData: {
    type: Object,
    default() {
      return {};
    },
  },
});

onMounted(() => {
  // console.log("mounted", props.vNodeData);
  init();
});

const state = reactive({
  name: "",
  style: {
    geo: { ...drawNormalStyleOptions() },
    vertex: { ...lnglatStyleOptions },
    line: { ...segmentStyleOptions },
    label: { ...labelStyleOptions },
    text: { ...drawTextStyleOptions() },
  },
  attributes: {
    properties: [],
    keyValues: [],
    json: "",
  },
  isNotValidJson: false,
});

const geoRefresh = ref(0);

let oldState = {
  name: "",
  style: {
    geo: { ...drawNormalStyleOptions() },
    vertex: { ...lnglatStyleOptions },
    line: { ...segmentStyleOptions },
    label: { ...labelStyleOptions },
    text: { ...drawTextStyleOptions() },
  },
  attributes: {
    properties: [],
    keyValues: [],
    json: "",
  },
};

let propsCnt = 0;
function init() {
  if (props.vNodeData && props.vNodeData.data) {
    const data = props.vNodeData.data;
    if (data.geojson) {
      const geojsonData = data.geojson;
      if (geojsonData.properties) {
        const propsData = geojsonData.properties;
        // 设置属性
        // 设置样式
        if (propsData.style) {
          const styleData = propsData.style;
          if (styleData.geo) {
            state.style.geo = { ...styleData.geo };
            oldState.style.geo = { ...styleData.geo };
            geoRefresh.value = geoRefresh.value + 1;
          }
          if (styleData.vertex) {
            state.style.vertex = { ...styleData.vertex };
            oldState.style.vertex = { ...styleData.vertex };
          }
          if (styleData.line) {
            state.style.line = { ...styleData.line };
            oldState.style.line = { ...styleData.line };
          }
          if (styleData.label) {
            state.style.label = { ...styleData.label };
            oldState.style.label = { ...styleData.label };
          }

          if (styleData.text) {
            state.style.text = { ...styleData.text };
            oldState.style.text = { ...styleData.text };
          }
        }
      }
    }
  }
}

function onTextBaselineChange(baseline: string) {
  if (state.style && state.style.text) {
    state.style.text.textBaseline = baseline;
    updateHandle();
  }
}

function getGeoProps() {
  const geoProps = {
    name: state.style.text.text,
    attributes: {
      properties: [],
      keyValues: [],
      json: {},
    },
    style: lodash.cloneDeep(state.style),
  };
  return geoProps;
}

const colseHandle = () => {
  props && props!.vNodeData.cancelCb(oldState);
};

const cancelHandle = () => {
  props && props!.vNodeData.cancelCb(oldState);
};

const updateHandle = () => {
  props && props!.vNodeData.updateCb(state);
};

const confirmHandle = () => {
  const geoProps = getGeoProps();
  props && props!.vNodeData.confirmCb(geoProps);
};
</script>

<style lang="scss" scoped>
.panel_container {
  position: absolute;
  z-index: 99999;
  width: 100vw;
  height: 100vh;
}

.panel_mask {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgb(0 0 0 / 0%);
}

.panel_dbox {
  position: absolute;
  top: 60px;
  right: 32px;
  z-index: 99999;
  width: 460px;
  height: auto;
  max-height: 920px;
  background: rgb(0 13 33 / 75%);
  border: 1px solid #f70;
  border-radius: 0.25rem;
}

.panel_wraper {
  width: 100%;
  height: auto;
  max-height: 775px;
  overflow: hidden;
  overflow-y: scroll;
}

.panel_wraper::-webkit-scrollbar {
  display: none;
  width: 0;
}

.title_box {
  width: 100%;
  height: 3rem;
  margin-top: 1rem;
  margin-left: 2%;
  color: rgb(255 255 255 / 100%);
  font-weight: bold;
  font-size: 18px;
}

.close_icon {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1rem;
  height: 1rem;
  color: rgb(255 255 255 / 100%);
  font-size: 1rem;
  cursor: pointer;
}

.info_box {
  width: 96%;
  height: 32px;
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
  margin-left: 2%;
}

.info_box_label {
  width: 80px;
  height: 32px;
  margin-top: 8px;
  margin-bottom: 8px;
  color: #f0f1f5;
}

.info_box_value {
  width: 338px;
  height: 32px;
  margin-top: 8px;
  margin-bottom: 8px;
  margin-left: 2px;
  color: #f0f1f5;
}

.name_box {
  width: 96%;
  height: 32px;
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
  margin-left: 2%;
}

.name_box_label {
  width: 80px;
  height: 32px;
  margin-top: 8px;
  margin-bottom: 8px;
  color: #f0f1f5;
}

.name_box_input {
  width: 338px;
  height: 32px;
  margin-right: 4px;
  padding: 0 8px;
  color: #f0f1f5;
  font-size: 1rem;
  line-height: 32px;
  background-color: transparent;
  border: 1px solid #94a7c0;
  border-radius: 4px;
}

.name_box_input::placeholder {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: flex-start;
  padding: 0;
  color: #94a7c0;
  font-size: 1rem;
  line-height: 32px;
}

.dash_input {
  width: 148px;
  height: 32px;
  margin-right: 4px;
  padding: 0 8px;
  color: #f0f1f5;
  font-size: 1rem;
  line-height: 32px;
  background-color: transparent;
  border: 1px solid #94a7c0;
  border-radius: 4px;
}

.dash_input::placeholder {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: flex-start;
  padding: 0;
  color: #94a7c0;
  font-size: 1rem;
  line-height: 32px;
}

.fs_input {
  width: 300px;
  height: 32px;
  margin-right: 4px;
  padding: 0 8px;
  color: #f0f1f5;
  font-size: 1rem;
  line-height: 32px;
  background-color: transparent;
  border: 1px solid #94a7c0;
  border-radius: 4px;
}

.fs_input::placeholder {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: flex-start;
  padding: 0;
  color: #94a7c0;
  font-size: 1rem;
  line-height: 32px;
}

.fs_label {
  width: 38px;
  height: 100%;
  color: #f0f1f5;
}

.pad_input {
  width: 72px;
  height: 32px;
  margin-right: 4px;
  padding: 0 8px;
  color: #f0f1f5;
  font-size: 1rem;
  line-height: 32px;
  background-color: transparent;
  border: 1px solid #94a7c0;
  border-radius: 4px;
}

.baseline_box {
  width: 100%;
  height: auto;
  margin: 8px 0 12px;
}

.pad_input::placeholder {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: flex-start;
  padding: 0;
  color: #94a7c0;
  font-size: 1rem;
  line-height: 32px;
}

.line_gap {
  width: 92%;
  margin: 12px 0 12px 4%;
  border-bottom: 1px solid rgb(255 255 255 / 25%);
}

.action_box {
  width: 100%;
  height: 2rem;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
}

.info_del {
  width: 120px;
  height: 2rem;
  margin-right: 1rem;
  color: rgb(255 41 41 / 85%);
  font-weight: 400;
  font-size: 1rem;
  font-family: "Source Han Sans CN";
  border: 1px solid rgb(255 41 41 / 85%);
  border-radius: 0.25rem;
  cursor: pointer;
}

.info_del:hover {
  color: rgb(255 255 255 / 100%);
  background-color: rgb(255 41 41 / 85%);
}

.info_confirm {
  width: 120px;
  height: 2rem;
  color: rgb(255 255 255 / 85%);
  font-weight: 400;
  font-size: 1rem;
  font-family: "Source Han Sans CN";
  border: 1px solid rgb(14 105 241);
  border-radius: 0.25rem;
  cursor: pointer;
}

.info_confirm:hover {
  background-color: rgb(14 105 241);
}
</style>
