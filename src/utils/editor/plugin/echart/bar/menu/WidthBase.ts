/**
 * @description Echart width base class
 * @author RJ(zthvivid@163.com)
 */

import { Transforms, Node } from "slate";
import { IButtonMenu, IDomEditor, DomEditor } from "@wangeditor/core";
import { wangEditorEchartBarType, EchartBarElement } from "../custom-types";
import { A4EditorWidthPixel, A4EditorHeightPixel } from "../../../../common/constant";

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
    return DomEditor.getSelectedNodeByType(editor, wangEditorEchartBarType);
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

    const { style = {} } = echartNode as EchartBarElement;
    const maxWidth = Math.floor(A4EditorWidthPixel * 0.965);
    const maxHeight = Math.floor(A4EditorHeightPixel * 0.965);
    let width = this.value;
    let height = this.value;
    if (this.value == "WP") {
      if (style && style.width && style.height) {
        let tempWidth = parseFloat(style.width);
        if (!isNaN(tempWidth)) {
          tempWidth = tempWidth + 10;
        }
        if (tempWidth > maxWidth) {
          tempWidth = maxWidth;
        }
        width = tempWidth + "px";
        height = style.height;
      } else {
        width = maxWidth + "px";
        height = maxWidth + "px";
      }
    } else if (this.value == "HP") {
      if (style && style.width && style.height) {
        let tempHeight = parseFloat(style.height);
        if (!isNaN(tempHeight)) {
          tempHeight = tempHeight + 10;
        }
        if (tempHeight > maxHeight) {
          tempHeight = maxHeight;
        }
        height = tempHeight + "px";
        width = style.width;
      } else {
        width = maxWidth + "px";
        height = maxWidth + "px";
      }
    } else if (this.value == "WM") {
      if (style && style.width && style.height) {
        let tempWidth = parseFloat(style.width);
        if (!isNaN(tempWidth)) {
          tempWidth = tempWidth - 10;
        }
        if (tempWidth <= 100) {
          tempWidth = 100;
        }
        width = tempWidth + "px";
        height = style.height;
      } else {
        width = 100 + "px";
        height = 100 + "px";
      }
    } else if (this.value == "HM") {
      if (style && style.width && style.height) {
        let tempHeight = parseFloat(style.height);
        if (!isNaN(tempHeight)) {
          tempHeight = tempHeight - 10;
        }
        if (tempHeight <= 100) {
          tempHeight = 100;
        }
        height = tempHeight + "px";
        width = style.width;
      } else {
        width = 100 + "px";
        height = 100 + "px";
      }
    }
    const props: Partial<EchartBarElement> = {
      style: {
        ...style,
        width: width, // 修改 width
        height: height, // 清空 height
      },
    };

    Transforms.setNodes(editor, props, {
      match: (n: any) => DomEditor.checkNodeType(n, wangEditorEchartBarType),
    });
  }
}

export default EchartWidthBaseClass;
