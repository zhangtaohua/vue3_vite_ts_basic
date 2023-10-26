<template>
  <DocumentEditor
    id="docEditor"
    documentServerUrl="http://192.168.3.247:48080/"
    :config="config"
    :events_onDocumentReady="onDocumentReady"
  />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref, shallowRef, watch } from "vue";
import { DocumentEditor } from "@onlyoffice/document-editor-vue";

let docEditor = null;
const config = {
  document: {
    fileType: "docx",
    key: "Khirz6zTPdfd7",
    title: "Example Document Title.docx",
    url: "https://example.com/url-to-example-document.docx",
  },
  documentType: "word",
  editorConfig: {
    callbackUrl: "http://192.168.3.247:48080/url-to-callback.ashx",
  },
};
</script>

<style scoped>
#content {
  position: relative;
  height: calc(100% - 40px);
  overflow-y: auto;
  background-color: rgb(245 245 245);
}

.rj_page_container {
  position: relative;
  width: 21cm;
  height: calc(100% - 100px);
  margin: 30px auto 60px;
  overflow-y: scroll;
  background-color: #f00;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 10px rgb(0 0 0 / 12%);
}

.rj_page_container::-webkit-scrollbar {
  display: none;
}
</style>
