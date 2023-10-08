/**
 * @description delete echart menu
 * @author RJ(zthvivid@163.com)
 */

import { Transforms } from "slate";
import { IButtonMenu, IDomEditor, DomEditor, t } from "@wangeditor/core";
import { TRASH_SVG } from "../../../../common/constant";
import { wangEditorEchartBarType, EchartBarElement } from "../custom-types";

class DeleteEchart implements IButtonMenu {
  readonly title = "删除";
  readonly iconSvg = TRASH_SVG;
  readonly tag = "button";

  getValue(editor: IDomEditor): string | boolean {
    // 无需获取 val
    return "";
  }

  isActive(editor: IDomEditor): boolean {
    // 无需 active
    return false;
  }

  isDisabled(editor: IDomEditor): boolean {
    if (editor.selection == null) return true;

    const echartNode = DomEditor.getSelectedNodeByType(editor, wangEditorEchartBarType);
    if (echartNode == null) {
      // 选区未处于 echart node ，则禁用
      return true;
    }
    return false;
  }

  exec(editor: IDomEditor, value: string | boolean) {
    if (this.isDisabled(editor)) return;

    // 删除图片
    Transforms.removeNodes(editor, {
      match: (n: any) => DomEditor.checkNodeType(n, wangEditorEchartBarType),
    });
  }
}

export default DeleteEchart;
