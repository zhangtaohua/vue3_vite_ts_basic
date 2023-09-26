/**
 * @description menu 设置函数
 * @author RJ(zthvivid@163.com)
 */
import BaseModalMenu from "../../modalMenu/baseModalMenu";

import wangOlModel from "@/views/report/components/wangOlModel.vue";
// import { genConvertToOlMapConfig } from "./config";

export const OlMapModalMenuKey = "RjOlMapModalMenuConf";

export const OlMapModalMenuConf = {
  key: OlMapModalMenuKey,
  factory() {
    return new BaseModalMenu("OL MAP", wangOlModel, {
      vNodeData: {},
    });
  },

  // 默认的菜单菜单配置，将存储在 editorConfig.MENU_CONF[key] 中
  // 创建编辑器时，可通过 editorConfig.MENU_CONF[key] = {...} 来修改
  // config: genConvertToOlMapConfig(),
};
