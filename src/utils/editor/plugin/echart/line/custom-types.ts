/**
 * @description RJ-OL-MAP element
 * @author RJ(zthvivid@163.com)
 */

type EmptyText = {
  text: "";
};

export const wangEditorEchartLineType = "RJ-ECHART-LINE";

export type EchartLineElement = {
  type: "RJ-ECHART-LINE";
  title: string;
  name: string;
  chart: any;
  children: EmptyText[]; // void 元素必须有一个空 text
};
