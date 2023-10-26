<template>
  <div id="content" class="col_nw_fs_fs rj_page_container"></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref, shallowRef, watch } from "vue";
import { DocumentEditor } from "@onlyoffice/document-editor-vue";

const config12 = {
  document: {
    directUrl: "",
    fileType: "docx",
    info: {
      owner: "Me",
      uploaded: "Wed Oct 18 2023",
      favorite: null,
    },
    key: "192.168.3.76new.docx1697597661648",
    permissions: {
      chat: true,
      comment: true,
      copy: true,
      download: true,
      edit: true,
      fillForms: true,
      modifyContentControl: true,
      modifyFilter: true,
      print: true,
      review: true,
      reviewGroups: null,
      commentGroups: {},
      userInfoGroups: null,
      protect: true,
    },
    referenceData: {
      fileKey: '{"fileName":"new.docx","userAddress":"192.168.3.76"}',
      instanceId: "http://192.168.3.247:48080/example",
    },
    title: "new.docx",
    url: "http://192.168.3.247:48080/example/download?fileName=new.docx&useraddress=192.168.3.76",
  },
  documentType: "word",
  editorConfig: {
    actionLink: null,
    callbackUrl: "http://192.168.3.247:48080/example/track?filename=new.docx&useraddress=192.168.3.76",
    coEditing: null,
    createUrl: "http://192.168.3.247:48080/example/editor?fileExt=docx&userid=uid-1&type=desktop&lang=en",
    customization: {
      about: true,
      comments: true,
      feedback: true,
      forcesave: false,
      goback: {
        url: "http://192.168.3.247:48080/example/",
      },
      submitForm: false,
    },
    embedded: {
      embedUrl: "http://192.168.3.247:48080/example/download?fileName=new.docx",
      saveUrl: "http://192.168.3.247:48080/example/download?fileName=new.docx",
      shareUrl: "http://192.168.3.247:48080/example/download?fileName=new.docx",
      toolbarDocked: "top",
    },
    fileChoiceUrl: "",
    lang: "en",
    mode: "edit",
    plugins: { pluginsData: [] },
    templates: [
      {
        image: "",
        title: "Blank",
        url: "http://192.168.3.247:48080/example/editor?fileExt=docx&userid=uid-1&type=desktop&lang=en",
      },
      {
        image: "http://192.168.3.247:48080/example/images/file_docx.svg",
        title: "With sample content",
        url: "http://192.168.3.247:48080/example/editor?fileExt=docx&userid=uid-1&type=desktop&lang=en&sample=true",
      },
    ],
    user: {
      group: "",
      id: "uid-1",
      name: "John Smith",
    },
  },
  height: "100%",
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkb2N1bWVudCI6eyJkaXJlY3RVcmwiOiIiLCJmaWxlVHlwZSI6ImRvY3giLCJpbmZvIjp7Im93bmVyIjoiTWUiLCJ1cGxvYWRlZCI6IldlZCBPY3QgMTggMjAyMyIsImZhdm9yaXRlIjpudWxsfSwia2V5IjoiMTkyLjE2OC4zLjc2bmV3LmRvY3gxNjk3NTk3NjYxNjQ4IiwicGVybWlzc2lvbnMiOnsiY2hhdCI6dHJ1ZSwiY29tbWVudCI6dHJ1ZSwiY29weSI6dHJ1ZSwiZG93bmxvYWQiOnRydWUsImVkaXQiOnRydWUsImZpbGxGb3JtcyI6dHJ1ZSwibW9kaWZ5Q29udGVudENvbnRyb2wiOnRydWUsIm1vZGlmeUZpbHRlciI6dHJ1ZSwicHJpbnQiOnRydWUsInJldmlldyI6dHJ1ZSwicmV2aWV3R3JvdXBzIjpudWxsLCJjb21tZW50R3JvdXBzIjp7fSwidXNlckluZm9Hcm91cHMiOm51bGwsInByb3RlY3QiOnRydWV9LCJyZWZlcmVuY2VEYXRhIjp7ImZpbGVLZXkiOiJ7XCJmaWxlTmFtZVwiOlwibmV3LmRvY3hcIixcInVzZXJBZGRyZXNzXCI6XCIxOTIuMTY4LjMuNzZcIn0iLCJpbnN0YW5jZUlkIjoiaHR0cDovLzE5Mi4xNjguMy4yNDc6NDgwODAvZXhhbXBsZSJ9LCJ0aXRsZSI6Im5ldy5kb2N4IiwidXJsIjoiaHR0cDovLzE5Mi4xNjguMy4yNDc6NDgwODAvZXhhbXBsZS9kb3dubG9hZD9maWxlTmFtZT1uZXcuZG9jeCZ1c2VyYWRkcmVzcz0xOTIuMTY4LjMuNzYifSwiZG9jdW1lbnRUeXBlIjoid29yZCIsImVkaXRvckNvbmZpZyI6eyJhY3Rpb25MaW5rIjpudWxsLCJjYWxsYmFja1VybCI6Imh0dHA6Ly8xOTIuMTY4LjMuMjQ3OjQ4MDgwL2V4YW1wbGUvdHJhY2s_ZmlsZW5hbWU9bmV3LmRvY3gmdXNlcmFkZHJlc3M9MTkyLjE2OC4zLjc2IiwiY29FZGl0aW5nIjpudWxsLCJjcmVhdGVVcmwiOiJodHRwOi8vMTkyLjE2OC4zLjI0Nzo0ODA4MC9leGFtcGxlL2VkaXRvcj9maWxlRXh0PWRvY3gmdXNlcmlkPXVpZC0xJnR5cGU9ZGVza3RvcCZsYW5nPWVuIiwiY3VzdG9taXphdGlvbiI6eyJhYm91dCI6dHJ1ZSwiY29tbWVudHMiOnRydWUsImZlZWRiYWNrIjp0cnVlLCJmb3JjZXNhdmUiOmZhbHNlLCJnb2JhY2siOnsidXJsIjoiaHR0cDovLzE5Mi4xNjguMy4yNDc6NDgwODAvZXhhbXBsZS8ifSwic3VibWl0Rm9ybSI6ZmFsc2V9LCJlbWJlZGRlZCI6eyJlbWJlZFVybCI6Imh0dHA6Ly8xOTIuMTY4LjMuMjQ3OjQ4MDgwL2V4YW1wbGUvZG93bmxvYWQ_ZmlsZU5hbWU9bmV3LmRvY3giLCJzYXZlVXJsIjoiaHR0cDovLzE5Mi4xNjguMy4yNDc6NDgwODAvZXhhbXBsZS9kb3dubG9hZD9maWxlTmFtZT1uZXcuZG9jeCIsInNoYXJlVXJsIjoiaHR0cDovLzE5Mi4xNjguMy4yNDc6NDgwODAvZXhhbXBsZS9kb3dubG9hZD9maWxlTmFtZT1uZXcuZG9jeCIsInRvb2xiYXJEb2NrZWQiOiJ0b3AifSwiZmlsZUNob2ljZVVybCI6IiIsImxhbmciOiJlbiIsIm1vZGUiOiJlZGl0IiwicGx1Z2lucyI6eyJwbHVnaW5zRGF0YSI6W119LCJ0ZW1wbGF0ZXMiOlt7ImltYWdlIjoiIiwidGl0bGUiOiJCbGFuayIsInVybCI6Imh0dHA6Ly8xOTIuMTY4LjMuMjQ3OjQ4MDgwL2V4YW1wbGUvZWRpdG9yP2ZpbGVFeHQ9ZG9jeCZ1c2VyaWQ9dWlkLTEmdHlwZT1kZXNrdG9wJmxhbmc9ZW4ifSx7ImltYWdlIjoiaHR0cDovLzE5Mi4xNjguMy4yNDc6NDgwODAvZXhhbXBsZS9pbWFnZXMvZmlsZV9kb2N4LnN2ZyIsInRpdGxlIjoiV2l0aCBzYW1wbGUgY29udGVudCIsInVybCI6Imh0dHA6Ly8xOTIuMTY4LjMuMjQ3OjQ4MDgwL2V4YW1wbGUvZWRpdG9yP2ZpbGVFeHQ9ZG9jeCZ1c2VyaWQ9dWlkLTEmdHlwZT1kZXNrdG9wJmxhbmc9ZW4mc2FtcGxlPXRydWUifV0sInVzZXIiOnsiZ3JvdXAiOiIiLCJpZCI6InVpZC0xIiwibmFtZSI6IkpvaG4gU21pdGgifX0sImhlaWdodCI6IjEwMCUiLCJ0b2tlbiI6IiIsInR5cGUiOiJkZXNrdG9wIiwid2lkdGgiOiIxMDAlIiwiaWF0IjoxNjk3NTk3NjgzLCJleHAiOjE2OTc1OTc5ODN9.6wOlc5j84JGfhCEN7QyJ220rnYN9_dqxOEgXqVXgcsE",
  type: "desktop",
  width: "100%",
};

const config = {
  document: {
    fileType: "docx",
    key: "rjrjrjrjrjrjrj",
    title: "Example Document Title.docx",
    title: "new.docx",
    // url: "http://192.168.3.76:54737/L016.docx",
    // url: "/static/L016.docx",
    // url: "http://192.168.3.247:48080/example/download?fileName=new.docx&useraddress=192.168.3.76:5173/static/L016.docx",
    url: "http://192.168.3.247:48080/example/download?fileName=L016.docx&useraddress=192.168.3.76",
    permissions: {
      chat: true,
      comment: true,
      copy: true,
      download: true,
      edit: true,
      fillForms: true,
      modifyContentControl: true,
      modifyFilter: true,
      print: true,
      review: true,
      reviewGroups: null,
      commentGroups: {},
      userInfoGroups: null,
      protect: true,
    },
  },
  documentType: "word",
  height: "100%",
  width: "100%",
  token: "",
};

let docEditor = null;

function initDoc() {
  docEditor = new DocsAPI.DocEditor("content", config);
}

onMounted(() => {
  initDoc();
});

// const agc = { "document": {
//     "fileType": "docx",
//     "key": "rjrjrjrjrjrjrj",
//     "title": "Example Document Title.docx",
//     "title": "new.docx",
//     "url": "http://192.168.3.247:48080/example/download?fileName=new.docx&useraddress=192.168.3.76",
//     "permissions": {
//       "chat": true,
//       "comment": true,
//       "copy": true,
//       "download": true,
//       "edit": true,
//       "fillForms": true,
//       "modifyContentControl": true,
//       "modifyFilter": true,
//       "print": true,
//       "review": true,
//       "reviewGroups": null,
//       "commentGroups": {},
//       "userInfoGroups": null,
//       "protect": true
//     }
//   },
//   "documentType": "word",
//   "token": "",
//   "height": "100%",
//   "width": "100%",
//   "iat": 1697597683,
//   "exp": 1703952000
// }
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
