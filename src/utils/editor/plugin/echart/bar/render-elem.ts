/**
 * @description render elem 这是为了editor.insertNode("RJ-OL-MAP") 生效
 * @author RJ(zthvivid@163.com)
 */

import { Transforms } from "slate";
import { h, VNode } from "snabbdom";
import { DomEditor, IDomEditor, SlateElement } from "@wangeditor/editor";
import { wangEditorEchartBarType, EchartBarElement } from "./custom-types";

import { nanoid } from "nanoid";
import lodash from "lodash";

import EchartBase from "../core/base";

import EchartsErrorNoData from "../../../../../components/echarts/EchartsErrorNoData.vue";
import EchartsOptionBasePlus from "../../../../../components/echarts/EchartsOptionBasePlus.vue";

import { EchartsBarType, simpleBarOptions, barSeriesOptions } from "../../../../../common/echarts/barOptions";

import { A4EditorWidthPixel } from "../../../common/constant";

interface IEchartSize {
  width?: string;
  height?: string;
}

function checkUpdateEchartsOptions(newData: any, oldData: any): boolean {
  if (!oldData) {
    return true;
  } else {
    const xKeys = ["stack_type", "xaxis_data", "xaxis_name", "xaxis_unit"];
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

function updateEchartsOptions(newBarData: any, oldBarData: any) {
  // 这样判断也不好，最好是看看能不能分开
  // 不然每输入一个字都会来判断一下。
  if (!newBarData) {
    return {
      isHasData: false,
      options: null,
    };
  }
  const isNeedRePaint = checkUpdateEchartsOptions(newBarData, oldBarData);
  if (isNeedRePaint) {
    const { stack_type, xaxis_name, xaxis_data, xaxis_unit, yaxis } = newBarData;
    if (xaxis_data && yaxis.length && yaxis[0].data) {
      const options = lodash.cloneDeep(simpleBarOptions);
      const xaxis_array = xaxis_data.split(",");
      options.xAxis.data = xaxis_array;

      for (let i = 0; i < yaxis.length; i++) {
        const yaxisTemp = yaxis[i].data.split(",");
        let yaxisName = yaxis[i].data;
        if (!yaxisName) {
          yaxisName = `bar${i + 1}`;
        }
        // 如果Y 轴数据多于一条，就要插入更多的series 系列
        if (i > 0) {
          const barSeriesTemp = lodash.cloneDeep(barSeriesOptions);
          options.series.push(barSeriesTemp);
        }
        options.series[i].data = yaxisTemp;
        options.series[i].name = yaxisName;
        if (stack_type == EchartsBarType.stack) {
          options.series[i].stack = "total";
        }
      }
      return {
        isHasData: true,
        options: options,
      };
    } else {
      return {
        isHasData: false,
        options: null,
      };
    }
  } else {
    return null;
  }
}

function renderEchartBar(elem: SlateElement, children: VNode[] | null, editor: IDomEditor): VNode {
  const selected = DomEditor.isNodeSelected(editor, elem); // 当前节点是否选中
  const { title = "", name = "", chart = null, style = {} } = elem as EchartBarElement;
  const { width = "", height = "" } = style;
  // DomEditor.getSelectedNodeByType(editor, wangEditorEchartBarType)

  // echarts 部分
  const echartId = `rj_echart_outbox_${nanoid(10)}`;
  console.log("width", style, width, height, chart, style);

  const barStyle: any = {};
  if (width) {
    barStyle.width = width;
  } else {
    barStyle.width = Math.floor(A4EditorWidthPixel * 0.965) + "px";
  }

  if (height) {
    barStyle.height = height;
  } else {
    barStyle.height = Math.floor(A4EditorWidthPixel * 0.965) + "px";
  }

  const echartVnode = h("div", {
    props: {
      id: echartId,
      className: "row_nw_center_center",
    },
    style: barStyle,
    hook: {
      insert: (vnode: any) => {
        console.log("insert hook", vnode);
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
        console.log("vnode,", echartId, id, oldchart, echartIns);
        if (id) {
          if (!echartIns) {
            echartIns = new EchartBase(id, {});
            vnode.data.props.echartIns = echartIns;
          }

          const newOptions = updateEchartsOptions(chart, oldchart);
          if (newOptions) {
            echartIns.renderEchart(EchartsOptionBasePlus, newOptions, editor, selected, wangEditorEchartBarType);
          } else {
            echartIns.renderError(EchartsErrorNoData, {});
          }
          // 保留旧数据
          vnode.data.props.oldchart = chart;
        }
      },
      prepatch: (oldVnode: any, vnode: any) => {
        console.log("prepatch hook", oldVnode, vnode, chart);
        if (oldVnode && oldVnode.data && oldVnode.data.props && oldVnode.data.props.echartIns) {
          vnode.data.props.echartIns = oldVnode.data.props.echartIns;
        }
        if (oldVnode && oldVnode.data && oldVnode.data.props && oldVnode.data.props.oldchart) {
          vnode.data.props.oldchart = oldVnode.data.props.oldchart;
        }
      },
      update: (oldVnode: any, vnode: any) => {
        let echartIns = null;
        if (vnode && vnode.data && vnode.data.props && vnode.data.props.echartIns) {
          echartIns = vnode.data.props.echartIns;
        }

        let oldchart = null;
        if (vnode && vnode.data && vnode.data.props && vnode.data.props.oldchart) {
          oldchart = vnode.data.props.oldchart;
        }

        let id = "";
        if (vnode && vnode.data && vnode.data.props && vnode.data.props.id) {
          id = vnode.data.props.id;
        }

        const newOptions = updateEchartsOptions(chart, oldchart);
        console.log("update hook", echartIns, oldchart, chart, newOptions);
        if (newOptions) {
          if (echartIns) {
            echartIns.destructor();

            echartIns = new EchartBase(id, {});
            vnode.data.props.echartIns = echartIns;
            echartIns.renderEchart(EchartsOptionBasePlus, newOptions, editor, selected, wangEditorEchartBarType);

            vnode.data.props.oldchart = chart;
            // if (selected) {
            //   echartIns.setCanResize(true);
            // } else {
            //   echartIns.setCanResize(false);
            // }
          }
        } else {
          if (echartIns) {
            echartIns.resizeEchart();
            // if (selected) {
            //   echartIns.setCanResize(true);
            // } else {
            //   echartIns.setCanResize(false);
            // }
          }
        }
      },
      destroy: (vnode: any) => {
        console.log("destroy hook", vnode);
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
  rendNodeArr.push(echartVnode);

  let vnode = null;
  const echartContainerId = `rj_echart_container_${nanoid(10)}`;
  // 选中时渲染
  if (selected) {
    console.log("选中时渲染", selected);
    vnode = h(
      "div",
      {
        props: {
          contentEditable: false,
          className: "row_nw_center_center rj_echart_container",
        },
        // style: barStyle,
        dataset: {
          selected: selected ? "true" : "", // 标记为 选中
        },
        // on: {
        //   mousedown: (event: any) => event.preventDefault(),
        // },
      },
      rendNodeArr,
    );
  } else {
    console.log("没有 选中时渲染", selected);
    vnode = h(
      "div",
      {
        props: {
          id: echartContainerId,
          contentEditable: false,
          className: "row_nw_center_center rj_echart_container",
        },
        // style: barStyle,
        dataset: {
          selected: selected ? "true" : "", // 标记为 选中
        },
        // on: {
        //   mousedown: (event: any) => event.preventDefault(),
        // },
      },
      rendNodeArr,
    );
  }

  console.log("renderEchartBar", vnode);

  return vnode;
}

const conf = {
  type: wangEditorEchartBarType, // 节点 type ，重要！！！
  renderElem: renderEchartBar,
};

export default conf;
