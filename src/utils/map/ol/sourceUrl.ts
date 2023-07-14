import starwizMapConfig from "@/common/mapKeys";
import { mapKeys } from "../geoConstant";

const tiandituKey = starwizMapConfig
  ? starwizMapConfig.tiandituKey
    ? starwizMapConfig.tiandituKey
    : mapKeys.tiandituKey
  : mapKeys.tiandituKey;

export const mapXYZUrl = {
  /****
   * 高德地图
   * lang可以通过zh_cn设置中文，en设置英文，size基本无作用，scl设置标注还是底图，scl=1代表注记，
   * scl=2代表底图（矢量或者影像），style设置影像和路网，style=6为影像图，
   * vec——街道底图
   * img——影像底图
   * roadLabel---路网+标注
   */
  aMap_img: "http://webst0{1-4}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
  aMap_vec: "http://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
  aMap_roadLabel: "http://webst0{1-4}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}",
  // url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'
  /***
   * 天地图 要key的
   * vec——街道底图
   * img——影像底图
   * ter——地形底图
   * cva——中文注记
   * cta/cia——道路+中文注记 ---roadLabel
   */
  tiandi_img: `http://t{0-7}.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${tiandituKey}`,
  tiandi_img_roadLabel: `http://t{0-7}.tianditu.gov.cn/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=${tiandituKey}`,
  tiandi_img_label: `http://t{0-7}.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${tiandituKey}`,
  tiandi_img_vec: `http://t{0-7}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${tiandituKey}`,
  tiandi_img_ter: `http://t{0-7}.tianditu.gov.cn/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=${tiandituKey}`,
  /***
   *geoq地图
   * http://cache1.arcgisonline.cn
   * http://map.geoq.cn
   * vec：标准彩色地图
   * gray、blue、warm
   * line 中国轮廓图
   * china 中国轮廓图+标注
   * Hydro 水系
   * green 植被
   */
  geoq_vec: "http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}",
  geoq_gray: "http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetGray/MapServer/tile/{z}/{y}/{x}",
  geoq_blue:
    "http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
  geoq_warm: "http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetWarm/MapServer/tile/{z}/{y}/{x}",
  geoq_line:
    "http://cache1.arcgisonline.cn/arcgis/rest/services/SimpleFeature/ChinaBoundaryLine/MapServer/tile/{z}/{y}/{x}", //不稳定
  geoq_china:
    "http://thematic.geoq.cn/arcgis/rest/services/ThematicMaps/administrative_division_boundaryandlabel/MapServer/tile/{z}/{y}/{x}", //不稳定
  geoq_Hydro: "http://thematic.geoq.cn/arcgis/rest/services/ThematicMaps/WorldHydroMap/MapServer/tile/{z}/{y}/{x}", //不稳定
  geoq_green: "http://thematic.geoq.cn/arcgis/rest/services/ThematicMaps/vegetation/MapServer/tile/{z}/{y}/{x}", //不稳定
  /***
   * Google
   * m 街道
   * s 影像
   */
  google_vec: "http://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}",
  google_img: "http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}",
  /***
   * MapTiler
   */
  mapTiler: "'https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=Nnf5WLkCvc7B6d5i5PSw'",
};

export const mapWMTSUrl = {
  tiandi_img: `http://t0.tianditu.com/img_c/wmts?tk=${tiandituKey}`,
  tiandi_ZhCNlabel: `http://t0.tianditu.com/cva_c/wmts?tk=${tiandituKey}`,
  tiandi_ZhTWlabel: `http://t0.tianditu.com/cva_c/wmts?tk=${tiandituKey}`, // cia_c
  tiandi_Enlabel: `http://t0.tianditu.com/eva_c/wmts?&tk=${tiandituKey}`, // eia_c
};

export const mapboxLocalStyle = {
  basic: "/map/styles/basic/style.json",
  all_blue: "/map/styles/allblue/style.json",
};

export const bingmapImagerySet = {
  Aerial: "Aerial",
  AerialWithLabels: "AerialWithLabels",
  AerialWithLabelsOnDemand: "AerialWithLabelsOnDemand",
  Birdseye: "Birdseye",
  BirdseyeWithLabels: "BirdseyeWithLabels",
  BirdseyeV2: "BirdseyeV2",
  BirdseyeV2WithLabels: "BirdseyeV2WithLabels",
  CanvasDark: "CanvasDark",
  CanvasLight: "CanvasLight",
  CanvasGray: "CanvasGray",
  OrdnanceSurvey: "OrdnanceSurvey",
  Road: "Road",
  RoadOnDemand: "RoadOnDemand",
  Streetside: "Streetside",
};
