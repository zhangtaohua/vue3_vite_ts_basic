/**
 * @description editor echart menu
 * @author RJ(zthvivid@163.com)
 */

import { Node, Range } from "slate";
import { IButtonMenu, IDomEditor, DomEditor, genModalInputElems, genModalButtonElems, t } from "@wangeditor/core";
import { createApp } from "vue";
import { nanoid } from "nanoid";

import { PENCIL_SVG } from "../../../../common/constant";
import { A4EditorWidthPixel } from "../../../../common/constant";
import { wangEditorEchartLineType, EchartLineElement } from "../custom-types";

class EditEchat implements IButtonMenu {
  id = `edit-modal-${nanoid(5)}`;
  title: string;
  iconSvg?: string;
  tag: string;
  vueNode: any;
  $vuePanrentEle: HTMLDivElement;
  $root: any;
  isInit = false;
  editor: any;

  constructor(title = "编辑", vueNode: any) {
    console.log("EditEchat init");
    this.title = title;
    this.iconSvg = PENCIL_SVG;
    this.tag = "button";
    this.vueNode = vueNode;

    this.$vuePanrentEle = document.createElement("div");
    this.$vuePanrentEle.id = this.id;
    document.body.appendChild(this.$vuePanrentEle);
  }

  destructor() {
    this.$root.showHideModal(false);
    document.body.removeChild(this.$vuePanrentEle);
  }

  public showHideModal(isShow: boolean) {
    if (isShow) {
      this.$root.showModal(this.editor);
    } else {
      this.$root.hideModal();
    }
  }

  private getEchartNode(editor: IDomEditor): Node | null {
    return DomEditor.getSelectedNodeByType(editor, wangEditorEchartLineType);
  }

  // 获取菜单执行时的 value ，用不到则返回空 字符串或 false
  public getValue(editor: IDomEditor) {
    // console.log("BaseModalMenu getValue", editor, this.$root);
    this.editor = editor;
    return false;
  }

  // 菜单是否需要激活（如选中加粗文本，“加粗”菜单会激活），用不到则返回 false
  public isActive(editor: IDomEditor): boolean {
    return false; // or false
  }

  // 菜单是否需要禁用（如选中 H1 ，“引用”菜单被禁用），用不到则返回 false
  public isDisabled(editor: IDomEditor) {
    return false; // or true
  }

  // 点击菜单时触发的函数
  public exec(editor: IDomEditor, value: any) {
    this.editor = editor;
    if (this.isDisabled(editor)) {
      return;
    }
    const selectedEchartNode = this.getEchartNode(editor);
    if (selectedEchartNode == null) return;
    const { title = "", name = "", chart = null, style = {} } = selectedEchartNode as EchartLineElement;
    const { width = "", height = "" } = style;

    const lineStyle: any = {};
    if (width) {
      lineStyle.width = width;
    } else {
      lineStyle.width = Math.floor(A4EditorWidthPixel * 0.965) + "px";
    }

    if (height) {
      lineStyle.height = height;
    } else {
      lineStyle.height = Math.floor(A4EditorWidthPixel * 0.965) + "px";
    }

    const vueNodeData = {
      title,
      name,
      lineStyle,
      editor,
      chartData: chart,
      isEdit: true,
    };

    const vueInstance = createApp(this.vueNode, vueNodeData);
    this.$root = vueInstance.mount(this.$vuePanrentEle);

    this.showHideModal(true);
  }
}

export default EditEchat;
