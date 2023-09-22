export const simplePieOptions = {
  tooltip: {
    trigger: "item",
  },
  series: [],
};

export enum EchartsPieType {
  pie = 1,
  circle,
}

export const simplePieTypeOptions = [
  { label: "圆饼", value: EchartsPieType.pie },
  { label: "环形", value: EchartsPieType.circle },
];

export const pieSeriesOptions = {
  name: "",
  type: "pie",
  radius: "60%",
  data: [],
  emphasis: {
    itemStyle: {
      shadowBlur: 10,
      shadowOffsetX: 0,
      shadowColor: "rgba(0, 0, 0, 0.5)",
    },
  },
};

export const circleSeriesOptions = {
  name: "",
  type: "pie",
  radius: ["40%", "70%"],
  avoidLabelOverlap: false,
  label: {
    show: false,
    position: "center",
  },
  emphasis: {
    label: {
      show: false,
      fontSize: "40",
      fontWeight: "bold",
    },
  },
  labelLine: {
    show: false,
  },
  data: [],
};
