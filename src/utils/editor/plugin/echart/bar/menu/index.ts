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

import BaseModalMenu from "../../../modalMenu/baseModalMenu";

import EchartsBar from "./EchartsBar.vue";

export const EchartBarMenuKey = "EchartBarMenuConf";

export const EchartBarMenuConf = {
  key: EchartBarMenuKey,
  factory() {
    return new BaseModalMenu("柱状图", EchartsBar, {
      isEdit: false,
    });
  },
};

export const DeleteEchartBarMenuKey = "DeleteEchartBar";

export const DeleteEchartBarMenuConf = {
  key: DeleteEchartBarMenuKey,
  factory() {
    return new DeleteEchart();
  },
};

export const EditEchartBarMenuKey = "editEchartBar";

export const EditEchartBarMenuConf = {
  key: EditEchartBarMenuKey,
  factory() {
    return new EditEchat("编辑", EchartsBar);
  },
};

export const Width30EchartBarMenuKey = "EchartBarWidth30";

export const Width30EchartBarMenuConf = {
  key: Width30EchartBarMenuKey,
  factory() {
    return new EchartWidth30();
  },
};

export const Width50EchartBarMenuKey = "EchartBarWidth50";

export const Width50EchartBarMenuConf = {
  key: Width50EchartBarMenuKey,
  factory() {
    return new EchartWidth50();
  },
};

export const Width70EchartBarMenuKey = "EchartBarWidth70";

export const Width70EchartBarMenuConf = {
  key: Width70EchartBarMenuKey,
  factory() {
    return new EchartWidth70();
  },
};

export const Width100EchartBarMenuKey = "EchartBarWidth100";

export const Width100EchartBarMenuConf = {
  key: Width100EchartBarMenuKey,
  factory() {
    return new EchartWidth100();
  },
};
