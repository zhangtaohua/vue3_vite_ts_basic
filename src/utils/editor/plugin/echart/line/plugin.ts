/**
 * @description echart-line plugin
 * @author RJ(zthvivid@163.com)
 */

import { DomEditor, IDomEditor, SlateTransforms } from "@wangeditor/editor";
import { wangEditorEchartLineType, EchartLineElement } from "./custom-types";

function withOlMap<T extends IDomEditor>(editor: T) {
  const { isInline, isVoid, normalizeNode } = editor;
  const newEditor = editor;

  // 重写 isInline
  newEditor.isInline = (elem: any) => {
    const type = DomEditor.getNodeType(elem);
    if (type === wangEditorEchartLineType) {
      // 针对 type: RJ-OL-MAP ，设置为 not inline
      return false;
    }
    return isInline(elem);
  };

  // 重写 isVoid
  newEditor.isVoid = (elem: any) => {
    const type = DomEditor.getNodeType(elem);
    if (type === wangEditorEchartLineType) {
      return true;
    }

    return isVoid(elem);
  };

  // 重新 normalize
  newEditor.normalizeNode = ([node, path]) => {
    // console.log("normalizeNode", node, path);
    const type = DomEditor.getNodeType(node);
    if (type !== wangEditorEchartLineType) {
      // 未命中 RJ-OL-MAP ，执行默认的 normalizeNode
      return normalizeNode([node, path]);
    }

    // editor 顶级 node
    const topLevelNodes = newEditor.children || [];

    // --------------------- RJ-OL-MAP 后面必须跟一个 p header blockquote（否则后面无法继续输入文字） ---------------------
    const nextNode = topLevelNodes[path[0] + 1] || {};
    const nextNodeType = DomEditor.getNodeType(nextNode);
    if (nextNodeType !== "paragraph" && nextNodeType !== "blockquote" && !nextNodeType.startsWith("header")) {
      // RJ-OL-MAP node 后面不是 p 或 header ，则插入一个空 p
      const p = { type: "paragraph", children: [{ text: "" }] };
      const insertPath = [path[0] + 1];
      SlateTransforms.insertNodes(newEditor, p, {
        at: insertPath, // 在 RJ-OL-MAP 后面插入
      });
    }
  };

  return newEditor;
}

export default withOlMap;
