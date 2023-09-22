export const reportsNameCode = {
  blank_bug_fixed: "rptm_0000", // 解决bug的
  rich_editor: "rptm_0100", // 富文本
  image_comparison: "rptm_0200", // 图像对比
  indicator: "rptm_0300", // 指标 暂未实现
  echarts: "rptm_0400", // echarts 大类
  image_annotation: "rptm_0500", // 影像标注 无实际内容，不会出现在报告中
  image_insertion: "rptm_0600", // 影像插入
  structured_data: "rptm_0700", // 结构化数据  暂未实现

  echarts_line: "rptm_0401", //  echarts 折线图
  echarts_bar: "rptm_0402", //  echarts 柱状图
  echarts_pie: "rptm_0403", //  echarts 饼图
  echarts_scatter: "rptm_0404", //  echarts 散点图
};

import {
  EditOutlined,
  FileImageOutlined,
  TableOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  DotChartOutlined,
  PictureOutlined,
  MacCommandOutlined,
  DatabaseOutlined,
} from "@ant-design/icons-vue";

// interface ReoprtMoudleInfo {
//   id: string;
//   name: string;
//   code: string;
//   icon: any;
// }

export type ReoprtMoudleInfo = {
  id: string;
  name: string;
  code: string;
  icon: any;
};
export const reportsModule = [
  {
    id: "rpm_01",
    name: "富文本",
    code: reportsNameCode.rich_editor,
    icon: EditOutlined,
    isEnable: true,
  },
  {
    id: "rpm_02",
    name: "图片对比",
    code: reportsNameCode.image_comparison,
    icon: FileImageOutlined,
    isEnable: true,
  },
  {
    id: "rpm_03",
    name: "指标",
    code: reportsNameCode.indicator,
    icon: TableOutlined,
    isEnable: false,
  },
  {
    id: "rpm_04",
    name: "折线图",
    code: reportsNameCode.echarts_line,
    icon: LineChartOutlined,
    isEnable: true,
  },
  {
    id: "rpm_05",
    name: "柱状图",
    code: reportsNameCode.echarts_bar,
    icon: BarChartOutlined,
    isEnable: true,
  },
  {
    id: "rpm_06",
    name: "饼图",
    code: reportsNameCode.echarts_pie,
    icon: PieChartOutlined,
    isEnable: true,
  },
  {
    id: "rpm_07",
    name: "散点图",
    code: reportsNameCode.echarts_scatter,
    icon: DotChartOutlined,
    isEnable: true,
  },
  {
    id: "rpm_08",
    name: "影像标注",
    code: reportsNameCode.image_annotation,
    icon: PictureOutlined,
    isEnable: true,
  },
  {
    id: "rpm_09",
    name: "影像插入",
    code: reportsNameCode.image_insertion,
    icon: MacCommandOutlined,
    isEnable: true,
  },
  {
    id: "rpm_10",
    name: "结构化数据",
    code: reportsNameCode.structured_data,
    icon: DatabaseOutlined,
    isEnable: false,
  },
];

export const reportsCodeModule = {
  [reportsNameCode.rich_editor]: reportsModule[0],
  [reportsNameCode.image_comparison]: reportsModule[1],
  [reportsNameCode.indicator]: reportsModule[2],
  [reportsNameCode.echarts]: {},
  [reportsNameCode.image_annotation]: reportsModule[7],
  [reportsNameCode.image_insertion]: reportsModule[8],
  [reportsNameCode.structured_data]: reportsModule[9],

  [reportsNameCode.echarts_line]: reportsModule[3],
  [reportsNameCode.echarts_bar]: reportsModule[4],
  [reportsNameCode.echarts_pie]: reportsModule[5],
  [reportsNameCode.echarts_scatter]: reportsModule[6],
};

export const reportsCodePlaceholder: any = {
  [reportsNameCode.rich_editor]: {
    code: reportsNameCode.rich_editor,
    title: "一、请编辑示例标题",
    html: "<p>请删除此条，并输入您的内容</p>",
  },
  [reportsNameCode.image_comparison]: {
    code: reportsNameCode.image_comparison,
  },
  [reportsNameCode.indicator]: {
    code: reportsNameCode.indicator,
  },
  [reportsNameCode.echarts]: {
    code: reportsNameCode.echarts,
  },
  [reportsNameCode.image_annotation]: {
    code: reportsNameCode.image_annotation,
  },
  [reportsNameCode.image_insertion]: {
    code: reportsNameCode.image_insertion,
  },
  [reportsNameCode.structured_data]: {
    code: reportsNameCode.structured_data,
  },

  [reportsNameCode.echarts_line]: {
    code: reportsNameCode.echarts_line,
  },
  [reportsNameCode.echarts_bar]: {
    code: reportsNameCode.echarts_bar,
  },
  [reportsNameCode.echarts_pie]: {
    code: reportsNameCode.echarts_pie,
  },
  [reportsNameCode.echarts_scatter]: {
    code: reportsNameCode.echarts_scatter,
  },
};

export const createReportMode: any = {
  report: 1, // 报告
  template: 2, // 模板
};
