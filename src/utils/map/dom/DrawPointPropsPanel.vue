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
        <div class="row_nw_fs_center name_box">
          <div class="row_nw_fs_center name_box_label">名称</div>
          <input v-model="state.name" class="row_nw_fs_center name_box_input" type="text" placeholder="名称" />
        </div>
        <div class="line_gap"></div>
        <div class="row_nw_fs_center">
          <RadioSingleInput
            :initValue="state.style.geo.iconPattern"
            :isRefresh="geoRefresh"
            @onInput="onPatternTypeChange"
          />
        </div>

        <div v-if="state.style.geo.iconPattern == 'pattern'" class="col_nw_fs_fs pattern_box">
          <RadioSingleInput
            :titleLabel="'图案'"
            :radioOptions="patternOptions"
            :initValue="state.style.geo.iconUrl"
            :isRefresh="geoRefresh"
            @onInput="onPatternIconChange"
          />
        </div>
        <div v-else class="row_nw_fs_center pattern_box">
          <RadioImageInput
            :titleLabel="'Icons'"
            :radioOptions="imageIconsOptions"
            :initValue="state.style.geo.iconUrl"
            :isRefresh="geoRefresh"
            @onInput="onPatternIconUrlChange"
          />
        </div>

        <!-- 线宽等 -->
        <div class="row_nw_fs_center name_box">
          <div class="row_nw_fs_center name_box_label">图形线宽</div>
          <input
            v-model="state.style.geo.width"
            class="row_nw_fs_center name_box_input"
            type="number"
            placeholder="名称"
            @blur="updateHandle"
          />
        </div>
        <div class="row_nw_fs_center name_box">
          <div class="row_nw_fs_center name_box_label">图形虚线</div>
          <input
            v-model="state.style.geo.lineDash[0]"
            class="row_nw_fs_center dash_input"
            type="number"
            placeholder="虚线长度"
            @blur="updateHandle"
          />
          <input
            v-model="state.style.geo.lineDash[1]"
            class="row_nw_fs_center dash_input"
            type="number"
            placeholder="虚线间隔"
            @blur="updateHandle"
          />
          <div class="row_nw_center_center fs_label">PX</div>
        </div>
        <div class="row_nw_fs_center name_box">
          <div class="row_nw_fs_center name_box_label">图形宽高</div>
          <input
            v-model="state.style.geo.iconWidth"
            class="row_nw_fs_center dash_input"
            type="number"
            placeholder="宽度"
            @blur="updateHandle"
          />
          <input
            v-model="state.style.geo.iconHeight"
            class="row_nw_fs_center dash_input"
            type="number"
            placeholder="高度"
            @blur="updateHandle"
          />
          <div class="row_nw_center_center fs_label">PX</div>
        </div>
        <div class="row_nw_fs_center name_box">
          <div class="row_nw_fs_center name_box_label">箭头偏移</div>
          <input
            v-model="state.style.geo.iconOffset[0]"
            class="row_nw_fs_center dash_input"
            type="number"
            placeholder="offsetX"
            @blur="updateHandle"
          />
          <input
            v-model="state.style.geo.iconOffset[1]"
            class="row_nw_fs_center dash_input"
            type="number"
            placeholder="offsetY"
            @blur="updateHandle"
          />
          <div class="row_nw_center_center fs_label">PX</div>
        </div>
        <div class="row_nw_fs_center name_box">
          <div class="row_nw_fs_center name_box_label">箭头锚点</div>
          <input
            v-model="state.style.geo.iconAnchor[0]"
            class="row_nw_fs_center dash_input"
            type="number"
            min="0"
            max="1"
            step="0.01"
            placeholder="anchorX"
            @blur="updateHandle"
          />
          <input
            v-model="state.style.geo.iconAnchor[1]"
            class="row_nw_fs_center dash_input"
            type="number"
            min="0"
            max="1"
            step="0.01"
            placeholder="anchorY"
            @blur="updateHandle"
          />
          <div class="row_nw_center_center fs_label">&nbsp;分</div>
        </div>
        <div class="row_nw_fs_center name_box">
          <div class="row_nw_fs_center name_box_label">图形线色</div>
          <ColorPicker v-model:pureColor="state.style.geo.color" format="rgb" @pureColorChange="updateHandle" />
        </div>
        <div class="row_nw_fs_center name_box">
          <div class="row_nw_fs_center name_box_label">图形填充</div>
          <ColorPicker v-model:pureColor="state.style.geo.fillColor" format="rgb" @pureColorChange="updateHandle" />
        </div>

        <!-- 顶点 即经纬度的显示 -->
        <div class="row_nw_fs_center name_box">
          <div class="row_nw_fs_center name_box_label">顶点文字</div>
          <input
            v-model="state.style.vertex.fontSize"
            class="row_nw_fs_center fs_input"
            type="number"
            placeholder="顶点文字大小,单位PX"
            @blur="updateHandle"
          />
          <div class="row_nw_center_center fs_label">PX</div>
        </div>
        <div class="row_nw_fs_center name_box">
          <div class="row_nw_fs_center name_box_label">顶点颜色</div>
          <ColorPicker v-model:pureColor="state.style.vertex.color" format="rgb" @pureColorChange="updateHandle" />
        </div>
        <div class="row_nw_fs_center name_box">
          <div class="row_nw_fs_center name_box_label">顶点填充</div>
          <ColorPicker v-model:pureColor="state.style.vertex.fillColor" format="rgb" @pureColorChange="updateHandle" />
        </div>

        <div class="line_gap"></div>

        <div class="col_nw_fs_center pros_box">
          <div v-for="(item, index) in state.attributes.properties" :key="item.id" class="col_nw_fs_fs pros_inbox">
            <NameValueUnit
              :label="item.label"
              :isShowDescribe="item.isShowDescribe"
              :initValue="item.values"
              @onBlur="(values) => onPropsBlur(index, values)"
            />
            <div class="row_nw_fe_center props_action_box">
              <div class="row_nw_center_center props_minus" @click="minusProps(index)">-</div>
              <div class="row_nw_center_center props_add" @click="addProps(index)">+</div>
            </div>
          </div>
        </div>

        <div class="line_gap"></div>

        <div class="col_nw_fs_center pros_box">
          <div v-for="(item, index) in state.attributes.keyValues" :key="item.id" class="col_nw_fs_fs pros_inbox">
            <NameValues
              :label="item.label"
              :initValue="item.values"
              @onBlur="(values) => onKeyValuesBlur(index, values)"
            />
            <div class="row_nw_fe_center props_action_box">
              <div class="row_nw_center_center props_minus" @click="minusKeyValues(index)">-</div>
              <div class="row_nw_center_center props_add" @click="addKeyValues(index)">+</div>
            </div>
          </div>
        </div>

        <div class="line_gap"></div>
        <div class="row_nw_fs_center prop_json_box">
          <div class="row_nw_fs_fs prop_json_label">JSON</div>
          <textarea
            v-model="state.attributes.json"
            class="row_nw_fs_center prop_text_cls"
            :class="{ prop_text_err_cls: state.isNotValidJson }"
            placeholder="JSON字符串"
            @blur="onJsonInput"
          ></textarea>
        </div>
        <div v-if="state.isNotValidJson" class="prop_text_err_tips">JSON 字符串有误，请检查</div>
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

import NameValueUnit from "./components/NameValueUnit.vue";
import NameValues from "./components/NameValues.vue";
import RadioSingleInput from "./components/RadioSingleInput.vue";
import RadioImageInput from "./components/RadioImageInput.vue";

import lodash from "lodash";

import {
  drawNormalStyleOptions,
  drawTextStyleOptions,
  segmentStyleOptions,
  labelStyleOptions,
  lnglatStyleOptions,
} from "../ol/style";

import airborne from "@/utils/map/assets/icons/geo/airborne.svg";
import bioregions from "@/utils/map/assets/icons/geo/bioregions.svg";
import biota from "@/utils/map/assets/icons/geo/biota.svg";
import cadastre from "@/utils/map/assets/icons/geo/cadastre.svg";
import coins from "@/utils/map/assets/icons/geo/coins.svg";

import conservation from "@/utils/map/assets/icons/geo/conservation.svg";
import coordinates from "@/utils/map/assets/icons/geo/coordinates.svg";
import earth from "@/utils/map/assets/icons/geo/earth.svg";
import elevation from "@/utils/map/assets/icons/geo/elevation.svg";
import energy from "@/utils/map/assets/icons/geo/energy.svg";

import environment from "@/utils/map/assets/icons/geo/environment.svg";
import flag from "@/utils/map/assets/icons/geo/flag.svg";
import geocat from "@/utils/map/assets/icons/geo/geocat.svg";
import geology from "@/utils/map/assets/icons/geo/geology.svg";
import geonames from "@/utils/map/assets/icons/geo/geonames.svg";

import geonetwork from "@/utils/map/assets/icons/geo/geonetwork.svg";
import health from "@/utils/map/assets/icons/geo/health.svg";
import inlandwaters from "@/utils/map/assets/icons/geo/inlandwaters.svg";
import landcover from "@/utils/map/assets/icons/geo/landcover.svg";
import location from "@/utils/map/assets/icons/geo/location.svg";

import military from "@/utils/map/assets/icons/geo/military.svg";
import oceans from "@/utils/map/assets/icons/geo/oceans.svg";
import passengers from "@/utils/map/assets/icons/geo/passengers.svg";
import restricted from "@/utils/map/assets/icons/geo/restricted.svg";
import society from "@/utils/map/assets/icons/geo/society.svg";

import structure from "@/utils/map/assets/icons/geo/structure.svg";
import tractor from "@/utils/map/assets/icons/geo/tractor.svg";
import transportation from "@/utils/map/assets/icons/geo/transportation.svg";
import utilities from "@/utils/map/assets/icons/geo/utilities.svg";
import water from "@/utils/map/assets/icons/geo/water.svg";
import weather from "@/utils/map/assets/icons/geo/weather.svg";

const imageIcons = {
  airborne,
  bioregions,
  biota,
  cadastre,
  coins,

  conservation,
  coordinates,
  earth,
  elevation,
  energy,

  environment,
  flag,
  geocat,
  geology,
  geonames,

  geonetwork,
  health,
  inlandwaters,
  landcover,
  location,

  military,
  oceans,
  passengers,
  restricted,
  society,

  structure,
  tractor,
  transportation,
  utilities,
  water,
  weather,
};

// pattern icons
const patternOptions = {
  name: "patternOptions",
  options: [
    { id: "circle", value: "circle", title: "圆形" },
    { id: "square", value: "square", title: "正方形" },
    { id: "rectangle", value: "rectangle", title: "矩形" },
    { id: "triangle", value: "triangle", title: "三角形" },
    { id: "star", value: "star", title: "星形" },
    { id: "cross", value: "cross", title: "十字" },
    { id: "x", value: "x", title: "X" },
  ],
};

const imageIconsOptions = {
  name: "imageIconsOptions",
  options: [
    { id: "airborne", value: "airborne", title: "airborne", image: airborne },
    { id: "bioregions", value: "bioregions", title: "bioregions", image: bioregions },
    { id: "biota", value: "biota", title: "biota", image: biota },
    { id: "cadastre", value: "cadastre", title: "cadastre", image: cadastre },
    { id: "coins", value: "coins", title: "coins", image: coins },

    { id: "conservation", value: "conservation", title: "conservation", image: conservation },
    { id: "coordinates", value: "coordinates", title: "coordinates", image: coordinates },
    { id: "earth", value: "earth", title: "earth", image: earth },
    { id: "elevation", value: "elevation", title: "elevation", image: elevation },
    { id: "energy", value: "energy", title: "energy", image: energy },

    { id: "environment", value: "environment", title: "environment", image: environment },
    { id: "flag", value: "flag", title: "flag", image: flag },
    { id: "geocat", value: "geocat", title: "geocat", image: geocat },
    { id: "geology", value: "geology", title: "geology", image: geology },
    { id: "geonames", value: "geonames", title: "geonames", image: geonames },

    { id: "geonetwork", value: "geonetwork", title: "geonetwork", image: geonetwork },
    { id: "health", value: "health", title: "health", image: health },
    { id: "inlandwaters", value: "inlandwaters", title: "inlandwaters", image: inlandwaters },
    { id: "landcover", value: "landcover", title: "landcover", image: landcover },
    { id: "location", value: "location", title: "location", image: location },

    { id: "military", value: "military", title: "military", image: military },
    { id: "oceans", value: "oceans", title: "oceans", image: oceans },
    { id: "passengers", value: "passengers", title: "passengers", image: passengers },
    { id: "restricted", value: "restricted", title: "restricted", image: restricted },
    { id: "society", value: "society", title: "society", image: society },

    { id: "structure", value: "structure", title: "structure", image: structure },
    { id: "tractor", value: "tractor", title: "tractor", image: tractor },
    { id: "transportation", value: "transportation", title: "transportation", image: transportation },
    { id: "utilities", value: "utilities", title: "utilities", image: utilities },
    { id: "water", value: "water", title: "water", image: water },
    { id: "weather", value: "weather", title: "weather", image: weather },
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
    text: null,
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
    text: null,
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
        if (propsData.editProps) {
          const editProps = propsData.editProps;
          if (editProps) {
            const name = editProps.name;
            if (name) {
              state.name = name;
              oldState.name = name;
            } else {
              addVoidName();
            }

            const attributes = editProps.attributes;
            if (attributes) {
              // properties
              const attrProps = attributes.properties;
              if (attrProps && attrProps.length) {
                const newProps = [];
                const newProps2 = [];

                for (let i = 0; i < attrProps.length; i++) {
                  propsCnt = propsCnt + 1;
                  newProps.push({
                    id: nanoid(7),
                    label: `值属性`,
                    isShowDescribe: true,
                    values: { ...attrProps[i] },
                  });
                  newProps2.push({
                    id: nanoid(7),
                    label: `值属性`,
                    isShowDescribe: true,
                    values: { ...attrProps[i] },
                  });
                }
                state.attributes.properties = newProps;
                oldState.attributes.properties = newProps2;
              } else {
                addVoidPros();
              }

              // keyValues
              const keyValues = attributes.keyValues;
              if (keyValues && keyValues.length) {
                const newKeyValues = [];
                const newKeyValues2 = [];

                for (let i = 0; i < keyValues.length; i++) {
                  propsCnt = propsCnt + 1;
                  newKeyValues.push({
                    id: nanoid(7),
                    label: `属性`,
                    values: { ...keyValues[i] },
                  });
                  newKeyValues2.push({
                    id: nanoid(7),
                    label: `属性`,
                    values: { ...keyValues[i] },
                  });
                }
                state.attributes.keyValues = newKeyValues;
                oldState.attributes.keyValues = newKeyValues2;
              } else {
                addVoidKeyValues();
              }

              // json
              const jsonObj = attributes.json;
              try {
                const jsonString = JSON.stringify(jsonObj);
                state.attributes.json = jsonString;
                oldState.attributes.json = jsonString;
              } catch (e) {
                addVoidJson();
              }
            } else {
              // name 已经设置了
              addVoidPros();
              addVoidKeyValues();
              addVoidJson();
            }
          } else {
            addVoidName();
            addVoidPros();
            addVoidKeyValues();
            addVoidJson();
          }
        } else {
          addVoidName();
          addVoidPros();
          addVoidKeyValues();
          addVoidJson();
        }
        // 设置样式
        if (propsData.style) {
          const styleData = propsData.style;
          if (styleData.geo) {
            state.style.geo = { ...styleData.geo };
            oldState.style.geo = { ...styleData.geo };
            if (state.style.geo.iconPattern == "icons") {
              const iconUrl = state.style.geo.iconUrl;
              const oldIconUrl = state.style.geo.iconUrl;

              // 为了回显选择了那张图片。
              let iconUrlArray = iconUrl.split("/");
              if (iconUrlArray.length) {
              } else {
                iconUrlArray = iconUrl.split("\\");
              }
              if (iconUrlArray.length) {
                const lastIconUrl = iconUrlArray[iconUrlArray.length - 1];
                const lastIconUrlArr = lastIconUrl.split(".");
                if (lastIconUrlArr.length) {
                  state.style.geo.iconUrl = lastIconUrlArr[0];
                }
              }

              // 为了把图片地址重新设置回去
              setTimeout(() => {
                state.style.geo.iconUrl = oldIconUrl;
              }, 100);
            }
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
        }
      } else {
        addVoidName();
        addVoidPros();
        addVoidKeyValues();
        addVoidJson();
      }
    } else {
      addVoidName();
      addVoidPros();
      addVoidKeyValues();
      addVoidJson();
    }
  } else {
    addVoidName();
    addVoidPros();
    addVoidKeyValues();
    addVoidJson();
  }
}

function onPatternTypeChange(pattern: string) {
  if (state.style && state.style.geo) {
    state.style.geo.iconPattern = pattern;
  }
}

function onPatternIconChange(pattern: string) {
  if (state.style && state.style.geo) {
    state.style.geo.iconUrl = pattern;
    updateHandle();
  }
}

function onPatternIconUrlChange(pattern: string) {
  if (state.style && state.style.geo) {
    state.style.geo.iconUrl = imageIcons[pattern];
    updateHandle();
  }
}

function addVoidName() {
  state.name = "";
  oldState.name = "";
}

function addVoidPros() {
  propsCnt = propsCnt + 1;
  state.attributes.properties.push({
    id: nanoid(7),
    label: `值属性`,
    isShowDescribe: true,
    values: {},
  });
}

function addVoidKeyValues() {
  state.attributes.keyValues.push({
    id: nanoid(7),
    label: `属性`,
    values: {},
  });
}

function addVoidJson() {
  state.attributes.json = "";
  oldState.attributes.json = "";
}

function minusProps(index: number) {
  if (state.attributes.properties.length >= 2) {
    if (index < state.attributes.properties.length) {
      state.attributes.properties.splice(index, 1);
    }
  }
}

function addProps(index: number) {
  if (state.attributes.properties.length) {
    state.attributes.properties.splice(index + 1, 0, {
      id: nanoid(7),
      label: `值属性`,
      isShowDescribe: true,
      values: {},
    });
  }
}

const onPropsBlur = (index: number, nvu: any) => {
  state.attributes.properties[index].values = nvu;
};

function minusKeyValues(index: number) {
  if (state.attributes.keyValues.length >= 2) {
    if (index < state.attributes.keyValues.length) {
      state.attributes.keyValues.splice(index, 1);
    }
  }
}

function addKeyValues(index: number) {
  if (state.attributes.keyValues.length) {
    state.attributes.keyValues.splice(index + 1, 0, {
      id: nanoid(7),
      label: `属性`,
      values: {},
    });
  }
}

const onKeyValuesBlur = (index: number, nvu: any) => {
  state.attributes.keyValues[index].values = nvu;
};

const onJsonInput = () => {
  if (state.attributes.json) {
    try {
      const jsonObj = JSON.parse(state.attributes.json);
      console.log("jsonObj", state.attributes.json, jsonObj);
      if (typeof jsonObj == "object") {
        state.isNotValidJson = false;
        return jsonObj;
      }
    } catch (e) {
      state.isNotValidJson = true;
      return {};
    }
    state.isNotValidJson = true;
    return {};
  } else {
    state.isNotValidJson = false;
    return {};
  }
};

function getGeoProps() {
  const geoProps = {
    name: state.name,
    attributes: {
      properties: [],
      keyValues: [],
      json: {},
    },
    style: lodash.cloneDeep(state.style),
  };
  console.log("state", state);

  state.attributes.properties.forEach((attr: any) => {
    if (attr.values && attr.values.name && attr.values.units) {
      geoProps.attributes.properties.push({
        ...attr.values,
      });
    }
  });

  state.attributes.keyValues.forEach((attr: any) => {
    if (attr.values && attr.values.name) {
      geoProps.attributes.keyValues.push({
        ...attr.values,
      });
    }
  });

  if (state.attributes.json) {
    const jsonObj = onJsonInput();
    geoProps.attributes.json = jsonObj;
  }
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
  if (!state.isNotValidJson) {
    const geoProps = getGeoProps();
    props && props!.vNodeData.confirmCb(geoProps);
  }
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

.pattern_box {
  margin: 8px 0 16px;
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

.line_gap {
  width: 92%;
  margin: 12px 0 12px 4%;
  border-bottom: 1px solid rgb(255 255 255 / 25%);
}

.pros_box {
  width: 100%;
  height: auto;
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}

.pros_inbox {
  width: 100%;
  height: auto;
  margin-top: 8px;
  margin-bottom: 8px;
}

.props_action_box {
  width: 100%;
  height: 32px;
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
}

.props_minus {
  width: auto;
  height: 100%;
  margin-right: 16px;
  padding-right: 8px;
  padding-left: 8px;
  color: rgb(255 255 255 / 85%);
  font-weight: 400;
  font-size: 1rem;
  font-family: "Source Han Sans CN";
  border: 1px solid rgb(255 41 41 / 85%);
  border-radius: 0.25rem;
  cursor: pointer;
}

.props_minus:hover {
  background-color: rgb(255 41 41 / 85%);
}

.props_add {
  width: auto;
  height: 100%;
  margin-right: 32px;
  padding-right: 8px;
  padding-left: 8px;
  color: rgb(255 255 255 / 85%);
  font-weight: 400;
  font-size: 1rem;
  font-family: "Source Han Sans CN";
  border: 1px solid rgb(14 105 241);
  border-radius: 0.25rem;
  cursor: pointer;
}

.props_add:hover {
  background-color: rgb(14 105 241);
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

.prop_json_box {
  width: 96%;
  height: 120px;
  margin-top: 8px;
  margin-bottom: 8px;
  margin-left: 2%;
}

.prop_json_label {
  width: 80px;
  height: 120px;
  margin-top: 8px;
  margin-bottom: 8px;
  color: #f0f1f5;
}

.prop_text_cls {
  width: 338px;
  height: 120px;
  padding: 0 8px;
  color: #f0f1f5;
  font-size: 1rem;
  line-height: 32px;
  background-color: transparent;
  border: 1px solid #94a7c0;
  border-radius: 4px;
}

.prop_text_cls::placeholder {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: flex-start;
  padding: 0;
  color: #94a7c0;
  font-size: 1rem;
  line-height: 32px;
}

.prop_text_err_cls {
  color: #ef0d2e;
  border: 1px solid #ef0d2e;
}

.prop_text_err_tips {
  width: 100%;
  height: 22px;
  padding-left: 86px;
  color: #ef0d2e;
  font-size: 12px;
}
</style>
