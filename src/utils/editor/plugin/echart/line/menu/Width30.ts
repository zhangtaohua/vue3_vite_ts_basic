/**
 * @description Echart width 100%
 * @author RJ(zthvivid@163.com)
 */

import EchartWidthBaseClass from "./WidthBase";
import { A4EditorWidthPixel } from "../../../../common/constant";

class EchartWidth30 extends EchartWidthBaseClass {
  readonly title = "30%"; // 菜单标题
  readonly value = Math.floor(A4EditorWidthPixel * 0.3) + "px"; // css width 的值
}

export default EchartWidth30;
