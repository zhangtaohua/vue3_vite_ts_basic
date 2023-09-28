/**
 * @description Echart width base class
 * @author RJ(zthvivid@163.com)
 */

import { Transforms, Node } from "slate";
import { IButtonMenu, IDomEditor, DomEditor } from "@wangeditor/core";
import { wangEditorEchartLineType, EchartLineElement } from "../custom-types";

abstract class EchartWidthBaseClass implements IButtonMenu {
  abstract readonly title: string; // 菜单标题
  readonly tag = "button";
  abstract readonly value: string; // css width 的值

  getValue(editor: IDomEditor): string | boolean {
    // 无需获取 val
    return "";
  }

  isActive(editor: IDomEditor): boolean {
    // 无需 active
    return false;
  }

  private getSelectedNode(editor: IDomEditor): Node | null {
    return DomEditor.getSelectedNodeByType(editor, wangEditorEchartLineType);
  }

  isDisabled(editor: IDomEditor): boolean {
    if (editor.selection == null) return true;

    const echartNode = this.getSelectedNode(editor);
    if (echartNode == null) {
      // 选区未处于 echart line node ，则禁用
      return true;
    }
    return false;
  }

  exec(editor: IDomEditor, value: string | boolean) {
    if (this.isDisabled(editor)) return;

    const echartNode = this.getSelectedNode(editor);
    if (echartNode == null) return;

    // 隐藏 hoverbar
    const hoverbar = DomEditor.getHoverbar(editor);
    if (hoverbar) hoverbar.hideAndClean();

    const { style = {} } = echartNode as EchartLineElement;
    const props: Partial<EchartLineElement> = {
      style: {
        ...style,
        width: this.value, // 修改 width
        height: this.value, // 清空 height
      },
    };

    Transforms.setNodes(editor, props, {
      match: (n: any) => DomEditor.checkNodeType(n, wangEditorEchartLineType),
    });
  }
}

export default EchartWidthBaseClass;
