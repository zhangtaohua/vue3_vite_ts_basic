/**
 * @description module entry
 * @author RJ(zthvivid@163.com)
 */

import { IModuleConf } from "@wangeditor/editor";

import withEchartLine from "./plugin";
import renderElemConf from "./render-elem";
import elemToHtmlConf from "./elem-to-html";
import parseHtmlConf from "./parse-elem-html";
import {
  EchartLineMenuConf,
  DeleteEchartMenuConf,
  EditEchartMenuConf,
  Width30EchartMenuConf,
  Width50EchartMenuConf,
  Width70EchartMenuConf,
  Width100EchartMenuConf,
  HeightPlusEchartMenuConf,
  HeightMinusEchartMenuConf,
  WidthPlusEchartMenuConf,
  WidthMinusEchartMenuConf,
} from "./menu/index";

const module: Partial<IModuleConf> = {
  editorPlugin: withEchartLine,
  renderElems: [renderElemConf],
  elemsToHtml: [elemToHtmlConf],
  parseElemsHtml: [parseHtmlConf],
  menus: [
    EchartLineMenuConf,
    DeleteEchartMenuConf,
    EditEchartMenuConf,
    Width30EchartMenuConf,
    Width50EchartMenuConf,
    Width70EchartMenuConf,
    Width100EchartMenuConf,
    HeightPlusEchartMenuConf,
    HeightMinusEchartMenuConf,
    WidthPlusEchartMenuConf,
    WidthMinusEchartMenuConf,
  ],
};

export default module;
