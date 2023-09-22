export const simpleScatterOptions = {
  dataset: [],
  xAxis: {
    splitLine: {
      lineStyle: {
        type: "dashed",
      },
    },
  },
  yAxis: {
    splitLine: {
      lineStyle: {
        type: "dashed",
      },
    },
  },
  tooltip: {
    trigger: "axis",
  },
  series: [],
};

export enum EchartsRegressionType {
  nonen,
  linear,
  exponential,
  logarithmic,
  polynomial_2,
  polynomial_3,
  polynomial_4,
  polynomial_5,
}

export const simpleRegressionTypeOptions = [
  { label: "否", value: EchartsRegressionType.nonen },
  { label: "线性回归", value: EchartsRegressionType.linear },
  { label: "二次回归", value: EchartsRegressionType.polynomial_2 },
  { label: "三次回归", value: EchartsRegressionType.polynomial_3 },
  { label: "四次回归", value: EchartsRegressionType.polynomial_4 },
  { label: "五次回归", value: EchartsRegressionType.polynomial_5 },
  { label: "指数回归", value: EchartsRegressionType.exponential },
  { label: "对数回归", value: EchartsRegressionType.logarithmic },
];

export const linearDatasetOptions = {
  transform: {
    type: "ecStat:regression",
    // 'linear' by default.
    // config: { method: 'linear', formulaOn: 'end'}
  },
};

export const polynomial2DatasetOptions = {
  transform: {
    type: "ecStat:regression",
    config: { method: "polynomial", order: 2 },
  },
};

export const polynomial3DatasetOptions = {
  transform: {
    type: "ecStat:regression",
    config: { method: "polynomial", order: 3 },
  },
};

export const polynomial4DatasetOptions = {
  transform: {
    type: "ecStat:regression",
    config: { method: "polynomial", order: 4 },
  },
};

export const polynomial5DatasetOptions = {
  transform: {
    type: "ecStat:regression",
    config: { method: "polynomial", order: 5 },
  },
};

export const exponentialDatasetOptions = {
  transform: {
    type: "ecStat:regression",
    config: {
      method: "exponential",
      // 'end' by default
      // formulaOn: 'start'
    },
  },
};

export const logarithmicDatasetOptions = {
  transform: {
    type: "ecStat:regression",
    config: {
      method: "logarithmic",
    },
  },
};

export const regressionDatasetOptions = {
  [EchartsRegressionType.linear]: linearDatasetOptions,
  [EchartsRegressionType.polynomial_2]: polynomial2DatasetOptions,
  [EchartsRegressionType.polynomial_3]: polynomial3DatasetOptions,
  [EchartsRegressionType.polynomial_4]: polynomial4DatasetOptions,
  [EchartsRegressionType.polynomial_5]: polynomial5DatasetOptions,
  [EchartsRegressionType.logarithmic]: logarithmicDatasetOptions,
  [EchartsRegressionType.exponential]: exponentialDatasetOptions,
};

export const scatterSeriesNormalOptions = {
  name: "scatter",
  type: "scatter",
  datasetIndex: 0,
};

export const scatterSeriesLineOptions = {
  name: "line",
  type: "line",
  smooth: true,
  datasetIndex: 1,
  symbolSize: 0.1,
  symbol: "circle",
  label: { show: true, fontSize: 16 },
  labelLayout: { dx: -20 },
  encode: { label: 2, tooltip: 1 },
};
