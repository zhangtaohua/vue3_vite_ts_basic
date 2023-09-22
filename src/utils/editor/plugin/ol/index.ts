/**
 * @description module entry
 * @author RJ(zthvivid@163.com)
 */

import { IModuleConf } from "@wangeditor/editor";

import "./local"; // 多语言

import withOlMap from "./plugin";
import renderElemConf from "./render-elem";
import elemToHtmlConf from "./elem-to-html";
import parseHtmlConf from "./parse-elem-html";
import { OlMapModalMenuConf } from "./menu/olModalMenu";

const module: Partial<IModuleConf> = {
  editorPlugin: withOlMap,
  renderElems: [renderElemConf],
  elemsToHtml: [elemToHtmlConf],
  parseElemsHtml: [parseHtmlConf],
  menus: [OlMapModalMenuConf],
};

export default module;
