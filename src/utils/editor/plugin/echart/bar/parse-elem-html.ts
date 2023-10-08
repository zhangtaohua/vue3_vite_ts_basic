/**
 * @description parse elem html
 * @author RJ(zthvivid@163.com)
 *
 * 通过 const html = editor.getHtml() 可以得到正确的 HTML ，
 * 但再去设置 HTML editor.setHtml(html) 却无效。
 * 所以这里 需要自定义解析 HTML 的逻辑。
 */

import { DOMElement } from "../utils/dom";
import { IDomEditor, SlateDescendant, SlateElement } from "@wangeditor/editor";
import { wangEditorEchartBarType, EchartBarElement } from "./custom-types";
import { A4EditorWidthPixel } from "../../../common/constant";

function parseHtml(elem: DOMElement, children: SlateDescendant[], editor: IDomEditor): SlateElement {
  const defaultWh = Math.floor(A4EditorWidthPixel * 0.965) + "px";

  const title = elem.getAttribute("data-title") || "";
  const name = elem.getAttribute("data-name") || "";
  let chart = elem.getAttribute("data-chart") || "";
  const width = elem.getAttribute("data-width") || defaultWh;
  const height = elem.getAttribute("data-height") || defaultWh;
  const style = {
    width,
    height,
  };
  console.log("parseHtml", title, name, chart, style);
  if (typeof chart == "string") {
    chart = chart.replaceAll("'", '"');
    chart = JSON.parse(chart);
  }
  return {
    type: wangEditorEchartBarType,
    title,
    name,
    chart,
    style,
    children: [{ text: "" }], // void node 必须有一个空白 text
  } as EchartBarElement;
}

const parseHtmlConf = {
  selector: `div[data-w-e-type="${wangEditorEchartBarType}"]`,
  parseElemHtml: parseHtml,
};

export default parseHtmlConf;
