import axios from "axios";
// import axios, { AxiosRequestConfig } from "axios";

import { LANGUAGE_ZH_CN } from "@/common/constant";
import { ElMessage } from "element-plus";
import globalUseVar from "@/utils/common/globalUseVar";
import { useUserStore } from "@/store/user";
const languageObj = {
  zh_CN: "zh-CN",
  zh_TW: "zh-TW",
  en: "en",
};

// create an axios instance
// language : zh-CN zh-TW en
let initLanguage: any = globalUseVar.local ? globalUseVar.local.value : LANGUAGE_ZH_CN;
initLanguage = languageObj[initLanguage];

const service = axios.create({
  baseURL: "", // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 60000, // request timeout
  headers: {
    "Accept-Language": initLanguage,
    "X-Language": initLanguage,
    // "X-User-Id": "rj_for_test_usre_id",
  },
});

service.interceptors.request.use(
  (config: any) => {
    const userStore = useUserStore();
    initLanguage = globalUseVar.local ? globalUseVar.local.value : LANGUAGE_ZH_CN;
    initLanguage = languageObj[initLanguage];
    // console.log("request Config", globalUseVar, initLanguage);
    config.headers = {
      ...config.headers,
      "Accept-Language": initLanguage,
      "X-Language": initLanguage,
      "x-token": userStore.token,
      Authorization: userStore.token,
    };
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  },
);

// response interceptor
service.interceptors.response.use(
  (response: any) => {
    const userStore = useUserStore();
    const res = response.data;
    // if the custom code is not 0, it is judged as an error.
    if (res.code && res.code !== 0) {
      // return Promise.reject(res.msg || "Error");
      if (res.msg) {
        ElMessage({
          showClose: true,
          message: res.msg,
          offset: 64,
          type: "error",
        });
      }

      if (res.code == 403 || (res.data && res.data.reload)) {
        userStore.token = "";
        localStorage.clear();
        userStore.setLoginStatus(true);
      }
    } else {
      return res;
    }
  },
  (error: any) => {
    console.error("response错误拦截：", error.message);
    if (error.message.indexOf("401") > -1) {
      console.log("error 401");
    }
    return Promise.reject(error);
  },
);

export default service;
