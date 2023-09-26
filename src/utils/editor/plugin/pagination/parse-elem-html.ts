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
import { wangEditorPaginationType, PaginationElement } from "./custom-types";

function parseHtml(elem: DOMElement, children: SlateDescendant[], editor: IDomEditor): SlateElement {
  const page = elem.getAttribute("data-page") || 1;
  const width = elem.getAttribute("data-width") || 0;
  const height = elem.getAttribute("data-height") || 0;
  return {
    type: wangEditorPaginationType,
    page,
    width,
    height,
    children: [{ text: "" }], // void node 必须有一个空白 text
  } as PaginationElement;
}

const parseHtmlConf = {
  selector: `div[data-w-e-type="${wangEditorPaginationType}"]`,
  parseElemHtml: parseHtml,
};

export default parseHtmlConf;
