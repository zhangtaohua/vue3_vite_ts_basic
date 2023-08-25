<template>
  <div class="col_nw_fs_fs props_nvu_container">
    <div class="row_nw_fs_center props_nvu_box">
      <div class="row_nw_fs_center label_title">{{ label }}</div>
      <div class="row_nw_fs_center input_box">
        <input
          v-model="state.name"
          class="row_nw_fs_center input_cls"
          type="text"
          placeholder="名称"
          @input="onInput"
          @blur="onBlur"
        />
        <input
          v-model="state.values"
          class="row_nw_fs_center input_cls"
          type="number"
          placeholder="值"
          @input="onInput"
          @blur="onBlur"
        />
        <input
          v-model="state.units"
          class="row_nw_fs_center input_cls"
          type="text"
          placeholder="单位"
          @input="onInput"
          @blur="onBlur"
        />
      </div>
    </div>
    <div v-if="isShowDescribe" class="row_nw_fs_center props_des_box">
      <textarea
        v-model="state.describe"
        class="row_nw_fs_center text_cls"
        placeholder="描述"
        @input="onInput"
        @blur="onBlur"
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from "vue";

const emit = defineEmits(["onInput", "onBlur"]);
const props = defineProps({
  label: {
    type: String,
    default: "属性",
  },
  isShowDescribe: {
    type: Boolean,
    default: true,
  },
  initValue: {
    type: Object,
    default() {
      return {};
    },
  },
});

function init() {
  if (props.initValue && props.initValue.name) {
    state.name = props.initValue.name;
    state.values = props.initValue.values;
    state.units = props.initValue.units;
    state.describe = props.initValue.describe;
  }
}

onMounted(() => {
  init();
});

const state = reactive({
  name: "",
  values: 0,
  units: "",
  describe: "",
});

function onInput() {
  if (state.name && state.units) {
    emit("onInput", {
      name: state.name,
      values: state.values,
      units: state.units,
      describe: state.describe,
    });
  }
}

function onBlur() {
  if (state.name && state.units) {
    emit("onBlur", {
      name: state.name,
      values: state.values,
      units: state.units,
      describe: state.describe,
    });
  }
}
</script>

<style lang="scss" scoped>
.props_nvu_container {
  width: 100%;
  height: auto;
}

.props_nvu_box {
  width: 96%;
  height: 32px;
  margin-left: 2%;
}

.label_title {
  width: 80px;
  height: 32px;
  font-size: 1rem;
  color: #f0f1f5;
}

.input_box {
  background-color: transparent;
  width: 320px;
}

.input_cls {
  width: 110px;
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

.input_cls::placeholder {
  color: #94a7c0;
  font-size: 1rem;
  line-height: 32px;
  padding: 0px;
  display: flex;
  flex-direction: row;
  justify-items: flex-start;
  align-items: center;
}

.input_error_cls {
  border: 1px solid #ef0d2e;
  color: #ef0d2e;
}

.input_placeholder {
  color: #94a7c0;
  font-size: 1rem;
}

.input_disable {
  background-color: transparent;
  border: 1px solid #94a7c0;
  border-radius: 4px;
}

.props_des_box {
  width: 338px;
  height: 64px;
  margin-left: calc(80px + 2%);
  margin-top: 4px;
}

.text_cls {
  width: 100%;
  height: 100%;
  color: #f0f1f5;
  padding: 0 8px;
  line-height: 32px;
  font-size: 1rem;
  background-color: transparent;
  border: 1px solid #94a7c0;
  border-radius: 4px;
}

.text_cls::placeholder {
  color: #94a7c0;
  font-size: 1rem;
  line-height: 32px;
  padding: 0px;
  display: flex;
  flex-direction: row;
  justify-items: flex-start;
  align-items: center;
}
</style>
