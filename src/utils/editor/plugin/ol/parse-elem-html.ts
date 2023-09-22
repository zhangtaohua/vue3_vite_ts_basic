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
import { OlMapElement } from "./custom-types";

function parseHtml(elem: DOMElement, children: SlateDescendant[], editor: IDomEditor): SlateElement {
  const link = elem.getAttribute("data-link") || "";
  const title = elem.getAttribute("data-title") || "";
  const geojson = elem.getAttribute("data-geojson") || "";
  return {
    type: "OL-MAP",
    link,
    title,
    geojson,
    children: [{ text: "" }], // void node 必须有一个空白 text
  } as OlMapElement;
}

const parseHtmlConf = {
  selector: 'div[data-w-e-type="OL-MAP"]',
  parseElemHtml: parseHtml,
};

export default parseHtmlConf;
