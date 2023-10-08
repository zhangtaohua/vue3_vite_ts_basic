/**
 * @description module entry
 * @author RJ(zthvivid@163.com)
 */

import { IModuleConf } from "@wangeditor/editor";

import withEchartBar from "./plugin";
import renderElemConf from "./render-elem";
import elemToHtmlConf from "./elem-to-html";
import parseHtmlConf from "./parse-elem-html";
import {
  EchartBarMenuConf,
  DeleteEchartBarMenuConf,
  EditEchartBarMenuConf,
  Width30EchartBarMenuConf,
  Width50EchartBarMenuConf,
  Width70EchartBarMenuConf,
  Width100EchartBarMenuConf,
} from "./menu/index";

const module: Partial<IModuleConf> = {
  editorPlugin: withEchartBar,
  renderElems: [renderElemConf],
  elemsToHtml: [elemToHtmlConf],
  parseElemsHtml: [parseHtmlConf],
  menus: [
    EchartBarMenuConf,
    DeleteEchartBarMenuConf,
    EditEchartBarMenuConf,
    Width30EchartBarMenuConf,
    Width50EchartBarMenuConf,
    Width70EchartBarMenuConf,
    Width100EchartBarMenuConf,
  ],
};

export default module;
