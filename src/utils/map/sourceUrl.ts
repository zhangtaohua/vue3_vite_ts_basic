import starwizMapConfig from "@/common/mapKeys";
import { mapKeys } from "./geoConstant";

const tiandituKey = starwizMapConfig
  ? starwizMapConfig.tiandituKey
    ? starwizMapConfig.tiandituKey
    : mapKeys.tiandituKey
  : mapKeys.tiandituKey;

export const mapXYZUrl = {
  /**
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

  aMap_cs_img: "http://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
  aMap_cs_vec: "http://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
  aMap_cs_roadLabel: "http://webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}",
  aMap_subdomains: ["1", "2", "3", "4"],

  aMap_img_single: "http://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
  aMap_vec_single: "http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
  aMap_roadLabel_single: "http://webst01.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}",
  // url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}'

  /**
   * 天地图 要key的
   * _w 球面墨卡托投影 _c 经纬度投影
   * 一般 maximumLevel : 18
   * vec——矢量街道底图
   * img——影像底图
   * ter——地形底图
   * ----------
   * cta——地形标注
   * cva——矢量中文注记
   * cia——影像中文注记 ---roadLabel
   * eva——矢量英文标注 ---roadLabel
   * eia——影像英文注记 ---roadLabel
   * ibo——国界       // maximumLevel : 10
   */
  // https://t{s}.tianditu.gov.cn/
  tiandi_lnglat_vec: `http://t{0-7}.tianditu.gov.cn/DataServer?T=vec_c&x={x}&y={y}&l={z}&tk=${tiandituKey}`,
  tiandi_lnglat_vec_zh_label: `http://t{0-7}.tianditu.gov.cn/DataServer?T=cva_c&x={x}&y={y}&l={z}&tk=${tiandituKey}`,
  tiandi_lnglat_vec_en_label: `http://t{0-7}.tianditu.gov.cn/DataServer?T=eva_c&x={x}&y={y}&l={z}&tk=${tiandituKey}`,

  tiandi_lnglat_img: `http://t{0-7}.tianditu.gov.cn/DataServer?T=img_c&x={x}&y={y}&l={z}&tk=${tiandituKey}`,
  tiandi_lnglat_img_zh_label: `http://t{0-7}.tianditu.gov.cn/DataServer?T=cia_c&x={x}&y={y}&l={z}&tk=${tiandituKey}`,
  tiandi_lnglat_img_en_label: `http://t{0-7}.tianditu.gov.cn/DataServer?T=eia_c&x={x}&y={y}&l={z}&tk=${tiandituKey}`,

  tiandi_spm_vec: `http://t{0-7}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${tiandituKey}`,
  tiandi_spm_vec_zh_label: `http://t{0-7}.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${tiandituKey}`,
  tiandi_spm_vec_en_label: `http://t{0-7}.tianditu.gov.cn/DataServer?T=eva_w&x={x}&y={y}&l={z}&tk=${tiandituKey}`,

  tiandi_spm_img: `http://t{0-7}.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${tiandituKey}`,
  tiandi_spm_img_zh_label: `http://t{0-7}.tianditu.gov.cn/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=${tiandituKey}`,
  tiandi_spm_img_en_label: `http://t{0-7}.tianditu.gov.cn/DataServer?T=eia_w&x={x}&y={y}&l={z}&tk=${tiandituKey}`,

  tiandi_lnglat_ter: `http://t{0-7}.tianditu.gov.cn/DataServer?T=ter_c&x={x}&y={y}&l={z}&tk=${tiandituKey}`,
  tiandi_lnglat_ter_label: `http://t{0-7}.tianditu.gov.cn/DataServer?T=cta_c&x={x}&y={y}&l={z}&tk=${tiandituKey}`,

  tiandi_spm_ter: `http://t{0-7}.tianditu.gov.cn/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=${tiandituKey}`,
  tiandi_spm_ter_label: `http://t{0-7}.tianditu.gov.cn/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=${tiandituKey}`,

  tiandi_lnglat_ibo: `http://t{0-7}.tianditu.gov.cn/DataServer?T=ibo_c&x={x}&y={y}&l={z}&tk=${tiandituKey}`,

  tiandi_spm_ibo: `http://t{0-7}.tianditu.gov.cn/DataServer?T=ibo_w&x={x}&y={y}&l={z}&tk=${tiandituKey}`,

  //  cesium 要使用 t{s} 来识别
  tiandi_cs_lnglat_vec: `http://t{s}.tianditu.gov.cn/DataServer?T=vec_c&x={x}&y={y}&l={z}&tk=${tiandituKey}`,
  tiandi_cs_lnglat_vec_zh_label: `http://t{s}.tianditu.gov.cn/DataServer?T=cva_c&x={x}&y={y}&l={z}&tk=${tiandituKey}`,
  tiandi_cs_lnglat_vec_en_label: `http://t{s}.tianditu.gov.cn/DataServer?T=eva_c&x={x}&y={y}&l={z}&tk=${tiandituKey}`,

  tiandi_cs_lnglat_img: `http://t{s}.tianditu.gov.cn/DataServer?T=img_c&x={x}&y={y}&l={z}&tk=${tiandituKey}`,
  tiandi_cs_lnglat_img_zh_label: `http://t{s}.tianditu.gov.cn/DataServer?T=cia_c&x={x}&y={y}&l={z}&tk=${tiandituKey}`,
  tiandi_cs_lnglat_img_en_label: `http://t{s}.tianditu.gov.cn/DataServer?T=eia_c&x={x}&y={y}&l={z}&tk=${tiandituKey}`,

  tiandi_cs_spm_vec: `http://t{s}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${tiandituKey}`,
  tiandi_cs_spm_vec_zh_label: `http://t{s}.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=${tiandituKey}`,
  tiandi_cs_spm_vec_en_label: `http://t{s}.tianditu.gov.cn/DataServer?T=eva_w&x={x}&y={y}&l={z}&tk=${tiandituKey}`,

  tiandi_cs_spm_img: `http://t{s}.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${tiandituKey}`,
  tiandi_cs_spm_img_zh_label: `http://t{s}.tianditu.gov.cn/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=${tiandituKey}`,
  tiandi_cs_spm_img_en_label: `http://t{s}.tianditu.gov.cn/DataServer?T=eia_w&x={x}&y={y}&l={z}&tk=${tiandituKey}`,

  tiandi_cs_lnglat_ter: `http://t{s}.tianditu.gov.cn/DataServer?T=ter_c&x={x}&y={y}&l={z}&tk=${tiandituKey}`,
  tiandi_cs_lnglat_ter_label: `http://t{s}.tianditu.gov.cn/DataServer?T=cta_c&x={x}&y={y}&l={z}&tk=${tiandituKey}`,

  tiandi_cs_spm_ter: `http://t{s}.tianditu.gov.cn/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=${tiandituKey}`,
  tiandi_cs_spm_ter_label: `http://t{s}.tianditu.gov.cn/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=${tiandituKey}`,

  tiandi_cs_lnglat_ibo: `http://t{s}.tianditu.gov.cn/DataServer?T=ibo_c&x={x}&y={y}&l={z}&tk=${tiandituKey}`,

  tiandi_cs_spm_ibo: `http://t{s}.tianditu.gov.cn/DataServer?T=ibo_w&x={x}&y={y}&l={z}&tk=${tiandituKey}`,

  tiandi_subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],

  /**
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
  /**
   * Google
   * m 街道
   * s 影像
   */
  google_vec: "http://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}",
  google_img: "http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}",
  google_maps: "https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}",
  google_terrain: "https://mt1.google.com/vt/lyrs=t&x={x}&y={y}&z={z}",
  google_roads: "https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}",
  google_satellite: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  google_streets: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",

  cartocdn_dark_nolabel: "http://basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png",
  cartocdn_light_nolabels: "http://basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
  cartocdn_voyager_nolabels: "https://basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png",

  esri_world_imagery: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  esri_world_streets:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
  esri_world_light_gray_base:
    "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  esri_world_topo_map: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",

  memomaps_tilegen: "http://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png",

  openstreetmap: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  openstreetmap_br: "https://tile.openstreetmap.bzh/br/{z}/{x}/{y}.png",
  openstreetmap_cyclosm: "https://a.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png",
  openstreetmap_hot: "https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
  openstreetmap_cycle: "http://tile.thunderforest.com/cycle/{z}/{x}/{y}.png",
  wmflabs_bw_mapnik: "http://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png",

  stamen_terrain: "http://a.tile.stamen.com/terrain/{z}/{x}/{y}.png",
  stamen_terrain_background: "http//a.tile.stamen.com/terrain-background/{z}/{x}/{y}.png",
  stamen_terrain_high: "http://a.tile.stamen.com/terrain/{z}/{x}/{y}@2x.png", // 高清
  stamen_watercolor: "https://stamen-tiles-c.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg",
  stamen_watercolor2: "http://a.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg",

  thunderforest_cycle: "https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=",
  thunderforest_pioneer: "https://tile.thunderforest.com/pioneer/{z}/{x}/{y}.png?apikey=",

  carto_positron: "https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",

  /**
   * MapTiler
   */
  mapTiler: "'https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=Nnf5WLkCvc7B6d5i5PSw'",

  mapBox_online: "https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=<mapbox key>",

  mapbox_local_basic: "/map/styles/basic/{z}/{x}/{y}.png",
  mapbox_local_allblue: "/map/styles/allblue/{z}/{x}/{y}.png",
  mapbox_local_low_pixel_satellite: "/map/styles/satelliteofflinestyle/{z}/{x}/{y}.png",
  mapbox_local_dark: "/map/styles/dark/{z}/{x}/{y}.png",
  mapbox_local_darklight: "/map/styles/darklight/{z}/{x}/{y}.png",
};

// http://lbs.tianditu.gov.cn/
// http://lbs.tianditu.gov.cn/server/MapService.html
// [t0-t7]
export const mapWMTSUrl = {
  tiandi_lnglat_vec: `http://t0.tianditu.com/vec_c/wmts?tk=${tiandituKey}`, //
  tiandi_lnglat_vec_zh_label: `http://t0.tianditu.com/cva_c/wmts?tk=${tiandituKey}`, //
  tiandi_lnglat_vec_en_label: `http://t0.tianditu.com/eva_c/wmts?&tk=${tiandituKey}`, //

  tiandi_lnglat_img: `http://t0.tianditu.com/img_c/wmts?tk=${tiandituKey}`, //
  tiandi_lnglat_img_zh_label: `http://t0.tianditu.com/cia_c/wmts?tk=${tiandituKey}`, //
  tiandi_lnglat_img_en_label: `http://t0.tianditu.com/eia_c/wmts?tk=${tiandituKey}`, //

  tiandi_spm_vec: `http://t0.tianditu.com/vec_w/wmts?tk=${tiandituKey}`, //
  tiandi_spm_vec_zh_label: `http://t0.tianditu.com/cva_w/wmts?tk=${tiandituKey}`, //
  tiandi_spm_vec_en_label: `http://t0.tianditu.com/eva_w/wmts?&tk=${tiandituKey}`, //

  tiandi_spm_img: `http://t0.tianditu.com/img_w/wmts?tk=${tiandituKey}`, //
  tiandi_spm_img_zh_label: `http://t0.tianditu.com/cia_w/wmts?tk=${tiandituKey}`, //
  tiandi_spm_img_en_label: `http://t0.tianditu.com/eia_w/wmts?tk=${tiandituKey}`, //

  tiandi_3d_label: `https://t0.tianditu.gov.cn/mapservice/GetTiles?tk=${tiandituKey}`, // 三维地名
  tiandi_3d_terrain: `https://t0.tianditu.gov.cn/mapservice/swdx?tk=${tiandituKey}`, // 三维地形

  tiandi_sp_img_full: `http://t0.tianditu.com/img_w/wmts?service=wmts&tk=${tiandituKey}&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles`,
  tiandi_sp_img_zh_label_full: `http://t0.tianditu.com/cia_w/wmts?service=wmts&tk=${tiandituKey}&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg`,
  tiandi_sp_img_en_label_full: `http://t0.tianditu.com/eia_w/wmts?service=wmts&tk=${tiandituKey}&request=GetTile&version=1.0.0&LAYER=eia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg`,

  mapbox: "https://api.mapbox.com/styles/v1/mapbox/streets-v11/wmts?access_token=YOURKEY",
};

export const mapboxLocalStyle = {
  basic: "/map/styles/basic/style.json",
  all_blue: "/map/styles/allblue/style.json",
  lowPixelSatellite: "/map/styles/satelliteofflinestyle/style.json",
  dark: "/map/styles/dark/style.json",
  darkLight: "/map/styles/darklight/style.json",
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
  CollinsBart: "CollinsBart",
};

export const bingMapCsBaseUrl = "https://dev.virtualearth.net";
// export const googleEarthCsBaseUrl = "https://earth.google.com/";
export const googleEarthCsBaseUrl = "http://www.google.cn/maps/vt?lyrs=s@189";
export const OsmCsBaseUrl = "https://a.tile.openstreetmap.org/";
export const OsmStamenMapsCsBaseUrl = "https://stamen-tiles.a.ssl.fastly.net/watercolor/";
