/**
 * @description elem to html 这是为了在调用 editor.getHtml() 获取的 正确的 HTML 元素
 * @author RJ(zthvivid@163.com)
 */

import { SlateElement } from "@wangeditor/editor";
import { OlMapElement } from "./custom-types";

// 生成 html 的函数
function olMapToHtml(elem: SlateElement, childrenHtml: string): string {
  const { title = "", link = "", geojson = "" } = elem as OlMapElement;
  const html = `<div data-w-e-type="link-card" data-w-e-is-void data-title="${title}" data-link="${link}" data-geojson="${geojson}">
    <div class="info-container">
      <div class="title-container"><p>${title}</p></div>
      <div class="link-container"><span>${link}</span></div>
    </div>
    <div class="icon-container">
      <img src="${geojson}"/>
    </div>
  </div>`;
  return html;
}

// 配置
const conf = {
  type: "OL-MAP", // 节点 type ，重要！！！
  elemToHtml: olMapToHtml,
};

export default conf;
