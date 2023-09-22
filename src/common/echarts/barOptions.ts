export const simpleBarOptions = {
  xAxis: {
    type: "category",
    name: "",
    data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  yAxis: {
    type: "value",
    name: "",
  },
  series: [
    {
      name: "bar1",
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: "bar",
    },
  ],
};

export enum EchartsBarType {
  stack = 1,
  noStack,
}

export const simpleLineTypeOptions = [
  { label: "是", value: EchartsBarType.stack },
  { label: "否", value: EchartsBarType.noStack },
];

export const barSeriesOptions = {
  name: "",
  data: [820, 932, 901, 934, 1290, 1330, 1320],
  type: "bar",
};

// 我是标题
// 我是图注呀
// a, b, c, d, d, f, g
// 8, 9, 12, 7, 5, 8, 9
