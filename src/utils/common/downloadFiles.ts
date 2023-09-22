import { nanoid } from "nanoid";
// @ts-ignore
import { saveAs } from "file-saver";
import axios from "axios";
import { message } from "ant-design-vue";

export function downloadFile(url: string, filename: string) {
  if (!url) return;
  const link = document.createElement("a"); //创建a标签
  link.style.display = "none"; //使其隐藏
  if (url.includes("?")) {
    url = url + `&uuid=${nanoid(12)}`;
  } else {
    url = url + `?uuid=${nanoid(12)}`;
  }
  link.href = url; //赋予文件下载地址
  link.setAttribute("download", filename); //设置下载属性 以及文件名
  document.body.appendChild(link); //a标签插至页面中
  link.click(); //强制触发a标签事件
  document.body.removeChild(link);
}

export function downDataModule(filename: string) {
  let baseUrl = "";
  if (window.__MICRO_APP_ENVIRONMENT__) {
    baseUrl = window.__MICRO_APP_PUBLIC_PATH__;
  } else {
    baseUrl = window.__MICRO_APP_BASE_ROUTE__ || process.env.BASE_URL;
  }
  if (baseUrl) {
    baseUrl = baseUrl.replace(/\/$/, "");
  }
  const link = document.createElement("a"); //创建a标签
  const url = `${baseUrl}/statis/dataModule/${filename}?uuid=${nanoid(12)}`;

  link.style.display = "none"; //使其隐藏
  link.href = url; //赋予文件下载地址
  link.setAttribute("download", filename); //设置下载属性 以及文件名
  document.body.appendChild(link); //a标签插至页面中
  link.click(); //强制触发a标签事件
  document.body.removeChild(link);
}

export function downloadPDF(url: string, filename: string) {
  const messageKey = "downloadPdfFiles";
  message.loading({
    content: "正在下载",
    key: messageKey,
  });
  axios({
    method: "get",
    url: url,
    responseType: "blob",
    // headers: { 'Authorization': 'Bearer ' + '' }
  }).then(async (res) => {
    const blob = new Blob([res.data], { type: "application/pdf" });
    saveAs(blob, filename);
    message.success({
      content: "下载完成",
      key: messageKey,
      duration: 2,
    });
  });
}
export function downloadZip(url: string, filename: string) {
  const messageKey = "downloadPdfFiles";
  message.loading({
    content: "正在下载",
    key: messageKey,
  });
  axios({
    method: "get",
    url: url,
    responseType: "blob",
    // headers: { 'Authorization': 'Bearer ' + '' }
  }).then(async (res) => {
    const blob = new Blob([res.data], { type: "application/zip" });
    saveAs(blob, filename);
    message.success({
      content: "下载完成",
      key: messageKey,
      duration: 2,
    });
  });
}
