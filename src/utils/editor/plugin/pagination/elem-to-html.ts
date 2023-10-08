/**
 * @description elem to html 这是为了在调用 editor.getHtml() 获取的 正确的 HTML 元素
 * @author RJ(zthvivid@163.com)
 */

import { SlateElement } from "@wangeditor/editor";
import { wangEditorPaginationType, PaginationElement } from "./custom-types";

// 生成 html 的函数
function paginationToHtml(elem: SlateElement, childrenHtml: string): string {
  const { page = 1, width = 0, height = 0 } = elem as PaginationElement;
  const html = `<div data-w-e-type=${wangEditorPaginationType} data-w-e-is-void data-page="${page}" 
  data-width="${width}" data-height="${height}"></div>`;
  return html;
}

// 配置
const conf = {
  type: wangEditorPaginationType, // 节点 type ，重要！！！
  elemToHtml: paginationToHtml,
};

export default conf;
