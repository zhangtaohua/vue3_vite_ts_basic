import { createApp } from "vue";
import "@/assets/style/font.scss";
import "@/assets/style/normalize.css";
import "@/assets/style/base.scss";
import "@/assets/style/flex.scss";
import "@/assets/style/general.scss";
import "@/assets/style/size.scss";
import "@/assets/style/mpgap.scss";
import "@/assets/style/reset.scss";
import "@/assets/style/wangEditor.scss";
import "@/assets/style/olCustomStyle.scss";
import "@/utils/map/ol/olGlobalStyle.css";

import App from "./App.vue";
import router from "@/router";
import { createPinia } from "pinia";

createApp(App).use(router).use(createPinia()).mount("#app");
