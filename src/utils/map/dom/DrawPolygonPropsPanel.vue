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

        <!-- 分段线 即分段线上长度的显示 -->
        <div class="row_nw_fs_center name_box">
          <div class="row_nw_fs_center name_box_label">线段文字</div>
          <input
            v-model="state.style.line.fontSize"
            class="row_nw_fs_center fs_input"
            type="number"
            placeholder="顶点文字大小,单位PX"
            @blur="updateHandle"
          />
          <div class="row_nw_center_center fs_label">PX</div>
        </div>
        <div class="row_nw_fs_center name_box">
          <div class="row_nw_fs_center name_box_label">线段颜色</div>
          <ColorPicker v-model:pureColor="state.style.line.color" format="rgb" @pureColorChange="updateHandle" />
        </div>
        <div class="row_nw_fs_center name_box">
          <div class="row_nw_fs_center name_box_label">线段填充</div>
          <ColorPicker v-model:pureColor="state.style.line.fillColor" format="rgb" @pureColorChange="updateHandle" />
        </div>

        <!-- Label 即最终长度或者面积的显示 -->
        <div class="row_nw_fs_center name_box">
          <div class="row_nw_fs_center name_box_label">标签文字</div>
          <input
            v-model="state.style.label.fontSize"
            class="row_nw_fs_center fs_input"
            type="number"
            placeholder="顶点文字大小,单位PX"
            @blur="updateHandle"
          />
          <div class="row_nw_center_center fs_label">PX</div>
        </div>
        <div class="row_nw_fs_center name_box">
          <div class="row_nw_fs_center name_box_label">标签颜色</div>
          <ColorPicker v-model:pureColor="state.style.label.color" format="rgb" @pureColorChange="updateHandle" />
        </div>
        <div class="row_nw_fs_center name_box">
          <div class="row_nw_fs_center name_box_label">标签填充</div>
          <ColorPicker v-model:pureColor="state.style.label.fillColor" format="rgb" @pureColorChange="updateHandle" />
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
import { reactive, onMounted } from "vue";
import { ColorPicker } from "vue3-colorpicker";
import "vue3-colorpicker/style.css";

import NameValueUnit from "./components/NameValueUnit.vue";
import NameValues from "./components/NameValues.vue";
import lodash from "lodash";

import {
  drawNormalStyleOptions,
  drawTextStyleOptions,
  segmentStyleOptions,
  labelStyleOptions,
  lnglatStyleOptions,
} from "../ol/style";

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
  // props && props!.destory();
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
  place-items: center flex-start;
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
  place-items: center flex-start;
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
  place-items: center flex-start;
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
  place-items: center flex-start;
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
