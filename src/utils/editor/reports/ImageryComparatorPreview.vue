<template>
  <div class="col_nw_fs_fs rj_rpt_imp_preview_w">
    <div class="row_nw_fs_center rj_rpt_imp_preview_t">
      {{ configData.node.title }}
    </div>
    <div v-if="isShowImageView" class="row_nw_fs_center rj_rpt_imp_preview_c">
      <div
        v-for="(image, index) in configData.node.images"
        :key="'imcop_' + index"
        class="col_nw_fs_center rj_rpt_imp_preview_cit"
        :style="imagePreviewStyle"
      >
        <img class="row_nw_center_center rj_rpt_imp_preview_cits" :src="`${image.src}?token=${authToken}`" />
        <div class="row_nw_center_center rj_rpt_imp_preview_citlabel">
          {{ image.label }}
        </div>
      </div>
    </div>
    <div v-else class="row_nw_center_center rj_rpt_imp_preview_c">
      <div class="row_nw_center_center rj_rpt_imp_preview_holder"> 图像对比功能占位 </div>
    </div>

    <div class="rj_rpt_imp_preview_s" v-html="configData.node.conclusion"></div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, watch, reactive, ref } from "vue";
import { ImageColumnsType } from "@/common/imageComparator";

// import { getAuthToken } from "@/composables/useAuth";

// const authToken = getAuthToken().accessToken;

const props = defineProps({
  configData: {
    type: Object,
    default() {
      return {
        node: {},
      };
    },
  },
});

const imagePreviewWidth = {
  [ImageColumnsType.one]: "20cm", //, "95%"
  [ImageColumnsType.two]: "9.5cm", // "45%", // (21 - 0.5 - 0.5 -1) / 2
  [ImageColumnsType.three]: "6cm", //  "28.57%", // (21 - 0.5 - 0.5 - 2) / 3
  [ImageColumnsType.four]: "4.25cm", // "20.238%", // (21 - 0.5 - 0.5 - 3) / 4
  // 5: "3.2cm", // (21 - 0.5 - 0.5 - 4) / 5
};

const imagePreviewStyle = reactive({
  width: imagePreviewWidth[2],
  // height: imagePreviewWidth[2],
});

const isShowImageView = ref(false);

function updateImageryComparisonOptions() {
  // console.log("image_comparison", props.configData, imagePreviewStyle);
  if (props.configData.node && props.configData.node.columns) {
    const widthIndex = props.configData.node.columns;
    imagePreviewStyle.width = imagePreviewWidth[widthIndex];
    // imagePreviewStyle.height = imagePreviewWidth[widthIndex];
  }

  if (props.configData.node && props.configData.node.images) {
    const images = props.configData.node.images;
    let isShowPreviewTemp = true;
    if (images.length) {
      for (let i = 0; i < images.length; i++) {
        if (!images[i].src) {
          isShowPreviewTemp = false;
          break;
        }
      }
    }
    isShowImageView.value = isShowPreviewTemp;
  }
}

watch(
  () => props.configData,
  () => {
    updateImageryComparisonOptions();
  },
  {
    deep: true,
    immediate: true,
  },
);
</script>

<style scoped>
.rj_rpt_imp_preview_w {
  width: 100%;
  height: auto;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.rj_rpt_imp_preview_t {
  width: 100%;
  height: 3rem;
  padding-left: 1rem;
  color: black;
  font-size: 1.5rem;
}

.rj_rpt_imp_preview_c {
  flex-wrap: wrap;
  width: 100%;
  height: auto;
}

.rj_rpt_imp_preview_holder {
  width: 96%;
  height: 3cm;
  color: #333;
  font-weight: bold;
  font-size: 4rem;
}

.rj_rpt_imp_preview_cit {
  width: 9.5cm;
  height: auto;
  margin-right: 1cm;
  margin-bottom: 0.5rem;
}

/* .rj_rpt_imp_preview_cit:nth-child(even) {
  margin-right: 0px;
} */

.rj_rpt_imp_preview_cit:last-child {
  margin-right: 0;
}

.rj_rpt_imp_preview_cits {
  width: 100%;
  height: auto;
}

.rj_rpt_imp_preview_citlabel {
  flex-wrap: wrap;
  width: 98%;
  height: auto;
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
  color: #333;
  font-size: 0.75rem;
  text-align: center;
}

.rj_rpt_imp_preview_s {
  width: 100%;
  height: auto;
  padding: 0.75rem;
}
</style>
