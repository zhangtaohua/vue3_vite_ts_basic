export const simpleLineOptions = {
  xAxis: {
    type: "category",
    name: "",
    data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  yAxis: {
    type: "value",
    name: "",
  },
  tooltip: {
    show: true,
    trigger: "axis",
  },
  series: [
    {
      name: "line1",
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: "line",
      smooth: true,
    },
  ],
};

export enum EchartsLineType {
  smooth = 1,
  polyline,
}

export const simpleLineTypeOptions = [
  { label: "光滑", value: EchartsLineType.smooth },
  { label: "拆线", value: EchartsLineType.polyline },
];

export enum EchartsXYSwap {
  yes = 1,
  no = 0,
}

export const echartsXYOptions = [
  { label: "是", value: EchartsXYSwap.yes },
  { label: "否", value: EchartsXYSwap.no },
];

export const lineSeriesOptions = {
  name: "",
  data: [820, 932, 901, 934, 1290, 1330, 1320],
  type: "line",
  smooth: true,
};

// 我是标题
// 我是图注呀
// a, b, c, d, d, f, g
// 8, 9, 12, 7, 5, 8, 9
