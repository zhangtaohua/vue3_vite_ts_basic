/**
 * @description menu 设置函数
 * @author RJ(zthvivid@163.com)
 */
import BaseModalMenu from "../../../modalMenu/baseModalMenu";

import EchartsLine from "./EchartsLine.vue";

export const EchartLineMenuKey = "RjEchartLineMenuConf";

export const EchartLineMenuConf = {
  key: EchartLineMenuKey,
  factory() {
    return new BaseModalMenu("拆线图", EchartsLine, {
      vNodeData: {},
    });
  },
};
