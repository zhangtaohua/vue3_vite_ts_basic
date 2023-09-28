/**
 * @description editor image menu
 * @author RJ(zthvivid@163.com)
 */

import { createApp } from "vue";
import { nanoid } from "nanoid";
import { IButtonMenu, IDomEditor } from "@wangeditor/editor";
export default class BaseModalMenu implements IButtonMenu {
  id = `modal-${nanoid(5)}`;
  title: string;
  iconSvg?: string;
  tag: string;
  $vuePanrentEle: HTMLDivElement;
  $root: any;
  isInit = false;
  editor: any;

  constructor(title = "My Modal", vueNode: any, vueNodeData: any) {
    console.log("BaseModalMenu init");
    this.title = title;
    // this.iconSvg = '<svg >...</svg>'; icon
    this.tag = "button";

    this.$vuePanrentEle = document.createElement("div");
    this.$vuePanrentEle.id = this.id;
    document.body.appendChild(this.$vuePanrentEle);

    const vueInstance = createApp(vueNode, vueNodeData);
    this.$root = vueInstance.mount(this.$vuePanrentEle);
    console.log("BaseModalMenu done", this.$root, this.$root.$el, vueInstance);
  }

  public showHideModal(isShow: boolean) {
    if (isShow) {
      this.$root.showModal(this.editor);
    } else {
      this.$root.hideModal();
    }
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
    if (this.isDisabled(editor)) {
      return;
    }
    this.showHideModal(true);
  }
}
