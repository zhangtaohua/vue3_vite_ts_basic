/**
 * @description render elem 这是为了editor.insertNode("OL-MAP") 生效
 * @author RJ(zthvivid@163.com)
 */

import { h, VNode } from "snabbdom";
import { DomEditor, IDomEditor, SlateElement } from "@wangeditor/editor";
import { wangEditorPaginationType, PaginationElement } from "./custom-types";

function renderPagination(elem: SlateElement, children: VNode[] | null, editor: IDomEditor): VNode {
  const selected = DomEditor.isNodeSelected(editor, elem); // 当前节点是否选中
  const { page, width, height } = elem as PaginationElement;

  const topBoxVnode = h("div", {
    props: {
      id: `rj_pagination_top_id_${page}`,
      contentEditable: false,
      className: "rj_pagination_top",
    },
  });

  const gapHeightVnode = h("div", {
    props: {
      contentEditable: false,
      className: "rj_pagination_adgap",
      style: `height: ${height}px`,
    },
  });

  const gapVnode = h("div", {
    props: {
      contentEditable: false,
      className: "rj_pagination_gap",
    },
  });

  const pageBreakVnode = h("div", {
    props: {
      contentEditable: false,
      className: "rj_pagination_page_break",
    },
  });

  // 容器
  const nextPageVnode = h(
    "div",
    {
      props: {
        id: `rj_pagination_next_id_${page}`,
        contentEditable: false,
        className: "col_nw_fs_fs rj_pagination_next",
      },
      dataset: {
        page: page,
      },
    },
    [gapHeightVnode, pageBreakVnode, gapVnode],
  );

  console.log("pagination vnode", topBoxVnode, nextPageVnode);
  if (page == 1) {
    return topBoxVnode;
  } else {
    return nextPageVnode;
  }
}

const conf = {
  type: wangEditorPaginationType, // 节点 type ，重要！！！
  renderElem: renderPagination,
};

export default conf;
