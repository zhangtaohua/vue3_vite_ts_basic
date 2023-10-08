/**
 * @description RJ-ECHART-BAR element
 * @author RJ(zthvivid@163.com)
 */

type EmptyText = {
  text: "";
};

export type EchartCtxStyle = {
  width?: string;
  height?: string;
};

export const wangEditorEchartBarType = "RJ-ECHART-BAR";

export type EchartBarElement = {
  type: "RJ-ECHART-BAR";
  title?: string;
  name?: string;
  chart: any;
  style?: EchartCtxStyle;
  echartIns?: any;
  children: EmptyText[]; // void 元素必须有一个空 text
};
