<template>
  <div :id="id" class="col_nw_fs_fs panel_container">
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
        <div v-for="(item, index) in state.attributes" :key="item.id" class="col_nw_fs_fs pros_inbox">
          <NameValueUnit
            :label="item.label"
            :isShowDescribe="item.isShowDescribe"
            :initValue="item.values"
            :isRefresh="item.id"
            @onBlur="(values) => onBlur(index, values)"
          />
          <div class="row_nw_fe_center props_action_box">
            <div class="row_nw_center_center props_minus" @click="minusProps(index)">-</div>
            <div class="row_nw_center_center props_add" @click="addProps(index)">+</div>
          </div>
        </div>
      </div>
    </div>
    <div class="row_nw_center_center action_box">
      <div class="row_nw_center_center info_del" @click="cancelHandle">取消</div>
      <div class="row_nw_center_center info_confirm" @click="confirmHandle">完成</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nanoid } from "nanoid";
import { reactive, onMounted } from "vue";
import { ColorPicker } from "vue3-colorpicker";
import "vue3-colorpicker/style.css";

import NameValueUnit from "./components/NameValueUnit.vue";
import lodash from "lodash";

import { drawNormalStyleOptions, segmentStyleOptions, labelStyleOptions, lnglatStyleOptions } from "../ol/style";

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
  console.log("mounted", props.vNodeData);
  init();
});

const state = reactive({
  name: "",
  style: {
    geo: { ...drawNormalStyleOptions },
    vertex: { ...lnglatStyleOptions },
    line: { ...segmentStyleOptions },
    label: { ...labelStyleOptions },
  },
  attributes: [],
});

let oldState = {
  name: "",
  style: {
    geo: { ...drawNormalStyleOptions },
    vertex: { ...lnglatStyleOptions },
    line: { ...segmentStyleOptions },
    label: { ...labelStyleOptions },
  },
  attributes: [],
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
            const attributes = editProps.attributes;
            const name = editProps.name;
            if (name) {
              state.name = name;
              oldState.name = name;
            }
            if (attributes && attributes.length) {
              const newAttributes = [];
              const newAttributes2 = [];

              for (let i = 0; i < attributes.length; i++) {
                propsCnt = propsCnt + 1;
                newAttributes.push({
                  id: nanoid(7),
                  label: `属性`,
                  isShowDescribe: true,
                  values: { ...attributes[i].values },
                });
                newAttributes2.push({
                  id: nanoid(7),
                  label: `属性`,
                  isShowDescribe: true,
                  values: { ...attributes[i].values },
                });
              }
              state.attributes = newAttributes;
              oldState.attributes = newAttributes2;
            } else {
              addVoidPros();
            }
          } else {
            addVoidPros();
          }
        } else {
          addVoidPros();
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
        addVoidPros();
      }
    } else {
      addVoidPros();
    }
  } else {
    addVoidPros();
  }
}

function addVoidPros() {
  propsCnt = propsCnt + 1;
  state.name = "";
  state.attributes.push({
    id: nanoid(7),
    label: `属性`,
    isShowDescribe: true,
    values: {},
  });
}

function minusProps(index: number) {
  if (state.attributes.length >= 2) {
    if (index < state.attributes.length) {
      state.attributes.splice(index, 1);
    }
  }
}

function addProps(index: number) {
  if (state.attributes.length) {
    state.attributes.splice(index + 1, 0, {
      id: nanoid(7),
      label: `属性`,
      isShowDescribe: true,
      values: {},
    });
  }
}

const onBlur = (index: number, nvu: any) => {
  state.attributes[index].values = nvu;
};

function getGeoProps() {
  const geoProps = {
    name: state.name,
    attributes: [],
    style: lodash.cloneDeep(state.style),
  };
  state.attributes.forEach((attr: any) => {
    geoProps.attributes.push({
      ...attr.values,
    });
  });
  return geoProps;
}

const colseHandle = () => {
  props && props!.destory();
};

const cancelHandle = () => {
  props && props!.vNodeData.cancelCb(oldState);
};

const updateHandle = () => {
  props && props!.vNodeData.updateCb(state);
};

const confirmHandle = () => {
  props && props!.vNodeData.confirmCb(state);
};
</script>

<style lang="scss" scoped>
.panel_container {
  position: absolute;
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
  max-height: 800px;
  overflow: hidden;
  overflow-y: scroll;
}

.panel_wraper::-webkit-scrollbar {
  width: 0;
  display: none;
}

.title_box {
  width: 100%;
  height: 3rem;
  margin-left: 2%;
  color: rgb(255 255 255 / 100%);
  font-weight: bold;
  font-size: 18px;
  margin-top: 1rem;
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
  color: #f0f1f5;
  margin-left: 2px;
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
  color: #f0f1f5;
  padding: 0 8px;
  line-height: 32px;
  font-size: 1rem;
  background-color: transparent;
  border: 1px solid #94a7c0;
  border-radius: 4px;
  margin-right: 4px;
}

.name_box_input::placeholder {
  color: #94a7c0;
  font-size: 1rem;
  line-height: 32px;
  padding: 0px;
  display: flex;
  flex-direction: row;
  justify-items: flex-start;
  align-items: center;
}
.dash_input {
  width: 148px;
  height: 32px;
  color: #f0f1f5;
  padding: 0 8px;
  line-height: 32px;
  font-size: 1rem;
  background-color: transparent;
  border: 1px solid #94a7c0;
  border-radius: 4px;
  margin-right: 4px;
}

.dash_input::placeholder {
  color: #94a7c0;
  font-size: 1rem;
  line-height: 32px;
  padding: 0px;
  display: flex;
  flex-direction: row;
  justify-items: flex-start;
  align-items: center;
}

.fs_input {
  width: 300px;
  height: 32px;
  color: #f0f1f5;
  padding: 0 8px;
  line-height: 32px;
  font-size: 1rem;
  background-color: transparent;
  border: 1px solid #94a7c0;
  border-radius: 4px;
  margin-right: 4px;
}

.fs_input::placeholder {
  color: #94a7c0;
  font-size: 1rem;
  line-height: 32px;
  padding: 0px;
  display: flex;
  flex-direction: row;
  justify-items: flex-start;
  align-items: center;
}

.fs_label {
  width: 38px;
  height: 100%;
  color: #f0f1f5;
}

.line_gap {
  width: 92%;
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
  margin: 12px 0 12px 4%;
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
  margin-bottom: 0.25rem;
}

.props_minus {
  width: auto;
  height: 100%;
  padding-left: 8px;
  padding-right: 8px;
  color: rgb(255 255 255 / 85%);
  font-weight: 400;
  font-size: 1rem;
  font-family: "Source Han Sans CN";
  border: 1px solid rgb(255 41 41 / 85%);
  border-radius: 0.25rem;
  margin-right: 16px;
  cursor: pointer;
}

.props_minus:hover {
  background-color: rgb(255 41 41 / 85%);
}

.props_add {
  width: auto;
  height: 100%;
  padding-left: 8px;
  padding-right: 8px;
  color: rgb(255 255 255 / 85%);
  font-weight: 400;
  font-size: 1rem;
  font-family: "Source Han Sans CN";
  border: 1px solid rgb(14 105 241);
  border-radius: 0.25rem;
  cursor: pointer;
  margin-right: 32px;
}

.props_add:hover {
  background-color: rgb(14 105 241);
}

.action_box {
  width: 100%;
  height: 2rem;
  margin-top: 1rem;
  margin-bottom: 2rem;
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
