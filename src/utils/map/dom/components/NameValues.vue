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
      </div>
    </div>
    <div class="row_nw_fs_center props_des_box">
      <textarea
        v-model="state.values"
        class="row_nw_fs_center text_cls"
        placeholder="值"
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
  }
}

onMounted(() => {
  init();
});

const state = reactive({
  name: "",
  values: "",
});

function onInput() {
  if (state.name && state.values) {
    emit("onInput", {
      name: state.name,
      values: state.values,
    });
  }
}

function onBlur() {
  if (state.name && state.values) {
    emit("onBlur", {
      name: state.name,
      values: state.values,
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
  color: #f0f1f5;
  font-size: 1rem;
}

.input_box {
  width: 338px;
  background-color: transparent;
}

.input_cls {
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

.input_cls::placeholder {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: flex-start;
  padding: 0;
  color: #94a7c0;
  font-size: 1rem;
  line-height: 32px;
}

.input_error_cls {
  color: #ef0d2e;
  border: 1px solid #ef0d2e;
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
  margin-top: 4px;
  margin-left: calc(80px + 2%);
}

.text_cls {
  width: 100%;
  height: 100%;
  padding: 0 8px;
  color: #f0f1f5;
  font-size: 1rem;
  line-height: 32px;
  background-color: transparent;
  border: 1px solid #94a7c0;
  border-radius: 4px;
}

.text_cls::placeholder {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: flex-start;
  padding: 0;
  color: #94a7c0;
  font-size: 1rem;
  line-height: 32px;
}
</style>
