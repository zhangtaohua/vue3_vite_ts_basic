export const earthExtent = [-180, -90, 180, 90];
// export const earthExtent = [-180, -85, 180, 85];

export const defaultMapOptions = {
  longitude: 116.46,
  latitude: 39.92,
  zoom: 3,
  rotate: 0,
};

export const mapKeys = {
  tiandituKey: "e3af6e89f787c2469373e3aea76f4d36", // 347521453441f82bd83c6f0b15240e50
  bingmapKey: "An3um101KtrOtoBcI1_idMgkwRFICf6bd0UUNtoA3YNRCNv-nvYjL5RWhI8J5U2_",
};

export const popupType = {
  normal: "normal",
  vnode: "vueNodes",
};

export const MAP_INTER_ZOOMIN = "zoomin";
export const MAP_INTER_ZOOMOUT = "zoomout";

export const isCustomizeFlag = "customize";
export const customMeta = "customMeta";
export const isCustomOldDrawData = "isCustomOldDrawData";

// 不要改下面的名字，不然可能导致画不成功图形
export const MAP_DRAW_TEXT = "Text";
export const MAP_DRAW_POINT = "Point";
export const MAP_DRAW_SQUARE = "Square";
export const MAP_DRAW_RECTANGLE = "Rectangle";
export const MAP_DRAW_POLYGON = "Polygon";
export const MAP_DRAW_LINE = "LineString";
export const MAP_DRAW_CIRCLE = "Circle";
export const MAP_DRAW_GEOMETRY_CIRCLE = MAP_DRAW_CIRCLE;
export const MAP_DRAW_GEODESIC_CIRCLE = "GeodesicCircle";
export const MAP_DRAW_GEOMETRYCOLLECTION = "GeometryCollection";

export const MAP_DRAW_CLEAR = "Clear";

export const MAP_MEASURE_DISTANCE = "Distance";
export const MAP_MEASURE_AREA = "Area";
export const MAP_SELECT_DRAW_MODE = "SetDrawMode";

export const MAP_SHOW_PROPS = "ShowProps";
export const MAP_HIDDEN_PROPS = "HiddenProps";

export const drawModeType = {
  idle: "idle", //
  draw: "draw", // 绘制模式
  modify: "modify", // 修改模式
  edit: "edit", // 编辑模式
  delete: "delete", // 删除模式
};

export const drawActionType = {
  draw: "drawEnd",
  modify: "modifyEnd",
  edit: "editEnd",
  delete: "deleteEnd",
  complete: "complete",
};

export const geometryType = {
  point: "Point",
  polygon: "Polygon",
  geometryCollection: "GeometryCollection",
};

export const satelliteOrbitShowType = {
  expand: "expand",
  merge: "merge",
};
