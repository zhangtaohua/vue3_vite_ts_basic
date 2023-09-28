/**
 * @description Echart width 100%
 * @author RJ(zthvivid@163.com)
 */

import EchartWidthBaseClass from "./WidthBase";
import { A4EditorWidthPixel } from "../../../../common/constant";

class EchartWidth70 extends EchartWidthBaseClass {
  readonly title = "70%"; // 菜单标题
  readonly value = Math.floor(A4EditorWidthPixel * 0.7) + "px"; // css width 的值
}

export default EchartWidth70;
