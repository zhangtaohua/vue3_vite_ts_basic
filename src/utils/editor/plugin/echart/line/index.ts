/**
 * @description module entry
 * @author RJ(zthvivid@163.com)
 */

import { IModuleConf } from "@wangeditor/editor";

import withEchartLine from "./plugin";
import renderElemConf from "./render-elem";
import elemToHtmlConf from "./elem-to-html";
import parseHtmlConf from "./parse-elem-html";
import { EchartLineMenuConf } from "./menu/lineMenu";

const module: Partial<IModuleConf> = {
  editorPlugin: withEchartLine,
  renderElems: [renderElemConf],
  elemsToHtml: [elemToHtmlConf],
  parseElemsHtml: [parseHtmlConf],
  menus: [EchartLineMenuConf],
};

export default module;
