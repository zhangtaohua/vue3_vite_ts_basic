/**
 * @description module entry
 * @author RJ(zthvivid@163.com)
 */

import { IModuleConf } from "@wangeditor/editor";

import withPagination from "./plugin";
import renderElemConf from "./render-elem";
import elemToHtmlConf from "./elem-to-html";
import parseHtmlConf from "./parse-elem-html";

const module: Partial<IModuleConf> = {
  editorPlugin: withPagination,
  renderElems: [renderElemConf],
  elemsToHtml: [elemToHtmlConf],
  parseElemsHtml: [parseHtmlConf],
};

export default module;
