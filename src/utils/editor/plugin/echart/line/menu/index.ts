/**
 * @description echart menu entry
 * @author RJ(zthvivid@163.com)
 */

import DeleteEchart from "./DeleteEchart";
import EditEchat from "./EditEchat";
import EchartWidth30 from "./Width30";
import EchartWidth50 from "./Width50";
import EchartWidth70 from "./Width70";
import EchartWidth100 from "./Width100";
import EchartHeightPlus from "./HeightPlus";
import EchartHeightMinus from "./HeightMinus";
import EchartWidthPlus from "./WidthPlus";
import EchartWidthMinus from "./WidthMinus";

import BaseModalMenu from "../../../modalMenu/baseModalMenu";

import EchartsLine from "./EchartsLine.vue";

export const EchartLineMenuKey = "EchartLineMenuConf";

export const EchartLineMenuConf = {
  key: EchartLineMenuKey,
  factory() {
    return new BaseModalMenu("拆线图", EchartsLine, {
      isEdit: false,
    });
  },
};

export const DeleteEchartMenuKey = "DeleteEchartLine";

export const DeleteEchartMenuConf = {
  key: DeleteEchartMenuKey,
  factory() {
    return new DeleteEchart();
  },
};

export const EditEchartMenuKey = "editEchartLine";

export const EditEchartMenuConf = {
  key: EditEchartMenuKey,
  factory() {
    return new EditEchat("编辑", EchartsLine);
  },
};

export const Width30EchartMenuKey = "EchartLineWidth30";

export const Width30EchartMenuConf = {
  key: Width30EchartMenuKey,
  factory() {
    return new EchartWidth30();
  },
};

export const Width50EchartMenuKey = "EchartLineWidth50";

export const Width50EchartMenuConf = {
  key: Width50EchartMenuKey,
  factory() {
    return new EchartWidth50();
  },
};

export const Width70EchartMenuKey = "EchartLineWidth70";

export const Width70EchartMenuConf = {
  key: Width70EchartMenuKey,
  factory() {
    return new EchartWidth70();
  },
};

export const Width100EchartMenuKey = "EchartLineWidth100";

export const Width100EchartMenuConf = {
  key: Width100EchartMenuKey,
  factory() {
    return new EchartWidth100();
  },
};

export const HeightPlusEchartMenuKey = "EchartLineHeightPlus";

export const HeightPlusEchartMenuConf = {
  key: HeightPlusEchartMenuKey,
  factory() {
    return new EchartHeightPlus();
  },
};

export const HeightMinusEchartMenuKey = "EchartLineHeightMinus";

export const HeightMinusEchartMenuConf = {
  key: HeightMinusEchartMenuKey,
  factory() {
    return new EchartHeightMinus();
  },
};

export const WidthPlusEchartMenuKey = "EchartLineWidthPlus";

export const WidthPlusEchartMenuConf = {
  key: WidthPlusEchartMenuKey,
  factory() {
    return new EchartWidthPlus();
  },
};

export const WidthMinusEchartMenuKey = "EchartLineWidthMinus";

export const WidthMinusEchartMenuConf = {
  key: WidthMinusEchartMenuKey,
  factory() {
    return new EchartWidthMinus();
  },
};
