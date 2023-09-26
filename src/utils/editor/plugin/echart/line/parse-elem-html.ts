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
import { wangEditorEchartLineType, EchartLineElement } from "./custom-types";

function parseHtml(elem: DOMElement, children: SlateDescendant[], editor: IDomEditor): SlateElement {
  const title = elem.getAttribute("data-title") || "";
  const name = elem.getAttribute("data-name") || "";
  let chart = elem.getAttribute("data-chart") || "";
  console.log("parseHtml", title, name, chart);
  if (typeof chart == "string") {
    chart = chart.replaceAll("'", '"');
    chart = JSON.parse(chart);
  }
  return {
    type: wangEditorEchartLineType,
    title,
    name,
    chart,
    children: [{ text: "" }], // void node 必须有一个空白 text
  } as EchartLineElement;
}

const parseHtmlConf = {
  selector: `div[data-w-e-type="${wangEditorEchartLineType}"]`,
  parseElemHtml: parseHtml,
};

export default parseHtmlConf;
