<template>
  <div class="col_nw_fs_center rj_rpt_im_wraper">
    <div class="row_nw_fs_center rj_rpt_tips_t">请输入信息查询图片：</div>
    <div class="row_nw_fs_center rj_rpt_im_t">
      <span class="row_nw_fs_center rj_rpt_im_tl">名称:</span>
      <a-input v-model:value="search.name" placeholder="请输入" />
    </div>
    <div class="row_nw_fs_center rj_rpt_im_t">
      <span class="row_nw_fs_center rj_rpt_im_tl">经度:</span>
      <a-input v-model:value="search.longitude" placeholder="请输入" />
    </div>
    <div class="row_nw_fs_center rj_rpt_im_t">
      <span class="row_nw_fs_center rj_rpt_im_tl">纬度:</span>
      <a-input v-model:value="search.latitude" placeholder="请输入" />
    </div>
    <div class="row_nw_fs_center rj_rpt_im_t">
      <span class="row_nw_fs_center rj_rpt_im_tl">时间:</span>
      <a-range-picker
        v-model:value="search.timeRange"
        :format="dateFormat"
        :getPopupContainer="getAntdvPopupContainer"
      />
    </div>

    <div class="row_nw_fe_center rj_rpt_im_t">
      <a-button type="primary" size="medium" @click="searchImageHandle">
        <template #icon><SearchOutlined /></template>
        查询
      </a-button>
      <div class="w_16r"></div>
      <a-button type="primary" size="medium" ghost @click="resetSearchImageHandle">
        <template #icon><UndoOutlined /></template>
        重置
      </a-button>
    </div>

    <div v-if="search.result.length" class="col_nw_fs_fs rj_rpt_im_r">
      <div class="row_nw_fs_center rj_rpt_im_rt">查询结果：</div>
      <div class="h_8r"></div>
      <div class="row_nw_fs_center rj_rpt_im_rlist">
        <div v-for="(imgsrc, index) in search.result" :key="'imr_' + index" class="col_nw_fs_center rj_rpt_im_rit">
          <img
            class="rj_rpt_im_ritimg"
            :src="`${imgsrc?.url}?token=${authToken}`"
            @dragstart="srImageDragstartHandle"
            @drag="srImageDragHandle"
            @dragend="srImageDragendHandle(imgsrc)"
          />
          <div v-show="imgsrc.issue" class="row_nw_fs_center rj_rpt_im_ritlabel">
            {{ imgsrc.issue }}
          </div>
          <div v-show="imgsrc.bus[0]" class="row_nw_fs_center rj_rpt_im_ritlabel">
            {{ imgsrc.bus[0] && imgsrc.bus[0].platformName ? imgsrc.bus[0].platformName : "" }}
          </div>
          <div v-show="imgsrc.name" class="row_nw_fs_center rj_rpt_im_ritlabel">
            {{ imgsrc.name }}
          </div>
          <div v-show="imgsrc.filename" class="row_nw_fs_center rj_rpt_im_ritlabel">
            {{ imgsrc.filename }}
          </div>
        </div>
      </div>
    </div>

    <div class="h_16r"></div>
    <div class="row_nw_fs_center rj_rpt_tips_t">配置项：</div>
    <div class="row_nw_fs_center rj_rpt_im_t">
      <span class="row_nw_fs_center rj_rpt_im_tl">标题:</span>
      <a-input v-model:value="imageData.title" placeholder="请输入" />
    </div>
    <div class="row_nw_fs_center rj_rpt_im_t">
      <span class="row_nw_fs_center rj_rpt_im_tl">一行几栏:</span>
      <a-radio-group v-model:value="imageData.columns" :options="ImageColumnsTypeOptions" />
    </div>
    <div class="h_8r"></div>

    <div class="row_nw_fs_fs rj_rpt_im_i">
      <div v-for="(image, index) in imageData.images" :key="'imc_' + index" class="col_nw_center_center rj_rpt_im_it">
        <div class="row_nw_center_center rj_rpt_im_itbox" @click="ImageUploadIndexHandle(index)">
          <a-upload-dragger
            v-model:fileList="image.files"
            :name="'imageFiles_' + index"
            :multiple="false"
            accept="image/*"
            :maxCount="1"
            :show-upload-list="false"
            :openFileDialogOnClick="false"
            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            :before-upload="beforeUpload"
            @change="handleImageUploadChange"
            @drop="handleImageUploadDrop(index)"
          >
            <img v-if="image.src" class="rj_rpt_im_itshow" :src="`${image.src}?token=${authToken}`" />
            <div v-else class="col_nw_center_center rj_rpt_im_itup">
              <p class="row_nw_center_center rj_rpt_im_itupicon">
                <LoadingOutlined v-if="image.loading" :style="{ fontSize: '120px', color: '#ccc' }" />
                <FileImageOutlined v-else :style="{ fontSize: '120px', color: '#ccc' }" />
              </p>
              <p class="row_nw_center_center rj_rpt_im_ituptip">拖拽查询图片</p>
            </div>
          </a-upload-dragger>
        </div>
        <div class="row_nw_fs_center rj_rpt_im_itlabel">
          <span class="row_nw_fs_center rj_rpt_im_itlabels">图注:</span>
          <a-input v-model:value="image.label" placeholder="请输入图片说明" />
        </div>
      </div>
    </div>

    <div class="row_nw_fs_center rj_rpt_im_t">
      <a-button type="primary" size="small" @click="addImageHandle">
        <template #icon><PlusOutlined /></template>
      </a-button>
      <div class="w_16r"></div>
      <a-button type="primary" ghost size="small" :disabled="imageData.images.length <= 2" @click="deleteImageHandle">
        <template #icon><MinusOutlined /></template>
      </a-button>
    </div>

    <div class="h_16r"></div>
    <div class="row_nw_fs_center rj_rpt_im_t">
      <span class="row_nw_fs_center rj_rpt_tips_t">说明/结论:</span>
    </div>
    <div class="rj_rpt_im_col">
      <Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />
      <Editor
        v-model="imageData.conclusion"
        style="height: 300px; overflow-y: hidden;"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import "@wangeditor/editor/dist/css/style.css"; // 引入 css
import { IToolbarConfig } from "@wangeditor/editor";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";

import { reactive, watch, nextTick, shallowRef, onBeforeUnmount } from "vue";
import {
  SearchOutlined,
  UndoOutlined,
  FileImageOutlined,
  PlusOutlined,
  MinusOutlined,
  LoadingOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import dayjs from "dayjs";
// import type { Dayjs } from "dayjs";

import type { UploadChangeParam, UploadProps } from "ant-design-vue";

import { getAntdvPopupContainer } from "@/utils/common/antdvPositionFixed";

import { ImageColumnsType, ImageColumnsTypeOptions } from "@/common/imageComparator";

import { useReportModuleVnodeStore } from "@/stores/reports";
import lodash from "lodash";

import { getPicturesRequest } from "@/api/platform";

// import { getAuthToken } from "@/composables/useAuth";

// const authToken = getAuthToken().accessToken;

const dateFormat = "YYYY-MM-DD";
// const dayjsToday = dayjs(undefined, dateFormat);
let imageDropIndex = 0;
const search = reactive({
  name: "",
  longitude: "",
  latitude: "",
  timeRange: [],
  isRefresh: 1,
  result: [],
});

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();
const mode = "default"; // 或 'simple' 'default'
const toolbarConfig: Partial<IToolbarConfig> = {
  excludeKeys: ["group-image", "group-video", "insertTable"],
};
const editorConfig = { placeholder: "请输入内容..." };

const fakeResultList = [
  "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
  "https://downhdlogo.yy.com/hdlogo/640640/640/640/30/2540300861/u2540300861CuJtLET.jpg",
  "https://p.qqan.com/up/2018-2/15196969331561368.jpg",
];

const imageItemData = {
  files: [],
  loading: false,
  src: "",
  label: "", // 图片标注
};
const imageData = reactive({
  title: "",
  columns: ImageColumnsType.two,
  images: [
    {
      ...imageItemData,
    },
    {
      ...imageItemData,
    },
  ],
  conclusion: "",
});

let isFromSearchDrop = false;

const currentModuleVnode = useReportModuleVnodeStore();

// 测试字段
function initOptions() {
  const vnode = lodash.cloneDeep(currentModuleVnode.reportModule.vnode);
  console.log("isRefresh imageComparator", vnode);

  const node = vnode.node;
  nextTick(() => {
    imageData.title = node.title || "";
    imageData.columns = node.columns || ImageColumnsType.two;

    if (node.images) {
      for (let i = 0; i < node.images.length; i++) {
        node.images[i].files = [];
      }
      imageData.images = node.images;
    } else {
      imageData.images = [
        {
          ...imageItemData,
        },
        {
          ...imageItemData,
        },
      ];
    }
    imageData.conclusion = node.conclusion || "";
  });
}

watch(
  () => currentModuleVnode.reportModule.isRefresh,
  () => {
    initOptions();
  },
  {
    deep: true,
    immediate: true,
  },
);

watch(
  imageData,
  () => {
    updateVnodeData();
  },
  {
    deep: true,
    immediate: false,
  },
);

function updateVnodeData() {
  const vNode = {
    ...currentModuleVnode.reportModule.vnode,
  };
  console.log("updateVnodeData image_comparison", vNode);
  const code = vNode.node.code;
  vNode.node = lodash.cloneDeep(imageData);
  for (let i = 0; i < vNode.node.images.length; i++) {
    vNode.node.images[i].files = [];
  }
  vNode.node.code = code;
  currentModuleVnode.setModuleVnode(vNode);
}

function searchImageHandle() {
  // for test
  // search.result = fakeResultList;
  getPicturesReqHandle();
}

function getPicturesReqHandle() {
  const reqData = {
    // sort: "",
    // order: "",
    page: 0,
    pagesize: 100,
    // issue: "",
    // extent: "",
    // platformUuid: search.platformUuid,
    // platformName: "",
    // projectUuid: "",
    // projectName: "",
    // marked: search.isAnnotation,
    // name: search.name,
    // any: "",
    status: "stored",
  };
  getPicturesRequest(reqData)
    .then((res: any) => {
      console.log("getPicturesReqHandle OK", res);
      if (res.code === 0 && res.data && res.data.list && res.data.list.length) {
        search.result = res.data.list;
      } else {
        search.result = [];
      }
    })
    .catch((err: any) => {
      console.log("getPicturesReqHandle error", err);
      search.result = [];
    });
}

function resetSearchImageHandle() {
  search.name = "";
  search.longitude = "";
  search.latitude = "";
  search.timeRange = [];
  search.result = [];
}

function addImageHandle() {
  const itemData = {
    ...imageItemData,
  };
  imageData.images.push(itemData);
}

function srImageDragstartHandle() {
  // console.log("srImageDragstartHandle");
  return true;
}
function srImageDragHandle() {
  // console.log("srImageDragHandle");
  return true;
}
function srImageDragendHandle(imgsrc: any) {
  console.log("srImageDragendHandle", imgsrc);
  setTimeout(() => {
    if (imageData.images[imageDropIndex]) {
      imageData.images[imageDropIndex].src = imgsrc?.url; //  不能在这里加token 不然token失效了GG了
    }
  }, 10);
  return true;
}

function deleteImageHandle() {
  if (imageData.images.length > 2) {
    imageData.images.pop();
  }
}

let whichImageIndex = 0;
function ImageUploadIndexHandle(index: number) {
  console.log("ImageUploadIndexHandle", index);
  whichImageIndex = index;
}

const handleImageUploadChange = (info: UploadChangeParam) => {
  const status = info.file.status;
  console.log("handleImageUploadChange", status, info, whichImageIndex);
  if (status && status !== "uploading") {
    imageData.images[whichImageIndex].loading = true;
    console.log(info.file, info.fileList);
  }
  if (status && status === "done") {
    // message.success(`${info.file.name} file uploaded successfully.`);
    getBase64(info.file.originFileObj, (base64Url: string) => {
      imageData.images[whichImageIndex].src = base64Url;
      imageData.images[whichImageIndex].loading = false;
    });
  } else if (status === "error") {
    imageData.images[whichImageIndex].loading = false;
    // message.error(`${info.file.name} file upload failed.`);
    getBase64(info.file.originFileObj, (base64Url: string) => {
      imageData.images[whichImageIndex].src = base64Url;
      imageData.images[whichImageIndex].loading = false;
    });
  }
};

const handleImageUploadDrop = (index: number) => {
  isFromSearchDrop = true;
  console.log("handleDrop", index);
  imageDropIndex = index;
};

const beforeUpload = (file: UploadProps["fileList"][number]) => {
  if (isFromSearchDrop) {
    isFromSearchDrop = false;
    return false;
  } else {
    isFromSearchDrop = false;
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must smaller than 2MB!");
    }
    return false;
    // return isJpgOrPng && isLt2M;
  }
};

function getBase64(img: Blob, callback: (base64Url: string) => void) {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});

const handleCreated = (editor: any) => {
  editorRef.value = editor; // 记录 editor 实例，重要！
};
</script>

<style scoped lang="scss">
.rj_rpt_im_wraper {
  width: 100%;
  height: 100%;
  scrollbar-width: none;
  -ms-overflow-style: none;
  overflow-x: overlay;
  overflow-y: scroll;
  scroll-behavior: smooth;
}

.rj_rpt_im_wraper::-webkit-scrollbar {
  display: none;
}

.rj_rpt_tips_t {
  flex-shrink: 0;
  width: 96%;
  height: 2rem;
  margin-bottom: 1rem;
  color: #333;
  font-weight: bolder;
  font-size: 1rem;
}

.rj_rpt_im_t {
  flex-shrink: 0;
  width: 96%;
  height: 2.5rem;
}

.rj_rpt_im_tl {
  flex-shrink: 0;
  width: 5rem;
  height: 100%;
  font-size: 1rem;
}

.rj_rpt_im_r {
  width: 96%;
  height: auto;
}

.rj_rpt_im_rt {
  width: 100%;
  height: 2rem;
  margin-bottom: 1rem;
  color: #333;
  font-size: 0.875rem;
}

.rj_rpt_im_rlist {
  width: 100%;
  height: 30rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
  overflow-x: scroll;
  overflow-y: overlay;
  scroll-behavior: smooth;
}

.rj_rpt_im_rit {
  width: auto;
  height: 100%;
  margin-right: 1rem;
}

.rj_rpt_im_rit:focus {
  outline: 1px solid #40a9ff;
}

.rj_rpt_im_ritimg {
  width: auto;
  height: calc(100% - 9rem);
  margin-bottom: 0.5rem;
}

.rj_rpt_im_ritlabel {
  width: max-content;
  height: 2rem;
  color: #333;
  font-size: 0.875rem;
}

.rj_rpt_im_i {
  flex-shrink: 0;
  flex-wrap: wrap;
  width: 96%;
  height: 33rem;
  overflow-x: overlay;
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
}

.rj_rpt_im_i::-webkit-scrollbar {
  display: none;
}

.rj_rpt_im_it {
  flex-shrink: 0;
  width: 26rem;
  height: auto;
  min-height: 27rem;
  margin-right: 1rem;
  margin-bottom: 1rem;
}

.rj_rpt_im_itbox {
  width: 26rem;
  height: auto;
}

.rj_rpt_im_itshow {
  width: 100%;
  height: auto;
  min-height: 20rem;
}

.rj_rpt_im_itup {
  width: 26rem !important;
  height: 20rem;
}

.rj_rpt_im_itupicon {
  width: 100%;
  height: auto;
}

.rj_rpt_im_ituptip {
  width: 100%;
  margin-top: 1rem;
  color: #333;
  font-size: 0.75rem;
}

.rj_rpt_im_itlabel {
  width: 96%;
  height: 2.5rem;
  margin-top: 1rem;
}

.rj_rpt_im_itlabels {
  width: 6rem;
  height: 100%;
  font-size: 1rem;
}

.rj_rpt_im_col {
  width: 96%;
  border: 1px solid #ccc;
}
</style>
