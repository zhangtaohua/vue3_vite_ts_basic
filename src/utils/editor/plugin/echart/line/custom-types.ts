/**
 * @description RJ-ECHART-LINE element
 * @author RJ(zthvivid@163.com)
 */

type EmptyText = {
  text: "";
};

export type EchartCtxStyle = {
  width?: string;
  height?: string;
};

export const wangEditorEchartLineType = "RJ-ECHART-LINE";

export type EchartLineElement = {
  type: "RJ-ECHART-LINE";
  title?: string;
  name?: string;
  chart: any;
  style?: EchartCtxStyle;
  echartIns?: any;
  children: EmptyText[]; // void 元素必须有一个空 text
};
