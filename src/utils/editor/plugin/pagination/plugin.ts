/**
 * @description RJ-PAGINATION plugin
 * @author RJ(zthvivid@163.com)
 */

import { Editor, Point } from "slate";
import { DomEditor, IDomEditor, SlateTransforms } from "@wangeditor/editor";
import { wangEditorPaginationType } from "./custom-types";

function deleteHandler(newEditor: IDomEditor): boolean {
  const { selection } = newEditor;
  if (selection == null) return false;

  const [cellNodeEntry] = Editor.nodes(newEditor, {
    match: (n: any) => {
      return DomEditor.checkNodeType(n, wangEditorPaginationType);
    },
  });

  if (cellNodeEntry) {
    const [, cellPath] = cellNodeEntry;
    const start = Editor.start(newEditor, cellPath);
    if (Point.equals(selection.anchor, start)) {
      return true; // 阻止删除 cell
    }
  }

  return false;
}

function withPagination<T extends IDomEditor>(editor: T) {
  const { isInline, isVoid, normalizeNode, deleteBackward, deleteForward } = editor; // 获取当前 editor API
  const newEditor = editor;

  // 重写 isInline
  newEditor.isInline = (elem: any) => {
    const type = DomEditor.getNodeType(elem);
    if (type === wangEditorPaginationType) {
      return false;
    }
    return isInline(elem);
  };

  // 重写 isVoid
  newEditor.isVoid = (elem: any) => {
    const type = DomEditor.getNodeType(elem);
    if (type === wangEditorPaginationType) {
      return true;
    }

    return isVoid(elem);
  };

  // 重新 normalize
  newEditor.normalizeNode = ([node, path]) => {
    const type = DomEditor.getNodeType(node);
    if (type !== wangEditorPaginationType) {
      // 未命中，执行默认的 normalizeNode
      return normalizeNode([node, path]);
    }

    // editor 顶级 node
    const topLevelNodes = newEditor.children || [];

    // --------------------- 后面必须跟一个 p header blockquote（否则后面无法继续输入文字） ---------------------
    const nextNode = topLevelNodes[path[0] + 1] || {};
    const nextNodeType = DomEditor.getNodeType(nextNode);
    if (nextNodeType !== "paragraph" && nextNodeType !== "blockquote" && !nextNodeType.startsWith("header")) {
      //node 后面不是 p 或 header ，则插入一个空 p
      const p = { type: "paragraph", children: [{ text: "" }] };
      const insertPath = [path[0] + 1];
      SlateTransforms.insertNodes(newEditor, p, {
        at: insertPath, // 在后面插入
      });
    }
  };

  // 重写 insertBreak 换行
  // newEditor.insertBreak = () => {
  //   // if: 是 ctrl + enter ，则执行 insertBreak
  //   insertBreak();

  //   // else: 则不执行换行
  //   return;
  // };

  // 重写 deleteBackward 向后删除
  newEditor.deleteBackward = (unit: any) => {
    const res = deleteHandler(newEditor);
    if (res) {
      return;
    } // 命中结果，则 return

    // 执行默认的删除
    deleteBackward(unit);
  };

  newEditor.deleteForward = (unit: any) => {
    const res = deleteHandler(newEditor);
    if (res) {
      return;
    } // 命中结果，则 return

    // 执行默认的删除
    deleteForward(unit);
  };

  return newEditor;
}

export function withBreakAndDelete<T extends IDomEditor>(editor: T): T {
  // 重写其他 API ...

  // 返回 newEditor ，重要！
  return newEditor;
}

export default withPagination;
