<template>
  <div class="row_nw_fs_center label_input_containner">
    <div class="row_nw_fs_fs label_input_wraper">
      <div class="row_nw_fs_center label_title">{{ titleLabel }}</div>
      <div class="row_nw_fs_center input_box">
        <div
          v-for="(item, index) in radioOptions.options"
          :key="'radio_' + index"
          class="col_nw_fs_center radio_content"
        >
          <input
            :id="item.id"
            v-model="currentValue"
            class="radio_input"
            type="radio"
            :name="radioOptions.name"
            :value="item.value"
            @change="onChange"
          />
          <label :for="item.id" class="radio_label" :class="{ radio_label_checked: item.value === currentValue }"
            ><img :src="item.image" class="radio_span" :class="{ radio_span_checked: item.value === currentValue }" />
            {{ item.title }}</label
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";

const emit = defineEmits(["onInput"]);

const props = defineProps({
  titleLabel: {
    type: String,
    default: "图案类型",
  },
  isRefresh: {
    type: Number,
    default: 0,
  },
  radioOptions: {
    type: Object,
    default() {
      return {
        name: "imagingMode",
        options: [{ id: "pattern", value: "pattern", title: "图案", image: "" }],
      };
    },
  },
  initValue: {
    type: String,
    default: "pattern",
  },
});

const currentValue = ref(props.initValue);

watch(
  () => props.isRefresh,
  () => {
    init();
  },
);

onMounted(() => {
  init();
});

function init() {
  currentValue.value = props.initValue;
}

function onChange() {
  emit("onInput", currentValue.value);
}
</script>

<style scoped>
.label_input_containner {
  width: 100%;
  height: auto;
  min-height: 32px;
}

.label_input_wraper {
  width: 96%;
  height: auto;
  min-height: 32px;
  margin-left: 2%;
}

.label_title {
  width: 80px;
  height: auto;
  min-height: 32px;
  color: #f0f1f5;
  font-size: 1rem;
}

.input_box {
  flex-wrap: wrap;
  width: 366px;
  height: auto;
  min-height: 32px;
  max-height: 360px;
  overflow: hidden;
  overflow-y: scroll;
  text-align: center;
  background-color: transparent;
}

.input_box::-webkit-scrollbar {
  display: none;
}

.radio_content {
  width: 70px;
  height: auto;
  margin: 8px 8px 12px;
  color: #94a7c0;
  font-size: 14px;
  text-align: center;
  background-color: transparent;
  cursor: pointer;
}

.radio_input {
  display: none;
  cursor: pointer;
}

.radio_label {
  color: #f0f1f5;
  font-weight: normal;
  font-size: 14px;
  cursor: pointer;
}

.radio_span {
  display: inline-block;
  width: 70px;
  height: 70px;
  margin-bottom: 8px;
  vertical-align: middle;
  border: 1px solid #666;
  transform: 0.2s;
  cursor: pointer;
  transition: 0.2s;
}

.radio_label:hover .radio_span {
  transform: scale(1.2);
  cursor: pointer;
}

.radio_span_checked {
  background: linear-gradient(to right, rgb(0 155 222 / 50%), rgb(0 155 222 / 100%));
  box-shadow: 0 0 0 2px white inset;
  cursor: pointer;
}

.radio_label_checked {
  color: rgb(0 155 222 / 100%);
  cursor: pointer;
}
</style>
