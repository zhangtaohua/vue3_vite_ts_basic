/**
 * @description elem to html 这是为了在调用 editor.getHtml() 获取的 正确的 HTML 元素
 * @author RJ(zthvivid@163.com)
 */

import { SlateElement } from "@wangeditor/editor";
import { wangEditorEchartBarType, EchartBarElement } from "./custom-types";
import { A4EditorWidthPixel } from "../../../common/constant";

// 生成 html 的函数
function echartToHtml(elem: SlateElement, childrenHtml: string): string {
  const { title = "", name = "", chart = null, style = {} } = elem as EchartBarElement;
  let { width = "", height = "" } = style;

  const defaultWh = Math.floor(A4EditorWidthPixel * 0.965) + "px";
  if (!width) {
    width = defaultWh;
  }

  if (!height) {
    height = defaultWh;
  }

  let chartStr = JSON.stringify(chart);

  chartStr = chartStr.replaceAll('"', "'");
  console.log("echartToHtml", title, name, chart, chartStr);

  const html = `<div data-w-e-type="${wangEditorEchartBarType}" data-w-e-is-void 
  data-title="${title}" data-name="${name}" data-chart="${chartStr}"
  data-width="${width}" data-height="${height}"
  >
  </div>`;
  return html;
}

// 配置
const conf = {
  type: wangEditorEchartBarType, // 节点 type ，重要！！！
  elemToHtml: echartToHtml,
};

export default conf;
