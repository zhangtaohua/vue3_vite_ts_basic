/**
 * @description render elem 这是为了editor.insertNode("RJ-OL-MAP") 生效
 * @author RJ(zthvivid@163.com)
 */

import { h, VNode } from "snabbdom";
import { DomEditor, IDomEditor, SlateElement } from "@wangeditor/editor";
import { wangEditorEchartLineType, EchartLineElement } from "./custom-types";

import { nanoid } from "nanoid";
import lodash from "lodash";

import EchartBase from "../core/base";

import EchartsErrorNoData from "../../../../../components/echarts/EchartsErrorNoData.vue";
import { EchartsLineType, simpleLineOptions, lineSeriesOptions } from "../../../../../common/echarts/lineOptions";

const DEFAULT_ICON_IMG_SRC =
  "data:image/png;base64,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";

function checkUpdateEchartsOptions(newData: any, oldData: any): boolean {
  if (!oldData) {
    return true;
  } else {
    const xKeys = ["line_type", "xaxis_data", "xaxis_name", "xaxis_unit"];
    const yKeys = ["data", "name", "unit"];
    for (let i = 0; i < xKeys.length; i++) {
      const compKey = xKeys[i];
      if (newData[compKey] != oldData[compKey]) {
        return true;
      }
    }
    const yNewData = newData.yaxis;
    const yOldData = oldData.yaxis;
    if (!yOldData.length) {
      return true;
    } else if (yNewData.length != yOldData.length) {
      return true;
    }
    for (let ind = 0; ind < yNewData.length; ind++) {
      for (let i = 0; i < yKeys.length; i++) {
        const compKey = yKeys[i];
        if (yNewData[ind][compKey] != yOldData[ind][compKey]) {
          return true;
        }
      }
    }
  }
  return false;
}

function updateEchartsOptions(newLineData: any, oldLineData: any) {
  // 这样判断也不好，最好是看看能不能分开
  // 不然每输入一个字都会来判断一下。
  if (!newLineData) {
    return {
      isHasData: false,
      options: null,
    };
  }
  const isNeedRePaint = checkUpdateEchartsOptions(newLineData, oldLineData);
  if (isNeedRePaint) {
    const { line_type, xaxis_name, xaxis_data, xaxis_unit, yaxis } = newLineData;
    if (xaxis_data && yaxis.length && yaxis[0].data) {
      const options = lodash.cloneDeep(simpleLineOptions);
      const xaxis_array = xaxis_data.split(",");
      options.xAxis.data = xaxis_array;

      for (let i = 0; i < yaxis.length; i++) {
        const yaxisTemp = yaxis[i].data.split(",");
        let yaxisName = yaxis[i].data;
        if (!yaxisName) {
          yaxisName = `line${i + 1}`;
        }
        // 如果Y 轴数据多于一条，就要插入更多的series 系列
        if (i > 0) {
          const lineSeriesTemp = lodash.cloneDeep(lineSeriesOptions);
          options.series.push(lineSeriesTemp);
        }
        options.series[i].data = yaxisTemp;
        options.series[i].name = yaxisName;
        if (line_type == EchartsLineType.polyline) {
          options.series[i].smooth = false;
        }
      }
      return {
        isHasData: true,
        options: options,
      };
    } else {
      console.log("不是应该来这里嘛");
      return {
        isHasData: false,
        options: null,
      };
    }
  }
}

function renderEchartLine(elem: SlateElement, children: VNode[] | null, editor: IDomEditor): VNode {
  const selected = DomEditor.isNodeSelected(editor, elem); // 当前节点是否选中
  const { title, name, chart } = elem as EchartLineElement;
  // const oldHtml = editor.getHtml();

  // 文字部分
  let titleVnode = null;
  if (title) {
    titleVnode = h(
      "p",
      {
        props: {
          className: "row_nw_fs_center rj_echart_title_box",
        },
      },
      [h("span", {}, "title")],
    );
  }

  // echarts 部分
  const echartId = `echart_box_${nanoid(10)}`;
  const echartIns: EchartBase = null;

  const echartVnode = h("div", {
    props: {
      id: echartId,
      className: "rj_echart_pic_box",
    },
    hook: {
      insert: (vnode: any) => {
        // 这是可以处理一些逻辑
        let id = "";
        if (vnode && vnode.data && vnode.data.props && vnode.data.props.id) {
          id = vnode.data.props.id;
        }

        let oldchart = null;
        if (vnode && vnode.data && vnode.data.props && vnode.data.props.oldchart) {
          oldchart = vnode.data.props.oldchart;
        }

        let echartIns = null;
        if (vnode && vnode.data && vnode.data.props && vnode.data.props.echartIns) {
          echartIns = vnode.data.props.echartIns;
        }
        if (id) {
          if (!echartIns) {
            echartIns = new EchartBase(id, {});
            vnode.data.props.echartIns = echartIns;
          }

          const newOptions = updateEchartsOptions(chart, oldchart);
          if (newOptions.isHasData) {
            echartIns.updateOptions(newOptions.options);
          } else {
            echartIns.renderError(EchartsErrorNoData, {});
          }
          // 保留旧数据
          vnode.data.props.oldchart = chart;
        }
      },
      destroy: (vnode: any) => {
        let echartIns = null;
        if (vnode && vnode.data && vnode.data.props && vnode.data.props.echartIns) {
          echartIns = vnode.data.props.echartIns;
          echartIns.destructor();
        }
      },
    },
  });

  // 容器
  const rendNodeArr: any = [];

  if (titleVnode) {
    rendNodeArr.push(titleVnode);
  }
  rendNodeArr.push(echartVnode);

  const vnode = h(
    "div",
    {
      props: {
        contentEditable: false,
        className: "rj_echart_container",
      },
      dataset: {
        selected: selected ? "true" : "", // 标记为 选中
      },
      on: {
        mousedown: (event: any) => event.preventDefault(),
      },
    },
    rendNodeArr,
  );

  console.log("render EchartLine", vnode);

  return vnode;
}

const conf = {
  type: wangEditorEchartLineType, // 节点 type ，重要！！！
  renderElem: renderEchartLine,
};

export default conf;
